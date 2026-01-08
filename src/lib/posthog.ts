'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (posthogKey) {
      try {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              posthog.debug()
            }
          },
          disable_session_recording: true,
          autocapture: false,
        })
      } catch (error) {
        console.warn('PostHog initialization failed:', error)
      }
    }
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

export function trackFeatureUsage(feature: string, metadata?: Record<string, any>) {
  trackEvent('feature_used', {
    feature,
    timestamp: new Date().toISOString(),
    ...metadata,
  })
}

export function trackRequestUsage(userId: string, feature: string, requestCount: number = 1) {
  trackEvent('request_used', {
    user_id: userId,
    feature,
    request_count: requestCount,
    timestamp: new Date().toISOString(),
  })
}

export function trackSubscriptionChange(userId: string, oldTier: string, newTier: string) {
  trackEvent('subscription_changed', {
    user_id: userId,
    old_tier: oldTier,
    new_tier: newTier,
    timestamp: new Date().toISOString(),
  })
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, properties)
  }
}

export function resetUser() {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset()
  }
}

// Hook to initialize PostHog
export function usePostHog() {
  useEffect(() => {
    initPostHog()
  }, [])
}

