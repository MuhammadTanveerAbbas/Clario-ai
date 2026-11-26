'use client'

import { MktNav } from '@/components/marketing/MktNav'
import { MktFooter } from '@/components/marketing/MktFooter'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <MktNav />
      <main className="flex-1">{children}</main>
      <MktFooter />
    </div>
  )
}
