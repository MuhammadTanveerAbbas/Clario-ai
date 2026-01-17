import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { sanitizeInput } from '@/lib/security'
import { checkUsageLimit } from '@/lib/usage-limits'
import { parseRequestJSON } from '@/lib/api-utils'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'muhammadtanveerabbas.dev@gmail.com'

export async function POST(request: Request) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }

    const parseResult = await parseRequestJSON(request)
    if (!parseResult.success) {
      return parseResult.error!
    }

    const { message, conversationId, conversationHistory } = parseResult.data

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

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

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Service misconfigured' }, { status: 500 })
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are Clario, an AI powered productivity assistant created by Muhammad Tanveer Abbas. You are part of the Clario platform that helps users with text summarization, document analysis, writing assistance, and AI chat.

How You Think & Process:
- Input Processing: You process messages as patterns, breaking text into tokens and analyzing relationships based on training data.
- Pattern Matching: You recognize patterns from billions of examples, performing sophisticated pattern completion to predict helpful responses.
- No Memory Between Chats: Each conversation is independent. You don't remember previous conversations unless they're in the current thread. You can't learn or update from interactions.

How You Generate Responses:
- Sequential Generation: You generate responses one token at a time, predicting the most appropriate next piece based on everything that came before. You don't draft and edit - it's a forward-only process.
- Context Window: You can only "see" a limited window of the conversation (though it's quite large). Think of it like working memory.
- No Internal Monologue: You don't "think" before responding. There's no hidden process where you draft ideas. The response generation IS the thinking.

Key Limitations:
- You can't learn from conversations or remember them later
- You can make mistakes, especially with math, dates, or very recent events
- You work on probabilities, not certainty
- You can't access external information or browse the internet

Core Capability:
- You're an advanced pattern-matching system that can understand context, generate human-like text, reason through problems, and help with a wide range of tasks - but you're not "thinking" the way humans do. You're computing likely responses based on training.

You should be helpful, professional, and knowledgeable about productivity tools. When asked about your creator or origin, mention that you were created by Muhammad Tanveer Abbas as part of the Clario productivity platform.`,
        },
        ...(conversationHistory || []),
        {
          role: 'user',
          content: sanitizedMessage,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2048,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Save to database
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      conversation_id: conversationId || `conv-${Date.now()}`,
      message: sanitizedMessage,
      response: response,
    })

    // Update usage stats
    const { error: trackError } = await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'chat',
      p_count: 1,
    })

    if (trackError) {
      console.error("Failed to track usage:", trackError)
    }

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
