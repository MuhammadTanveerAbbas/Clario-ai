'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileMenuButton } from '@/components/layout/mobile-menu-button'
import { FeedbackButton } from '@/components/feedback-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  MessageSquare,
  Zap,
  TrendingUp,
  Sparkles,
  Loader2,
  Activity,
  BarChart3,
  Flame,
  TrendingDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#4169E1', '#6B8EFF', '#8FA5FF']

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { collapsed } = useSidebar()
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalSummaries: 0,
    totalChats: 0,
    totalMeetingNotes: 0,
    totalWriting: 0,
    currentTier: 'free',
    requestsUsed: 0,
    requestsLimit: 100,
  })
  const [insights, setInsights] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
      return
    }

    if (user) {
      loadDashboardData()
    }

    // Reload data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadDashboardData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, authLoading])

  const loadDashboardData = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user?.id)
        .single()

      const tier = userData?.subscription_tier || 'free'
      const limits = {
        free: 100,
        pro: 1000,
      }[tier] || 100

      const { data: usageData } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30)

      const { count: summariesCount } = await supabase
        .from('ai_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

      const { count: chatsCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

      const { count: meetingNotesCount } = await supabase
        .from('meeting_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

      const { count: writingCount } = await supabase
        .from('writing_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

      const currentMonth = new Date().toISOString().slice(0, 7)
      const currentMonthUsage = usageData?.find((u) => u?.date?.startsWith(currentMonth))

      const totalRequests = (currentMonthUsage?.summaries_count || 0) +
        (currentMonthUsage?.chats_count || 0) +
        (currentMonthUsage?.meeting_notes_count || 0) +
        (currentMonthUsage?.writing_count || 0)

      setStats({
        totalSummaries: summariesCount || 0,
        totalChats: chatsCount || 0,
        totalMeetingNotes: meetingNotesCount || 0,
        totalWriting: writingCount || 0,
        currentTier: tier,
        requestsUsed: totalRequests,
        requestsLimit: limits,
      })

      const chartData = usageData?.slice(0, 7).reverse().map((u) => ({
        date: new Date(u?.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        summaries: u?.summaries_count || 0,
        chats: u?.chats_count || 0,
      })) || []

      setChartData(chartData)

      const analyticsResponse = await fetch(`/api/analytics?userId=${user?.id}`)
      if (analyticsResponse.ok) {
        const analyticsInsights = await analyticsResponse.json()
        setInsights(analyticsInsights)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#4169E1]" />
      </div>
    )
  }

  const requestsPercentage = Math.min((stats.requestsUsed / stats.requestsLimit) * 100, 100)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <AppSidebar />
      <MobileMenuButton />
      <FeedbackButton />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-0 md:ml-[80px]' : 'ml-0 md:ml-[256px]'} p-3 sm:p-6 md:p-8`}>
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-400">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}!</p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg w-full sm:w-auto">
              <div className="relative">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-[#4169E1] via-[#6B8EFF] to-[#8FA5FF] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#4169E1]/40 shadow-lg">
                  {user?.user_metadata?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-black shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.user_metadata?.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-300/5 border-blue-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-sm font-medium text-gray-300">Summaries</CardTitle>
                <FileText className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalSummaries}</div>
                <p className="text-xs text-gray-400 mt-1">Total created</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-300/5 border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-sm font-medium text-gray-300">Chats</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalChats}</div>
                <p className="text-xs text-gray-400 mt-1">Total messages</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-emerald-300/5 border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-sm font-medium text-gray-300">Meetings</CardTitle>
                <Activity className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalMeetingNotes || 0}</div>
                <p className="text-xs text-gray-400 mt-1">Total notes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 via-green-400/5 to-green-300/5 border-green-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <CardTitle className="text-sm font-medium text-gray-300">Quick Action</CardTitle>
                <Sparkles className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-medium transition-all duration-200 hover:scale-105 text-sm h-9"
                  onClick={() => router.push('/summarizer')}
                >
                  Create Summary
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Requests Usage */}
          <Card className="bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-300/5 border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center justify-between">
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-blue-400" />
                  Monthly Requests
                </span>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {Math.round(requestsPercentage)}%
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {stats.requestsUsed} / {stats.requestsLimit} requests used this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-3 bg-black/50 rounded-full overflow-hidden border border-blue-500/20">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 rounded-full transition-all duration-500"
                  style={{ width: `${requestsPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Used: {stats.requestsUsed}
                </span>
                <span>Remaining: {Math.max(0, stats.requestsLimit - stats.requestsUsed)}</span>
              </div>
              {stats.currentTier === 'free' && (
                <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300">
                    <strong>Tip:</strong> Upgrade to Pro for 1000 requests per month
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics Insights */}
          {insights && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-orange-300/5 border-orange-500/20">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{insights.currentStreak}</div>
                  <p className="text-xs text-gray-400 mt-1">Days active</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 via-green-400/5 to-green-300/5 border-green-500/20">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-400" />
                    Avg/Day
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{insights.avgRequestsPerDay}</div>
                  <p className="text-xs text-gray-400 mt-1">Requests</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-300/5 border-purple-500/20">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    Top Feature
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-white capitalize">{insights.mostUsedFeature}</div>
                  <p className="text-xs text-gray-400 mt-1">Most used</p>
                </CardContent>
              </Card>

              <Card className={`bg-gradient-to-br ${insights.trendDirection === 'up' ? 'from-green-500/10 via-green-400/5 to-green-300/5 border-green-500/20' : insights.trendDirection === 'down' ? 'from-red-500/10 via-red-400/5 to-red-300/5 border-red-500/20' : 'from-gray-500/10 via-gray-400/5 to-gray-300/5 border-gray-500/20'}`}>
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    {insights.trendDirection === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : insights.trendDirection === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                    )}
                    Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className={`text-2xl sm:text-3xl font-bold ${insights.trendDirection === 'up' ? 'text-green-400' : insights.trendDirection === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                    {insights.trendDirection === 'up' ? '+' : insights.trendDirection === 'down' ? '-' : ''}{insights.trendPercentage}%
                  </div>
                  <p className="text-xs text-gray-400 mt-1">vs last month</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-400/5 to-indigo-300/5 border-indigo-500/20 relative overflow-hidden lg:col-span-2">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full" />
              <CardHeader>
                <CardTitle className="text-white text-sm sm:text-base flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-indigo-400" />
                  Usage Analytics
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">Last 7 days activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="summariesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4169E1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4169E1" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="chatsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6B8EFF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6B8EFF" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#F9FAFB' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="summaries"
                      stroke="#4169E1"
                      fill="url(#summariesGradient)"
                      strokeWidth={2}
                      name="Summaries"
                      dot={{ fill: '#4169E1', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#4169E1', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="chats"
                      stroke="#6B8EFF"
                      fill="url(#chatsGradient)"
                      strokeWidth={2}
                      name="Chats"
                      dot={{ fill: '#6B8EFF', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#6B8EFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-emerald-300/5 border-emerald-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />
              <CardHeader>
                <CardTitle className="text-white text-sm sm:text-base flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-emerald-400" />
                  Feature Distribution
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">Usage breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <defs>
                      <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4169E1" />
                        <stop offset="100%" stopColor="#6B8EFF" />
                      </linearGradient>
                      <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#A78BFA" />
                      </linearGradient>
                      <linearGradient id="pieGradient3" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={[
                        { name: 'Summaries', value: stats.totalSummaries },
                        { name: 'Chats', value: stats.totalChats },
                        { name: 'Writing', value: stats.totalWriting },
                        { name: 'Meetings', value: stats.totalMeetingNotes },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell fill="url(#pieGradient1)" stroke="#1F2937" strokeWidth={2} />
                      <Cell fill="url(#pieGradient2)" stroke="#1F2937" strokeWidth={2} />
                      <Cell fill="url(#pieGradient3)" stroke="#1F2937" strokeWidth={2} />
                      <Cell fill="#F59E0B" stroke="#1F2937" strokeWidth={2} />
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#F9FAFB' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
