"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
} from "recharts";

const COLORS = ["#4169E1", "#6B8EFF", "#8FA5FF"];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { collapsed } = useSidebar();
  const router = useRouter();
  const supabase = createClient();
  const [stats, setStats] = useState({
    totalSummaries: 0,
    totalChats: 0,
    totalMeetingNotes: 0,
    totalWriting: 0,
    currentTier: "free",
    requestsUsed: 0,
    requestsLimit: 100,
  });
  const [insights, setInsights] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Memoize loadDashboardData to prevent unnecessary re-renders
  const loadDashboardData = useCallback(
    async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const [usageRes, summaries, chats, meetings, writing, usageStats] =
          await Promise.all([
            fetch("/api/usage"),
            supabase
              .from("ai_summaries")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("chat_messages")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("meeting_notes")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("writing_sessions")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("usage_stats")
              .select("*")
              .eq("user_id", user.id)
              .order("date", { ascending: false })
              .limit(30),
          ]);

        if (!usageRes.ok) {
          throw new Error("Failed to fetch usage data");
        }

        const usageData = await usageRes.json();
        const tier = usageData.subscription_tier || "free";
        const limits = { free: 100, pro: 1000 }[tier] || 100;
        const totalRequests = usageData.requests_used || 0;

        if (summaries.error) throw new Error(summaries.error.message);
        if (chats.error) throw new Error(chats.error.message);
        if (meetings.error) throw new Error(meetings.error.message);
        if (writing.error) throw new Error(writing.error.message);
        if (usageStats.error) throw new Error(usageStats.error.message);

        setStats({
          totalSummaries: summaries.count || 0,
          totalChats: Math.floor((chats.count || 0) / 2),
          totalMeetingNotes: meetings.count || 0,
          totalWriting: writing.count || 0,
          currentTier: tier,
          requestsUsed: totalRequests,
          requestsLimit: limits,
        });

        setChartData(
          usageStats.data
            ?.slice(0, 7)
            .reverse()
            .map((u: any) => ({
              date: new Date(u.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              summaries: u.summaries_count || 0,
              chats: u.chats_count || 0,
              writing: u.writing_count || 0,
              meetings: u.meeting_notes_count || 0,
            })) || []
        );

        const analyticsResponse = await fetch(
          `/api/analytics?userId=${user.id}`
        );
        if (analyticsResponse.ok) {
          setInsights(await analyticsResponse.json());
        }

        setLastUpdated(new Date());
      } catch (error: any) {
        console.error("Error loading dashboard data:", error);
        setError(
          error.message || "Failed to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [user?.id, supabase]
  );

  // Auto-refresh without WebSocket
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
      return;
    }

    if (user) {
      loadDashboardData();
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        loadDashboardData();
      }
    };

    const refreshInterval = setInterval(() => {
      if (user && !document.hidden) {
        loadDashboardData();
      }
    }, 30000); // 30 seconds

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(refreshInterval);
    };
  }, [user, authLoading, router, loadDashboardData]);

  const handleManualRefresh = () => {
    loadDashboardData();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <AppSidebar />
        <MobileMenuButton />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-[#4169E1] mx-auto mb-4" />
            <p className="text-gray-400">Loading your dashboard...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const requestsPercentage = Math.min(
    (stats.requestsUsed / stats.requestsLimit) * 100,
    100
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <AppSidebar />
      <MobileMenuButton />
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-0 md:ml-[80px]" : "ml-0 md:ml-[256px]"
        } p-3 sm:p-6 md:p-8`}
      >
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
          >
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                Dashboard
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-sm sm:text-base text-gray-400">
                  Welcome back,{" "}
                  {user?.user_metadata?.full_name?.split(" ")[0] || "User"}!
                </p>
                {lastUpdated && (
                  <span className="text-xs text-gray-500">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg">
                <div className="relative">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-[#4169E1] via-[#6B8EFF] to-[#8FA5FF] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#4169E1]/40 shadow-lg">
                    {user?.user_metadata?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-black shadow-sm" />
                </div>
                <div className="flex-1 min-w-0 hidden sm:block">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.user_metadata?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300 flex-1">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                >
                  Dismiss
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-300/5 border-blue-500/20 relative overflow-hidden hover:border-blue-500/40 transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full group-hover:from-blue-500/30 transition-all duration-300" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Summaries
                  </CardTitle>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <FileText className="h-4 w-4 text-blue-400" />
                  </motion.div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <motion.div
                    key={stats.totalSummaries}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl sm:text-3xl font-bold text-white"
                  >
                    {stats.totalSummaries}
                  </motion.div>
                  <p className="text-xs text-gray-400 mt-1">Total created</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-300/5 border-purple-500/20 relative overflow-hidden hover:border-purple-500/40 transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full group-hover:from-purple-500/30 transition-all duration-300" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Chats
                  </CardTitle>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                  </motion.div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <motion.div
                    key={stats.totalChats}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl sm:text-3xl font-bold text-white"
                  >
                    {stats.totalChats}
                  </motion.div>
                  <p className="text-xs text-gray-400 mt-1">Total messages</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-emerald-300/5 border-emerald-500/20 relative overflow-hidden hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full group-hover:from-emerald-500/30 transition-all duration-300" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Meetings
                  </CardTitle>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <motion.div
                    key={stats.totalMeetingNotes}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl sm:text-3xl font-bold text-white"
                  >
                    {stats.totalMeetingNotes || 0}
                  </motion.div>
                  <p className="text-xs text-gray-400 mt-1">Total notes</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-green-500/10 via-green-400/5 to-green-300/5 border-green-500/20 relative overflow-hidden hover:border-green-500/40 transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full group-hover:from-green-500/30 transition-all duration-300" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Writing
                  </CardTitle>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-green-400" />
                  </motion.div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <motion.div
                    key={stats.totalWriting}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl sm:text-3xl font-bold text-white"
                  >
                    {stats.totalWriting || 0}
                  </motion.div>
                  <p className="text-xs text-gray-400 mt-1">Total sessions</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Monthly Requests Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-blue-300/5 border-blue-500/20 relative overflow-hidden hover:border-blue-500/40 transition-all duration-300">
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
                  {stats.requestsUsed} / {stats.requestsLimit} requests used
                  this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-3 bg-black/50 rounded-full overflow-hidden border border-blue-500/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${requestsPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    Used: {stats.requestsUsed}
                  </span>
                  <span>
                    Remaining:{" "}
                    {Math.max(0, stats.requestsLimit - stats.requestsUsed)}
                  </span>
                </div>
                {stats.currentTier === "free" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                  >
                    <p className="text-xs text-blue-300">
                      <strong>Tip:</strong> Upgrade to Pro for 1000 requests per
                      month
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics Insights */}
          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              <Card className="bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-orange-300/5 border-orange-500/20">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {insights.currentStreak}
                  </div>
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
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {insights.avgRequestsPerDay}
                  </div>
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
                  <div className="text-2xl sm:text-3xl font-bold text-white capitalize">
                    {stats.totalSummaries + stats.totalChats + stats.totalWriting + stats.totalMeetingNotes === 0 
                      ? 'None' 
                      : insights.mostUsedFeature}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Most used</p>
                </CardContent>
              </Card>

              <Card
                className={`bg-gradient-to-br ${
                  insights.trendDirection === "up"
                    ? "from-green-500/10 via-green-400/5 to-green-300/5 border-green-500/20"
                    : insights.trendDirection === "down"
                    ? "from-red-500/10 via-red-400/5 to-red-300/5 border-red-500/20"
                    : "from-gray-500/10 via-gray-400/5 to-gray-300/5 border-gray-500/20"
                }`}
              >
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    {insights.trendDirection === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : insights.trendDirection === "down" ? (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                    )}
                    Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div
                    className={`text-2xl sm:text-3xl font-bold ${
                      insights.trendDirection === "up"
                        ? "text-green-400"
                        : insights.trendDirection === "down"
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {insights.trendDirection === "up"
                      ? "+"
                      : insights.trendDirection === "down"
                      ? "-"
                      : ""}
                    {insights.trendPercentage}%
                  </div>
                  <p className="text-xs text-gray-400 mt-1">vs last month</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-400/5 to-indigo-300/5 border-indigo-500/20 relative overflow-hidden lg:col-span-2">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full" />
              <CardHeader>
                <CardTitle className="text-white text-sm sm:text-base flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-indigo-400" />
                  Usage Analytics
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Last 7 days activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="summariesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4169E1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4169E1"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="chatsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6B8EFF"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6B8EFF"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="writingGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="meetingsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#F59E0B"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F59E0B"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.3}
                    />
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
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      labelStyle={{ color: "#F9FAFB" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="summaries"
                      stroke="#4169E1"
                      fill="url(#summariesGradient)"
                      strokeWidth={2}
                      name="Summaries"
                      dot={{ fill: "#4169E1", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: "#4169E1", strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="chats"
                      stroke="#6B8EFF"
                      fill="url(#chatsGradient)"
                      strokeWidth={2}
                      name="Chats"
                      dot={{ fill: "#6B8EFF", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: "#6B8EFF", strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="writing"
                      stroke="#10B981"
                      fill="url(#writingGradient)"
                      strokeWidth={2}
                      name="Writing"
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: "#10B981", strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="meetings"
                      stroke="#F59E0B"
                      fill="url(#meetingsGradient)"
                      strokeWidth={2}
                      name="Meetings"
                      dot={{ fill: "#F59E0B", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: "#F59E0B", strokeWidth: 2 }}
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
                <CardDescription className="text-gray-400 text-xs sm:text-sm">
                  Usage breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <defs>
                      <linearGradient
                        id="pieGradient1"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#4169E1" />
                        <stop offset="100%" stopColor="#6B8EFF" />
                      </linearGradient>
                      <linearGradient
                        id="pieGradient2"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#A78BFA" />
                      </linearGradient>
                      <linearGradient
                        id="pieGradient3"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={[
                        { name: "Summaries", value: stats.totalSummaries },
                        { name: "Chats", value: stats.totalChats },
                        { name: "Writing", value: stats.totalWriting },
                        { name: "Meetings", value: stats.totalMeetingNotes },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      <Cell
                        fill="url(#pieGradient1)"
                        stroke="#1F2937"
                        strokeWidth={2}
                      />
                      <Cell
                        fill="url(#pieGradient2)"
                        stroke="#1F2937"
                        strokeWidth={2}
                      />
                      <Cell
                        fill="url(#pieGradient3)"
                        stroke="#1F2937"
                        strokeWidth={2}
                      />
                      <Cell fill="#F59E0B" stroke="#1F2937" strokeWidth={2} />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      labelStyle={{ color: "#F9FAFB" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
