import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, requests_used, requests_reset_at')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({
        plan: 'free',
        requests_used: 0,
        limit: 100,
      })
    }

    const now = new Date()
    const resetAt = new Date(profile.requests_reset_at)

    if (now > resetAt) {
      return NextResponse.json({
        plan: profile.plan || 'free',
        requests_used: 0,
        limit: profile.plan === 'pro' ? 1000 : 100,
      })
    }

    return NextResponse.json({
      plan: profile.plan || 'free',
      requests_used: profile.requests_used || 0,
      limit: profile.plan === 'pro' ? 1000 : 100,
    })
  } catch (error: any) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
