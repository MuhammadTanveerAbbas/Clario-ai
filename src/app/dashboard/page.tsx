"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Zap, Activity, Sparkles, Loader2, TrendingUp, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { collapsed } = useSidebar();
  const router = useRouter();
  const [stats, setStats] = useState({ summaries: 0, chats: 0, meetings: 0, writing: 0, used: 0, limit: 100 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in");
      return;
    }
    if (user) loadData();
  }, [user, authLoading]);

  const loadData = async () => {
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
      meetings: acc.meetings + (d.meeting_notes_count || 0),
      writing: acc.writing + (d.writing_count || 0),
    }), { summaries: 0, chats: 0, meetings: 0, writing: 0 });
    
    setStats({
      summaries: totals.summaries,
      chats: totals.chats,
      meetings: totals.meetings,
      writing: totals.writing,
      used: monthlyTotal,
      limit: usage.limit || 100,
    });

    setChartData(
      allStats.slice(0, 7).reverse().map((d: any) => ({
        date: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
        summaries: d.summaries_count || 0,
        chats: d.chats_count || 0,
        writing: d.writing_count || 0,
        meetings: d.meeting_notes_count || 0,
        total: d.total_requests || 0,
      }))
    );
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const total = stats.summaries + stats.chats + stats.meetings + stats.writing;

  return (
    <div className="flex min-h-screen bg-black">
      <AppSidebar />
      <MobileMenuButton />
      <main className={`flex-1 transition-all ${collapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"} p-4 md:p-8`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.user_metadata?.name || "User"}!</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  Summaries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.summaries}</div>
                <p className="text-xs text-gray-500 mt-1">Total created</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Chats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.chats}</div>
                <p className="text-xs text-gray-500 mt-1">Conversations</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.meetings}</div>
                <p className="text-xs text-gray-500 mt-1">Notes taken</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-400" />
                  Writing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.writing}</div>
                <p className="text-xs text-gray-500 mt-1">Sessions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  Monthly Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Used</span>
                    <span className="text-white font-medium">{stats.used} / {stats.limit}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                      style={{ width: `${Math.min((stats.used / stats.limit) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{Math.max(0, stats.limit - stats.used)} requests remaining</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  Total Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">{total}</div>
                <p className="text-sm text-gray-400">All-time actions</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-2">
                  {chartData.reduce((sum, d) => sum + d.total, 0)}
                </div>
                <p className="text-sm text-gray-400">Last 7 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                    No data yet. Start using features!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#F9FAFB" }}
                        labelStyle={{ color: "#F9FAFB" }}
                        itemStyle={{ color: "#F9FAFB" }}
                        cursor={{ fill: "transparent" }}
                      />
                      <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6" }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Feature Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                    No data yet. Start using features!
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px", color: "#F9FAFB" }}
                        labelStyle={{ color: "#F9FAFB" }}
                        itemStyle={{ color: "#F9FAFB" }}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar dataKey="summaries" fill="#3B82F6" />
                      <Bar dataKey="chats" fill="#8B5CF6" />
                      <Bar dataKey="writing" fill="#10B981" />
                      <Bar dataKey="meetings" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
