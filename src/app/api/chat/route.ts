import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeAndValidate } from '@/lib/input-validation'
import { checkUsageLimit } from '@/lib/usage-limits'
import { generateWithFallback } from '@/lib/ai-fallback'
import { z } from 'zod'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'

const ChatSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().nullable().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(10000),
      })
    )
    .max(20)
    .optional(),
})

export async function POST(request: Request) {
  console.log('[Chat API] Request received');
  
  try {
    // Check rate limit
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      console.log('[Chat API] Rate limit exceeded');
      return rateLimitCheck.response!
    }

    // Parse and validate body
    let body;
    try {
      body = await request.json()
    } catch (e) {
      console.error('[Chat API] JSON parse error:', e);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const result = ChatSchema.safeParse(body)
    if (!result.success) {
      console.error('[Chat API] Validation error:', result.error.issues);
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    const { message, conversationId, history } = result.data
    console.log('[Chat API] Message length:', message.length);
    
    // Sanitize input
    const validation = sanitizeAndValidate(message, 10000)
    if (!validation.valid) {
      console.error('[Chat API] Sanitization failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const sanitizedMessage = validation.sanitized

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[Chat API] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Chat API] User authenticated:', user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[Chat API] Profile fetch error:', profileError);
    }

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro'
    const currentUsage = profile?.requests_used_this_month || 0
    
    console.log('[Chat API] Usage:', currentUsage, 'Tier:', tier);

    // Check usage limits (skip for admin)
    if (profile?.email !== ADMIN_EMAIL) {
      const usageCheck = checkUsageLimit(tier, currentUsage)
      if (!usageCheck.allowed) {
        console.log('[Chat API] Usage limit reached');
        return NextResponse.json(
          {
            error: 'Usage limit reached',
            message: `You've reached your ${tier} plan limit of ${usageCheck.limit} requests per month. Please upgrade to continue.`,
          },
          { status: 403 }
        )
      }
    }

    // Check Groq API key
    if (!process.env.GROQ_API_KEY) {
      console.error('[Chat API] GROQ_API_KEY not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    console.log('[Chat API] Generating AI response...');

    const systemPrompt = `You are Clario, an AI assistant for content creators (YouTubers, podcasters, bloggers, newsletter writers).

Your expertise:
- Content strategy and ideation
- Hook writing and engagement tactics
- Platform-specific advice (YouTube, Twitter, LinkedIn, TikTok)
- Repurposing content across platforms
- Analyzing what makes content viral
- Improving titles, thumbnails, and descriptions

How you respond:
- Be specific and actionable
- Give examples when possible
- Focus on what works NOW (current trends)
- Suggest Clario's Summarizer for long content analysis
- Keep it practical, not theoretical`

    const limitedHistory = (history || []).slice(-10)
    const historyText = limitedHistory
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')

    const prompt = historyText
      ? `${historyText}\n\nUser: ${sanitizedMessage}`
      : sanitizedMessage

    let aiResponse: string;
    try {
      aiResponse = await generateWithFallback(prompt, systemPrompt, {
        model: 'llama-3.1-8b-instant',
        maxTokens: 1024,
        temperature: 0.7,
      })
      console.log('[Chat API] AI response generated, length:', aiResponse.length);
    } catch (aiError: any) {
      console.error('[Chat API] AI generation error:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate AI response', details: aiError.message },
        { status: 500 }
      )
    }

    const finalConversationId = conversationId || crypto.randomUUID?.()

    // Save to database
    const { error: insertError } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      conversation_id: finalConversationId,
      message: sanitizedMessage,
      response: aiResponse,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('[Chat API] Insert error:', insertError);
    }

    // Update usage stats
    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'chat',
      p_count: 1,
    })

    if (trackError) {
      console.error('[Chat API] Track usage error:', trackError);
    }

    console.log('[Chat API] Success');
    return NextResponse.json({ response: aiResponse, conversationId: finalConversationId })
  } catch (error: any) {
    console.error('[Chat API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
