import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch sessions with their messages
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at, chat_messages(id, role, content, created_at)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) throw error

    const conversations = (sessions || []).map((s) => ({
      conversationId: s.id,
      title: s.title,
      lastCreatedAt: s.updated_at,
      messages: (s.chat_messages as any[])
        .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
        .slice(-50),
    }))

    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error('Chat history error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Deleting sessions cascades to messages via FK
    const { error } = await supabase.from('chat_sessions').delete().eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Clear chat history error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
