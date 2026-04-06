'use client'

import { useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme } = useTheme()
  
  // Force light theme for marketing pages
  useEffect(() => {
    setTheme('light')
  }, [setTheme])
  
  return <>{children}</>
}
