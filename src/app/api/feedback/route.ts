import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/middleware/rate-limit'
import { z } from 'zod'

export const dynamic = 'force-dynamic';

const FeedbackSchema = z.object({
  feedback: z.string().min(1, 'Feedback is required').max(5000, 'Feedback too long'),
  email: z.string().email().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = FeedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const { feedback, email } = parsed.data

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: user?.id || null,
        message: feedback.trim(),
        type: 'general',
        metadata: email ? { email } : {},
      })

    if (error) {
      console.error('Feedback storage error:', error)
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
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
