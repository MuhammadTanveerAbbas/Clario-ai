import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeInput } from '@/lib/security'
import { checkUsageLimit } from '@/lib/usage-limits'
import { generateWithFallback } from '@/lib/ai-fallback'
import { z } from 'zod'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'

const WritingSchema = z.object({
  text: z.string().min(10).max(50000),
  action: z.enum(['improve', 'rewrite', 'expand', 'summarize', 'grammar']),
  tone: z.enum(['professional', 'casual', 'formal', 'friendly', 'technical']),
})

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

    const body = await request.json()
    const result = WritingSchema.safeParse({
      text: body.content ?? body.text,
      action: body.action,
      tone: body.tone,
    })
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    const { text, tone, action } = result.data

    // Sanitize input
    const sanitizedContent = sanitizeInput(text)

    if (sanitizedContent.length < 10) {
      return NextResponse.json({ error: 'Content must be at least 10 characters' }, { status: 400 })
    }

    // Get user and check usage limits
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user tier and check limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single()

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro'
    const currentUsage = profile?.requests_used_this_month || 0
    
    if (profile?.email !== ADMIN_EMAIL) {
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

    const actionPrompts = {
      improve: `Improve the following text to make it more ${tone}. Keep the core message but enhance clarity, flow, and impact:`,
      rewrite: `Rewrite the following text in a ${tone} tone while maintaining the original meaning:`,
      expand: `Expand the following text with more details and examples in a ${tone} tone:`,
      summarize: `Summarize the following text in a ${tone} tone, keeping only the key points:`,
      grammar: `Fix grammar, spelling, and punctuation errors in the following text while maintaining a ${tone} tone:`
    }

    const systemPrompt =
      "You are an expert writing assistant for indie hackers and solo founders. Help improve, rewrite, and enhance text based on the user's requirements. Always maintain the original intent while improving clarity and style."

    const prompt = `${actionPrompts[action]} \n\n${sanitizedContent}`

    const improvedText = await generateWithFallback(prompt, systemPrompt, {
      model: 'llama-3.3-70b-versatile',
      maxTokens: 3000,
      temperature: 0.7,
    })

    // Save to database
    await supabase.from('writing_sessions').insert({
      user_id: user.id,
      original_text: sanitizedContent.substring(0, 5000),
      improved_text: improvedText,
      tone,
      action: action || 'improve',
    })

    // Update usage stats
    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'writing',
      p_count: 1,
    })

    if (trackError) {
      console.error("Failed to track usage:", trackError)
    }

    return NextResponse.json({ improvedText })
  } catch (error: any) {
    console.error('Writing assistance error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to improve text' },
      { status: 500 }
    )
  }
}
