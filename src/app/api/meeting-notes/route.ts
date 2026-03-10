import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeInput } from '@/lib/security'
import { generateWithFallback } from '@/lib/ai-fallback'
import { z } from 'zod'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'

const MeetingNotesSchema = z.object({
  notes: z.string().min(10).max(50000),
  title: z.string().min(1).max(200).optional(),
})

const MeetingOutputSchema = z.object({
  summary: z.string(),
  actionItems: z.array(z.string()),
  keyPoints: z.array(z.string()),
})

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

    const body = await request.json()
    const result = MeetingNotesSchema.safeParse({
      notes: body.rawNotes ?? body.notes,
      title: body.title,
    })
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    const { title, notes } = result.data
    const sanitizedNotes = sanitizeInput(notes)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single()

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro'
    const currentUsage = profile?.requests_used_this_month || 0
    const limit = tier === 'pro' ? 1000 : 100

    if (profile?.email !== ADMIN_EMAIL && currentUsage >= limit) {
      return NextResponse.json(
        { error: 'Usage limit reached', message: `You've reached your ${tier} plan limit of ${limit} requests per month. Please upgrade to continue.` },
        { status: 403 }
      )
    }

    const systemPrompt =
      'You are a meeting notes assistant. Convert raw meeting notes into structured JSON with: summary (string), actionItems (array of strings), keyPoints (array of strings). Return ONLY a valid JSON object, no markdown, no code blocks.'

    const rawContent = await generateWithFallback(
      sanitizedNotes,
      systemPrompt,
      { model: 'llama-3.3-70b-versatile', maxTokens: 2048, temperature: 0.5 }
    )

    let parsed: unknown
    try {
      const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonString = (match ? match[1] : rawContent).trim()
      parsed = JSON.parse(jsonString)
    } catch {
      const fallback = {
        summary: sanitizedNotes,
        actionItems: [] as string[],
        keyPoints: [] as string[],
      }
      return NextResponse.json({ structuredNotes: fallback })
    }

    const validated = MeetingOutputSchema.safeParse(parsed)
    if (!validated.success) {
      const fallback = {
        summary: sanitizedNotes,
        actionItems: [] as string[],
        keyPoints: [] as string[],
      }
      return NextResponse.json({ structuredNotes: fallback })
    }

    const structuredNotes = validated.data

    await supabase.from('meeting_notes').insert({
      user_id: user.id,
      title: title || 'Untitled Meeting',
      raw_notes: sanitizedNotes,
      structured_notes: structuredNotes,
    })

    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'meeting',
      p_count: 1,
    })

    if (trackError) {
      console.error("Failed to track usage:", trackError)
    }

    return NextResponse.json({ structuredNotes })
  } catch (error: any) {
    console.error('Meeting notes API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate notes' }, { status: 500 })
  }
}
