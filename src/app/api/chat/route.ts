import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeAndValidate } from '@/lib/input-validation'
import { checkUsageLimit } from '@/lib/usage-limits'
import { generateWithFallback } from '@/lib/ai-fallback'
import { z } from 'zod'

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const ChatSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().nullable().optional(),
  history: z
    .array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(10000),
    }))
    .max(20)
    .optional(),
  brandVoice: z.string().optional(),
})

const SYSTEM_PROMPT = `You are Clario, an expert AI assistant for content creators — YouTubers, podcasters, bloggers, and newsletter writers.

Your expertise:
- Content strategy, ideation, and planning
- Writing hooks, titles, and descriptions that get clicks
- Platform-specific best practices (YouTube, Twitter/X, LinkedIn, TikTok, Instagram)
- Repurposing content across multiple formats
- Analyzing what makes content go viral
- SEO for content creators
- Audience growth and engagement tactics
- Monetization strategies

How you respond:
- Be direct and specific — give real examples, not vague advice
- Lead with the most actionable insight
- Use bullet points or numbered lists when listing multiple things
- Keep responses focused — don't pad with unnecessary caveats
- Reference current trends and what's working now
- When relevant, suggest using Clario's Summarizer or Remix Studio for content tasks
- Format with markdown when it improves readability (bold key terms, use lists)

Tone: Knowledgeable but conversational. Like a smart friend who happens to be a content expert.`

export async function POST(request: Request) {
  console.log('[Chat API] Request received');

  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    let body: unknown;
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const result = ChatSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.issues }, { status: 400 })
    }

    const { message, conversationId, history, brandVoice } = result.data

    const validation = sanitizeAndValidate(message, 10000)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const sanitizedMessage = validation.sanitized

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use consistent column names matching the profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, requests_used_this_month, email')
      .eq('id', user.id)
      .single()

    const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro'
    const currentUsage = profile?.requests_used_this_month || 0

    if (profile?.email !== process.env.ADMIN_EMAIL) {
      const usageCheck = checkUsageLimit(tier, currentUsage)
      if (!usageCheck.allowed) {
        return NextResponse.json({
          error: 'Usage limit reached',
          message: `You've used all ${usageCheck.limit} requests on your ${tier} plan. Upgrade to continue.`,
        }, { status: 403 })
      }
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Build system prompt with optional brand voice
    const systemPrompt = brandVoice
      ? `${SYSTEM_PROMPT}\n\n---\nACTIVE BRAND VOICE:\n${brandVoice}\nApply this brand voice style to your responses.`
      : SYSTEM_PROMPT

    // Build conversation context from history (last 12 messages for better context)
    const limitedHistory = (history || []).slice(-12)
    const historyText = limitedHistory
      .map(m => `${m.role === 'user' ? 'User' : 'Clario'}: ${m.content}`)
      .join('\n\n')

    const prompt = historyText
      ? `${historyText}\n\nUser: ${sanitizedMessage}`
      : sanitizedMessage

    let aiResponse: string;
    try {
      aiResponse = await generateWithFallback(prompt, systemPrompt, {
        model: 'llama-3.1-8b-instant',
        maxTokens: 1500,
        temperature: 0.7,
      })
    } catch (aiError: any) {
      console.error('[Chat API] AI error:', aiError.message);
      return NextResponse.json({ error: aiError.message || 'Failed to generate response' }, { status: 500 })
    }

    // Resolve or create chat session
    let finalConversationId = conversationId
    if (!finalConversationId) {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: sanitizedMessage.slice(0, 80) })
        .select('id')
        .single()
      if (sessionError) {
        console.error('[Chat API] Session create error:', sessionError.message)
      } else {
        finalConversationId = session.id
      }
    }

    // Save messages (non-blocking)
    if (finalConversationId) {
      supabase.from('chat_messages').insert([
        { session_id: finalConversationId, user_id: user.id, role: 'user', content: sanitizedMessage },
        { session_id: finalConversationId, user_id: user.id, role: 'assistant', content: aiResponse },
      ]).then(({ error }) => {
        if (error) console.error('[Chat API] Message insert error:', error.message)
      })
    }

    // Track usage (non-blocking) — use track_usage to match summarize/remix
    supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'chat',
      p_count: 1,
    }).then(({ error }) => {
      if (error) {
        // Fallback to increment_usage if track_usage doesn't exist
        supabase.rpc('increment_usage', { p_user_id: user.id, p_type: 'chat' })
          .then(({ error: e2 }) => { if (e2) console.error('[Chat API] Track usage error:', e2.message) })
      }
    })

    return NextResponse.json({ response: aiResponse, conversationId: finalConversationId })

  } catch (error: any) {
    console.error('[Chat API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
