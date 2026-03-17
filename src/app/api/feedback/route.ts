import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { feedback, email } = await request.json()

    if (!feedback?.trim()) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Store feedback in database
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: user?.id,
        email: email || user?.email,
        feedback: feedback.trim(),
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Feedback storage error:', error)
      // Don't fail if table doesn't exist yet
      if (error.code === '42P01') {
        console.log('Feedback table not created yet, logging to console:', {
          email: email || user?.email,
          feedback: feedback.trim(),
        })
        return NextResponse.json({ success: true })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
