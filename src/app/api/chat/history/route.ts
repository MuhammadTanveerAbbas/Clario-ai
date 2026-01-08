import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ messages: data || [] })
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

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Clear chat history error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
