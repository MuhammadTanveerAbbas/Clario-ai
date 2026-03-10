'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && !posthog.__loaded && process.env.NODE_ENV === 'production') {
      try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          person_profiles: 'identified_only',
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') posthog.debug()
          },
          disable_session_recording: true,
          autocapture: false,
        })
      } catch (error) {
        console.warn('PostHog initialization failed:', error)
      }
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
