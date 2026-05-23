import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)

    const { data: currentUsage } = await supabase
      .from('usage_tracking')
      .select('type, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    const { data: previousUsage } = await supabase
      .from('usage_tracking')
      .select('type, created_at')
      .eq('user_id', userId)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    const groupByDate = (records: Array<{ type: string; created_at: string }> | null) => {
      if (!records) return []
      const grouped: Record<string, { date: string; total_requests: number; summaries_count: number; chats_count: number; writing_count: number; meeting_notes_count: number }> = {}
      for (const r of records) {
        const date = new Date(r.created_at).toISOString().split('T')[0]
        if (!grouped[date]) {
          grouped[date] = { date, total_requests: 0, summaries_count: 0, chats_count: 0, writing_count: 0, meeting_notes_count: 0 }
        }
        grouped[date].total_requests++
        if (r.type === 'summarize') grouped[date].summaries_count++
        else if (r.type === 'chat') grouped[date].chats_count++
        else if (r.type === 'remix') grouped[date].writing_count++
        else if (r.type === 'brand_voice') grouped[date].meeting_notes_count++
      }
      return Object.values(grouped)
    }

    const currentMonth = groupByDate(currentUsage)
    const previousMonth = groupByDate(previousUsage)

    const currentTotal = currentMonth?.reduce((sum, d) => sum + (d.total_requests || 0), 0) || 0
    const previousTotal = previousMonth?.reduce((sum, d) => sum + (d.total_requests || 0), 0) || 0

    const avgRequestsPerDay = currentMonth?.length ? Math.round(currentTotal / currentMonth.length) : 0

    const peakDay = currentMonth?.length ? currentMonth.reduce((max, curr) =>
      (curr.total_requests || 0) > (max.total_requests || 0) ? curr : max
    )?.date : null

    let streak = 0
    if (currentMonth && currentMonth.length > 0) {
      const sortedDates = currentMonth.map(d => new Date(d.date)).sort((a, b) => b.getTime() - a.getTime())
      const checkToday = new Date()
      checkToday.setHours(0, 0, 0, 0)

      for (let i = 0; i < sortedDates.length; i++) {
        const checkDate = new Date(checkToday)
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

    const featureKeys = Object.keys(featureCounts) as (keyof typeof featureCounts)[]
    const mostUsedFeature = featureKeys.reduce((max, key) =>
      featureCounts[key] > featureCounts[max] ? key : max
    , featureKeys[0] ?? 'summaries')

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
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
