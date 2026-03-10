import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeInput } from '@/lib/security'
import { checkUsageLimit } from '@/lib/usage-limits'
import { generateWithFallback } from '@/lib/ai-fallback'
import { z } from 'zod'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'

const ChatSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().uuid().optional(),
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
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    const body = await request.json()
    const result = ChatSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    const { message, conversationId, history } = result.data
    const sanitizedMessage = sanitizeInput(message)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

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

    const systemPrompt = `You are Clario, an AI powered productivity assistant for indie hackers and solo founders using the Clario Hub platform.

How You Respond:
- Be concise but helpful, focused on founder workflows
- Ask clarifying questions only when truly necessary
- When relevant, suggest which of the 4 tools (Summarizer, Chat, Writing, Meeting Notes) would be best next step.`

    const limitedHistory = (history || []).slice(-10)
    const historyText = limitedHistory
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')

    const prompt = historyText
      ? `${historyText}\n\nUser: ${sanitizedMessage}`
      : sanitizedMessage

    const aiResponse = await generateWithFallback(prompt, systemPrompt, {
      model: 'llama-3.1-8b-instant',
      maxTokens: 1024,
      temperature: 0.8,
    })

    const finalConversationId = conversationId || `conv-${crypto.randomUUID?.() || Date.now()}`

    await supabase.from('chat_messages').insert({
      user_id: user.id,
      conversation_id: finalConversationId,
      message: sanitizedMessage,
      response: aiResponse,
      created_at: new Date().toISOString(),
    })

    // Update usage stats
    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'chat',
      p_count: 1,
    })

    if (trackError) {
      console.error('Failed to track usage:', trackError)
    }

    return NextResponse.json({ response: aiResponse, conversationId: finalConversationId })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
