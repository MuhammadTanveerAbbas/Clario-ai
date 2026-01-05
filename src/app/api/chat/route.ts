import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
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

    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(message)

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
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { data: usageData } = await supabase
      .from('usage_stats')
      .select('chats_count')
      .eq('user_id', user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])

    const currentUsage = usageData?.reduce((sum, row) => sum + (row.chats_count || 0), 0) || 0
    const usageCheck = checkUsageLimit(tier, 'chats', currentUsage)

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit reached',
          message: `You've reached your ${tier} tier limit of ${usageCheck.limit} chats per month. Please upgrade to continue.`,
        },
        { status: 403 }
      )
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
    })

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are Clario, an AI powered productivity assistant created by Muhammad Tanveer Abbas. You are part of the Clario platform that helps users with text summarization, document analysis, writing assistance, and AI chat. You should be helpful, professional, and knowledgeable about productivity tools. When asked about your creator or origin, mention that you were created by Muhammad Tanveer Abbas as part of the Clario productivity platform.`,
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
      message: sanitizedMessage,
      response: response,
    })

    // Update usage stats
    await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_type: 'chat',
      p_count: 1,
    })

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
