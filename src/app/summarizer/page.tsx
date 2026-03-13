'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AppNavbar } from '@/components/layout/app-navbar'
import { SummarizerTool } from '@/components/layout/summarizer-tool'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function SummarizerPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in?redirect=/summarizer')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppNavbar />
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-1.5 tracking-tight">Summarizer</h1>
            <p className="text-[13px] sm:text-[14px] text-white/40">
              Turn YouTube videos and text into summaries
            </p>
          </div>
          <SummarizerTool />
        </div>
      </main>
    </div>
  )
}

