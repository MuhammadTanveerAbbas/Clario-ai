import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    const messages = data || []

    const conversationsMap = new Map<
      string,
      { conversationId: string; messages: any[]; firstMessage: string; lastCreatedAt: string }
    >()

    for (const msg of messages) {
      const cid = msg.conversation_id || 'legacy'
      const existing = conversationsMap.get(cid)
      if (!existing) {
        conversationsMap.set(cid, {
          conversationId: cid,
          messages: [msg],
          firstMessage: msg.message,
          lastCreatedAt: msg.created_at,
        })
      } else {
        existing.messages.push(msg)
        existing.lastCreatedAt = msg.created_at
      }
    }

    let conversations = Array.from(conversationsMap.values())

    conversations = conversations
      .map((conv) => ({
        ...conv,
        messages: conv.messages.slice(-50),
      }))
      .sort((a, b) => (a.lastCreatedAt < b.lastCreatedAt ? 1 : -1))
      .slice(0, 20)

    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error('Chat history error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase.from('chat_messages').delete().eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Clear chat history error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

