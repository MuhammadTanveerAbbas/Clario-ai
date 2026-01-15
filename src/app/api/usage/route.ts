import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, requests_used')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    subscription_tier: profile?.subscription_tier || 'free',
    requests_used: profile?.requests_used || 0,
  })
}
