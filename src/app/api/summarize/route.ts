import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeInput } from '@/lib/security'
import { checkUsageLimit } from '@/lib/usage-limits'

export async function POST(request: Request) {
  try {
    const req = new Request(request.url, {
      method: request.method,
      headers: request.headers,
    })

    // Rate limiting
    const rateLimitCheck = checkRateLimit(req as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    const { text, mode } = await request.json()

    if (!text || !mode) {
      return NextResponse.json({ error: 'Text and mode are required' }, { status: 400 })
    }

    // Sanitize input
    const sanitizedText = sanitizeInput(text)

    if (sanitizedText.length < 10) {
      return NextResponse.json({ error: 'Text must be at least 10 characters' }, { status: 400 })
    }

    // Get user and check usage limits
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user tier
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const tier = (userData?.subscription_tier || 'free') as 'free' | 'pro' | 'premium'

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: usageData } = await supabase
      .from('usage_stats')
      .select('summaries_count')
      .eq('user_id', user.id)
      .like('date', `${currentMonth}%`)
      .single()

    const currentUsage = usageData?.summaries_count || 0
    const usageCheck = checkUsageLimit(tier, 'summaries', currentUsage)

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit reached',
          message: `You've reached your ${tier} tier limit of ${usageCheck.limit} summaries per month. Please upgrade to continue.`,
        },
        { status: 403 }
      )
    }

    // Call existing summarize API (Genkit/Gemini)
    const genkitResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: sanitizedText, mode }),
    })

    if (!genkitResponse.ok) {
      const error = await genkitResponse.json()
      throw new Error(error.error || 'Failed to generate summary')
    }

    const { summary } = await genkitResponse.json()

    // Save to database
    await supabase.from('ai_summaries').insert({
      user_id: user.id,
      summary_text: summary,
      original_text: sanitizedText.substring(0, 10000), // Store first 10k chars
      mode,
    })

    // Update usage stats
    await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'summary',
      p_count: 1,
    })

    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Summarize API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
