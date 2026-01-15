'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const PostHogProvider = dynamic(
  () => import('./posthog-provider').then((mod) => mod.PostHogProvider),
  { ssr: false }
)

const PostHogPageView = dynamic(
  () => import('@/app/posthog-pageview').then((mod) => mod.PostHogPageView),
  { ssr: false }
)

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}
