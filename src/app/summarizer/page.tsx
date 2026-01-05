'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileMenuButton } from '@/components/layout/mobile-menu-button'
import { SummarizerTool } from '@/components/layout/summarizer-tool'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { useSidebar } from '@/contexts/SidebarContext'

export default function SummarizerPage() {
  const { user, loading } = useAuth()
  const { collapsed } = useSidebar()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in?redirect=/summarizer')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#4169E1]" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <AppSidebar />
      <MobileMenuButton />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-0 md:ml-[80px]' : 'ml-0 md:ml-[256px]'} p-4 md:p-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-[#4169E1]/10 via-purple-500/5 to-pink-500/5 border border-[#4169E1]/20">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">Text Summarizer</h1>
            <p className="text-sm md:text-base text-gray-400">
              Transform meeting transcripts, articles, and documents into clear, actionable summaries.
            </p>
          </div>
          <SummarizerTool />
        </div>
      </main>
    </div>
  )
}

