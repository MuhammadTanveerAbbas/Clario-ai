import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !/^https?:\/\//.test(url)) {
    throw new Error('Invalid SUPABASE URL. Set NEXT_PUBLIC_SUPABASE_URL to a valid https:// URL.')
  }
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY.')
  }
  return createClient(url, serviceKey)
}

export interface AnalyticsInsights {
  avgRequestsPerDay: number
  peakDay: string | null
  currentStreak: number
  mostUsedFeature: string
  trendPercentage: number
  trendDirection: 'up' | 'down' | 'stable'
}

export async function getAnalyticsInsights(userId: string): Promise<AnalyticsInsights> {
  const supabase = getServiceSupabase()
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)

  const { data: currentMonth } = await supabase
    .from('usage_stats')
    .select('date, total_requests, summaries_count, chats_count, writing_count, meeting_notes_count')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const { data: previousMonth } = await supabase
    .from('usage_stats')
    .select('date, total_requests, summaries_count, chats_count, writing_count, meeting_notes_count')
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

  // Walk backwards from today counting consecutive days with activity
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

  type FeatureKey = keyof typeof featureCounts
  const featureKeys = Object.keys(featureCounts) as FeatureKey[]
  const mostUsedFeature: FeatureKey = featureKeys.reduce((max, key) =>
    featureCounts[key] > featureCounts[max] ? key : max
  , featureKeys[0] ?? 'summaries')

  // >5% change = trending, <-5% = declining, otherwise stable
  const trendPercentage = previousTotal > 0 
    ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
    : 0
  const trendDirection = trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable'

  return {
    avgRequestsPerDay,
    peakDay,
    currentStreak: streak,
    mostUsedFeature,
    trendPercentage: Math.abs(trendPercentage),
    trendDirection,
  }
}

export async function getFeatureBreakdown(userId: string) {
  const supabase = getServiceSupabase()
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const { data } = await supabase
    .from('usage_stats')
    .select('date, summaries_count, chats_count, writing_count, meeting_notes_count')
    .eq('user_id', userId)
    .gte('date', `${currentMonth}-01`)
    .order('date', { ascending: true })

  return {
    summaries: data?.reduce((sum, d) => sum + (d.summaries_count || 0), 0) || 0,
    chats: data?.reduce((sum, d) => sum + (d.chats_count || 0), 0) || 0,
    writing: data?.reduce((sum, d) => sum + (d.writing_count || 0), 0) || 0,
    meetings: data?.reduce((sum, d) => sum + (d.meeting_notes_count || 0), 0) || 0,
  }
}
