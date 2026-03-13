"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/app-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Zap, Loader2, TrendingUp, Youtube, Clock, Target, ArrowRight, Sparkles, BarChart3, Calendar, Award, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ summaries: 0, chats: 0, remix: 0, brandVoice: 0, used: 0, limit: 100 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveActivity, setLiveActivity] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
      return;
    }
    if (user) loadData();
  }, [user, authLoading]);

  // Real-time activity simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveActivity(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(0, Math.min(100, prev + change * Math.random() * 5));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClient();
      const [usage, usageStats] = await Promise.all([
        fetch("/api/usage").then(r => r.json()).catch(() => ({ requests_used: 0, limit: 100 })),
        supabase.from("usage_stats").select("*").eq("user_id", user!.id).order("date", { ascending: false }),
      ]);
      
      const allStats = usageStats.data || [];
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthlyStats = allStats.filter(d => new Date(d.date) >= firstOfMonth);
      const monthlyTotal = monthlyStats.reduce((sum, d) => sum + (d.total_requests || 0), 0);
      
      const totals = allStats.reduce((acc, d) => ({
        summaries: acc.summaries + (d.summaries_count || 0),
        chats: acc.chats + (d.chats_count || 0),
        remix: acc.remix + (d.remix_count || 0),
        brandVoice: acc.brandVoice + (d.brand_voice_count || 0),
      }), { summaries: 0, chats: 0, remix: 0, brandVoice: 0 });
      
      setStats({
        summaries: totals.summaries,
        chats: totals.chats,
        remix: totals.remix,
        brandVoice: totals.brandVoice,
        used: monthlyTotal,
        limit: usage.limit || 100,
      });

      setChartData(
        allStats.slice(0, 7).reverse().map((d: any) => ({
          date: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
          summaries: d.summaries_count || 0,
          chats: d.chats_count || 0,
          total: d.total_requests || 0,
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-[#0A0A0A] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  const total = stats.summaries + stats.chats + stats.remix + stats.brandVoice;
  const videosProcessed = Math.floor(stats.summaries / 2);
  const hoursEstimated = Math.floor(videosProcessed * 0.5);
  const usagePercentage = (stats.used / stats.limit) * 100;
  const daysLeftInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const avgDailyUsage = stats.used / (new Date().getDate());
  const projectedUsage = Math.round(stats.used + (avgDailyUsage * daysLeftInMonth));

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppNavbar />
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12">
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-1 tracking-tight">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.user_metadata?.name?.split(' ')[0] || "Creator"}
              </h1>
              <p className="text-sm sm:text-[15px] text-white/40">Here's what's happening with your content</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-blue-500/10">
                  <Youtube className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                </div>
                <span className="text-[11px] sm:text-[13px] font-medium text-white/50">Summaries</span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-white tracking-tight">{stats.summaries}</div>
              <p className="text-[10px] sm:text-[12px] text-white/30 mt-0.5 sm:mt-1">Videos processed</p>
            </div>

            <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-blue-500/10">
                  <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                </div>
                <span className="text-[11px] sm:text-[13px] font-medium text-white/50">AI Chats</span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-white tracking-tight">{stats.chats}</div>
              <p className="text-[10px] sm:text-[12px] text-white/30 mt-0.5 sm:mt-1">Conversations</p>
            </div>

            <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-blue-500/10">
                  <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                </div>
                <span className="text-[11px] sm:text-[13px] font-medium text-white/50">Remixes</span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-white tracking-tight">{stats.remix}</div>
              <p className="text-[10px] sm:text-[12px] text-white/30 mt-0.5 sm:mt-1">Content remixed</p>
            </div>

            <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-blue-500/10">
                  <Mic className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                </div>
                <span className="text-[11px] sm:text-[13px] font-medium text-white/50">Brand Voices</span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-white tracking-tight">{stats.brandVoice}</div>
              <p className="text-[10px] sm:text-[12px] text-white/30 mt-0.5 sm:mt-1">Voices created</p>
            </div>
          </div>

          {/* Usage & Activity */}
          <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                <h3 className="text-sm sm:text-[15px] font-medium text-white">Monthly Usage</h3>
              </div>
              <div className="space-y-4">
                {/* Main Usage Bar */}
                <div>
                  <div className="flex justify-between text-xs sm:text-[13px] mb-2 sm:mb-3">
                    <span className="text-white/40">Used this month</span>
                    <span className="text-white/90 font-medium">{stats.used} / {stats.limit}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#4169E1] to-[#5179F1] transition-all duration-500"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] sm:text-[12px] text-white/30 mt-1.5 sm:mt-2">
                    {Math.max(0, stats.limit - stats.used)} requests remaining
                  </p>
                </div>

                {/* Daily Average */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                    <span className="text-[11px] sm:text-[12px] text-white/50">Daily Average</span>
                  </div>
                  <span className="text-xs sm:text-[13px] font-medium text-white">{avgDailyUsage.toFixed(1)}</span>
                </div>

                {/* Projected Usage */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500" />
                    <span className="text-[11px] sm:text-[12px] text-white/50">Projected</span>
                  </div>
                  <span className={`text-xs sm:text-[13px] font-medium ${
                    projectedUsage > stats.limit ? 'text-red-400' : 'text-white'
                  }`}>{projectedUsage}</span>
                </div>

                {stats.used / stats.limit > 0.8 && (
                  <div className="p-3 sm:p-4 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <p className="text-xs sm:text-[13px] text-white/70 mb-2 sm:mb-3">Running low on requests</p>
                    <Link href="/pricing">
                      <Button size="sm" className="w-full bg-[#4169E1] text-white hover:bg-[#3159D1] h-8 text-xs sm:text-[13px] font-medium">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                <h3 className="text-sm sm:text-[15px] font-medium text-white">Activity</h3>
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[11px] sm:text-[12px] text-white/30">Live</span>
                </div>
              </div>
              {chartData.length === 0 ? (
                <div className="h-40 sm:h-48 flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 mb-2 sm:mb-3 text-white/10" />
                  <p className="text-xs sm:text-[13px] text-white/40">No activity yet</p>
                  <p className="text-[11px] sm:text-[12px] text-white/20 mt-1">Start by summarizing a video</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <ResponsiveContainer width="100%" height={160} className="sm:!h-[180px]">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4169E1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4169E1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255,255,255,0.2)" 
                        fontSize={9} 
                        tickLine={false}
                        axisLine={false}
                        className="sm:text-[10px]"
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.2)" 
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        width={25}
                        className="sm:text-[10px] sm:!w-[30px]"
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: "rgba(0,0,0,0.95)", 
                          border: "1px solid rgba(65,105,225,0.3)", 
                          borderRadius: "8px",
                          fontSize: "11px"
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.9)" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#4169E1" 
                        strokeWidth={2}
                        fill="url(#colorTotal)"
                        dot={false}
                        animationDuration={300}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  {/* Live Activity Indicator */}
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[11px] sm:text-[12px] text-white/50">Current Activity</span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="h-1 w-16 sm:w-20 bg-white/[0.06] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#4169E1] to-[#5179F1] transition-all duration-500"
                          style={{ width: `${liveActivity}%` }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-medium text-white/70 w-7 sm:w-8 text-right">{Math.round(liveActivity)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
