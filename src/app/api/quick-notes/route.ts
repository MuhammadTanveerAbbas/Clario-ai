import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { checkUsageLimit } from '@/lib/usage-limits'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Note content required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check usage limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single()

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro'
    const currentUsage = profile?.requests_used_this_month || 0
    
    // Unlimited access for admin
    if (profile?.email !== 'muhammadtanveerabbas.dev@gmail.com') {
      const usageCheck = checkUsageLimit(tier, currentUsage)
      if (!usageCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Usage limit reached',
            message: `You've reached your ${tier} plan limit of ${usageCheck.limit} requests per month. Please upgrade to continue.`,
          },
          { status: 403 }
        )
      }
    }

    // AI categorizes and summarizes the note
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Categorize this note and provide a brief summary. Return JSON: {category: string, summary: string, tags: string[]}'
        },
        {
          role: 'user',
          content: content
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 500,
    })

    let aiResponse = completion.choices[0]?.message?.content || '{}'

    // Extract JSON from markdown if present
    const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      aiResponse = jsonMatch[1].trim()
    }

    const { category = 'General', summary = content.substring(0, 100), tags = [] } = JSON.parse(aiResponse)

    // Save note
    const { data: note, error } = await supabase
      .from('quick_notes')
      .insert({
        user_id: user.id,
        content: content,
        category: category,
        summary: summary,
        tags: tags,
      })
      .select()
      .single()

    if (error) throw error

    // Track usage (note: quick_notes may not be tracked in usage_stats)
    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'note',
      p_count: 1,
    })

    if (trackError) {
      console.error("Failed to track usage for quick note:", trackError)
      // Continue even if tracking fails - don't break the user's request
    }

    return NextResponse.json({ note })
  } catch (error: any) {
    console.error('Quick notes error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save note' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = supabase
      .from('quick_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`content.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    const { data: notes, error } = await query.limit(50)

    if (error) throw error

    return NextResponse.json({ notes })
  } catch (error: any) {
    console.error('Quick notes fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('quick_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Quick notes delete error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete note' }, { status: 500 })
  }
}
