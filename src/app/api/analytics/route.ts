import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)

  const { data: currentMonth } = await supabase
    .from('usage_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const { data: previousMonth } = await supabase
    .from('usage_stats')
    .select('*')
    .eq('user_id', userId)
    .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
    .lt('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const currentTotal = currentMonth?.reduce((sum, d) => sum + (d.total_requests || 0), 0) || 0
  const previousTotal = previousMonth?.reduce((sum, d) => sum + (d.total_requests || 0), 0) || 0

  const avgRequestsPerDay = currentMonth?.length ? Math.round(currentTotal / currentMonth.length) : 0

  const peakDay = currentMonth?.reduce((max, curr) => 
    (curr.total_requests || 0) > (max.total_requests || 0) ? curr : max
  )?.date || null

  let streak = 0
  if (currentMonth && currentMonth.length > 0) {
    const sortedDates = currentMonth.map(d => new Date(d.date)).sort((a, b) => b.getTime() - a.getTime())
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)

      if (sortedDates[i].getTime() === checkDate.getTime()) {
        streak++
      } else {
        break
      }
    }
  }

  const featureCounts = {
    summaries: currentMonth?.reduce((sum, d) => sum + (d.summaries_count || 0), 0) || 0,
    chats: currentMonth?.reduce((sum, d) => sum + (d.chats_count || 0), 0) || 0,
    writing: currentMonth?.reduce((sum, d) => sum + (d.writing_count || 0), 0) || 0,
    meetings: currentMonth?.reduce((sum, d) => sum + (d.meeting_notes_count || 0), 0) || 0,
  }

  const mostUsedFeature = Object.entries(featureCounts).reduce((max, [key, val]) =>
    val > (featureCounts[max as keyof typeof featureCounts] || 0) ? key : max
  ) as string

  const trendPercentage = previousTotal > 0 
    ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
    : 0
  const trendDirection = trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable'

  return NextResponse.json({
    avgRequestsPerDay,
    peakDay,
    currentStreak: streak,
    mostUsedFeature,
    trendPercentage: Math.abs(trendPercentage),
    trendDirection,
  })
}
