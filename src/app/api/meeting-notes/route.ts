import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeInput } from '@/lib/security'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const req = new Request(request.url, {
      method: request.method,
      headers: request.headers,
    })

    const rateLimitCheck = checkRateLimit(req as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    const { title, rawNotes } = await request.json()

    if (!rawNotes) {
      return NextResponse.json({ error: 'Raw notes are required' }, { status: 400 })
    }

    const sanitizedNotes = sanitizeInput(rawNotes)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = (userData?.subscription_tier || 'free') as 'free' | 'pro' | 'premium'

    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: usageData } = await supabase
      .from('usage_stats')
      .select('meeting_notes_count')
      .eq('user_id', user.id)
      .like('date', `${currentMonth}%`)
      .single()

    const currentUsage = usageData?.meeting_notes_count || 0
    const limits = { free: 20, pro: 200, premium: Infinity }
    const limit = limits[tier]

    if (limit !== Infinity && currentUsage >= limit) {
      return NextResponse.json(
        { error: 'Usage limit reached', message: `You've reached your ${tier} tier limit of ${limit} meeting notes per month.` },
        { status: 403 }
      )
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a meeting notes assistant. Convert raw meeting notes into structured JSON with: summary (string), actionItems (array), keyPoints (array). Return ONLY the JSON object, no markdown, no code blocks.'
        },
        {
          role: 'user',
          content: sanitizedNotes
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1500,
    })

    let content = completion.choices[0]?.message?.content || '{}'
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      content = jsonMatch[1].trim()
    }
    
    // Remove any leading/trailing whitespace
    content = content.trim()
    
    const structuredNotes = JSON.parse(content)

    await supabase.from('meeting_notes').insert({
      user_id: user.id,
      title: title || 'Untitled Meeting',
      raw_notes: sanitizedNotes,
      structured_notes: structuredNotes,
    })

    await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'meeting',
      p_count: 1,
    })

    return NextResponse.json({ structuredNotes })
  } catch (error: any) {
    console.error('Meeting notes API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate notes' }, { status: 500 })
  }
}
