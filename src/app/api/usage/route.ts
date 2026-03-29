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
      .select('subscription_tier, requests_used_this_month, current_period_end')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // Profile doesn't exist yet  create it with defaults for new users
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ 
          id: user.id, 
          email: user.email, 
          requests_used_this_month: 0,
          current_period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          current_period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        })
      
      if (insertError) {
        console.error('Insert error:', insertError)
      }
      
      return NextResponse.json({
        subscription_tier: 'free',
        requests_used: 0,
        limit: 100
      })
    }

    const now = new Date()
    const periodEnd = new Date(profile.current_period_end)
    
    if (now > periodEnd) {
      // Billing period has rolled over  reset the monthly counter
      await supabase
        .from('profiles')
        .update({
          requests_used_this_month: 0,
          current_period_start: new Date(now.getFullYear(), now.getMonth(), 1),
          current_period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        })
        .eq('id', user.id)
      
      return NextResponse.json({
        subscription_tier: profile.subscription_tier || 'free',
        requests_used: 0,
        limit: profile.subscription_tier === 'pro' ? 1000 : 100
      })
    }

    return NextResponse.json({
      subscription_tier: profile.subscription_tier || 'free',
      requests_used: profile.requests_used_this_month || 0,
      limit: profile.subscription_tier === 'pro' ? 1000 : 100
    })
  } catch (error: any) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
