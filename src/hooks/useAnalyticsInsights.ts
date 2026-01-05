import { useEffect, useState } from 'react'
import { getAnalyticsInsights, AnalyticsInsights } from '@/lib/analytics'

export function useAnalyticsInsights(userId: string | undefined) {
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchInsights = async () => {
      try {
        const data = await getAnalyticsInsights(userId)
        setInsights(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights')
        console.error('Error fetching analytics insights:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [userId])

  return { insights, loading, error }
}
