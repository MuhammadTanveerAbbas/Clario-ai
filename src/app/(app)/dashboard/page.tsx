"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { LoadingPage } from "@/components/ui/loading-page";
import {
  FileText,
  Repeat,
  MessageCircle,
  Mic,
  Menu,
  Settings,
  Sun,
  Moon,
  BarChart3,
  Activity,
  ArrowRight,
  Zap,
  TrendingUp,
  Star,
  X,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  plan: "free" | "pro";
}

interface UsageStat {
  summaries: number;
  chats: number;
  remixes: number;
  brand_voices: number;
  requests_used: number;
  requests_limit: number;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

const QUICK_ACTIONS = [
  { label: "New Summary", href: "/summarizer", icon: FileText, color: "#f97316", desc: "Summarize any content" },
  { label: "Remix Content", href: "/remix", icon: Repeat, color: "#8b5cf6", desc: "Transform your content" },
  { label: "AI Chat", href: "/chat", icon: MessageCircle, color: "#0ea5e9", desc: "Chat with Clario AI" },
  { label: "Brand Voice", href: "/brand-voice", icon: Mic, color: "#10b981", desc: "Manage brand voices" },
];

function StatCard({
  label, value, sub, color, icon: Icon, href, trend, delay,
}: {
  label: string; value: number; sub: string; color: string; icon: typeof FileText; href: string; trend?: { up: boolean; pct: number }; delay: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex gap-4 rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border2)] hover:shadow-[var(--shadow-medium)]"
      style={{ animation: `fadeInUp 0.5s ${delay}s both` }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}15`, color }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-light tracking-tight text-[var(--text)]">
            {value}
          </span>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                trend.up ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
              }`}
            >
              <TrendingUp size={10} className={trend.up ? "" : "rotate-180"} />
              {trend.pct}%
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[11px] font-medium text-[var(--text3)]">{label}</div>
        <div className="mt-0.5 text-[10px] text-[var(--text3)] opacity-70">{sub}</div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { user: authUser, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { setMobileOpen: setMobileSidebarOpen, mobileOpen: mobileSidebarOpen } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UsageStat | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const uid = authUser!.id;
        const [profileRes, usageRes, brandVoiceRes] = await Promise.all([
          supabase.from("profiles").select("id, full_name, avatar_url, plan, requests_used").eq("id", uid).single(),
          supabase.from("usage_tracking").select("created_at, type").eq("user_id", uid).order("created_at", { ascending: false }).limit(60),
          supabase.from("brand_voices").select("id").eq("user_id", uid),
        ]);

        const profileData = profileRes.data;
        const tier = profileData?.plan || "free";

        setUser({
          id: uid,
          email: authUser!.email!,
          full_name: profileData?.full_name,
          plan: tier === "pro" ? "pro" : "free",
        });

        const usageData = usageRes.data || [];
        setStats({
          summaries: usageData.filter((r: { type: string }) => r.type === "summary").length,
          chats: usageData.filter((r: { type: string }) => r.type === "chat").length,
          remixes: usageData.filter((r: { type: string }) => r.type === "remix").length,
          brand_voices: brandVoiceRes.data?.length ?? 0,
          requests_used: profileData?.requests_used || usageData.length,
          requests_limit: tier === "pro" ? 1000 : 100,
        });

      } catch (e) {
        console.error('[Dashboard] Failed to load dashboard data:', e);
        setUser({ id: authUser?.id || "", email: authUser?.email || "", plan: "free" });
        setStats({ summaries: 0, chats: 0, remixes: 0, brand_voices: 0, requests_used: 0, requests_limit: 100 });
      } finally {
        setLoading(false);
      }
    }

    if (authLoading) return;
    if (!authUser) { router.push("/sign-in"); return; }
    loadData();
  }, [authUser, authLoading]);

  const usagePercent = stats ? Math.round((stats.requests_used / stats.requests_limit) * 100) : 0;
  const greeting = useMemo(() => getGreeting(), []);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  if (authLoading) return <LoadingPage />;
  if (!authUser) return <LoadingPage />;

  const isPro = user?.plan === "pro";
  const trends = [
    stats && stats.summaries > 5 ? { up: true, pct: Math.min(100, stats.summaries * 8) } : undefined,
    stats && stats.chats > 3 ? { up: true, pct: Math.min(100, stats.chats * 12) } : undefined,
    stats && stats.remixes > 2 ? { up: true, pct: Math.min(100, stats.remixes * 10) } : undefined,
    undefined,
  ];

  const STAT_CARDS = [
    { label: "Summaries", value: stats?.summaries ?? 0, sub: "Total processed", color: "#f97316", href: "/summarizer", icon: FileText, trend: trends[0] },
    { label: "AI Chats", value: stats?.chats ?? 0, sub: "Conversations", color: "#0ea5e9", href: "/chat", icon: MessageCircle, trend: trends[1] },
    { label: "Remixes", value: stats?.remixes ?? 0, sub: "Content remixed", color: "#8b5cf6", href: "/remix", icon: Repeat, trend: trends[2] },
    { label: "Brand Voices", value: stats?.brand_voices ?? 0, sub: "Voices created", color: "#10b981", href: "/brand-voice", icon: Mic, trend: trends[3] },
  ];

  return (
    <>
      <style>{`
        .dash-page {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--bg);
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        .dash-topbar {
          height: 52px;
          border-bottom: 1px solid hsl(var(--border));
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 10px;
          background: var(--glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 40;
          flex-shrink: 0;
        }

        .dash-topbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid hsl(var(--border));
          background: var(--bg2);
          color: var(--text3);
          cursor: pointer;
          transition: all 0.15s;
        }

        .dash-topbar-btn:hover {
          background: var(--bg3);
          color: var(--text2);
        }

        .dash-hamburger { display: none; }

        @media (max-width: 768px) {
          .dash-hamburger { display: flex; }
          .dash-topbar { padding: 0 12px; }
        }

        .dash-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

      `}</style>

      <div className="dash-page">
        {/* Topbar */}
        <div className="dash-topbar">
          <button className="dash-topbar-btn dash-hamburger" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
            <Menu size={15} />
          </button>
          <span className="flex-1" />
          {isPro && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white">
              <Star size={9} className="fill-white" />
              PRO
            </span>
          )}
          <button className="dash-topbar-btn" onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}>
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button className="dash-topbar-btn" onClick={() => router.push("/settings")}>
            <Settings size={13} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--card-b)] bg-gradient-to-br from-amber-500 to-orange-400 text-[11px] font-bold text-white shadow-sm transition-transform hover:scale-105"
            onClick={() => router.push("/settings")}
          >
            {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </button>
        </div>

        {/* Main Content */}
        <div className="dash-content">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-5 py-6 sm:px-6 lg:px-8 xl:px-10">
            {/* Greeting */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-xl font-light tracking-tight text-[var(--text)] sm:text-2xl">
                  Good {greeting}, <em className="italic">{firstName}</em> <span>👋</span>
                </h1>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--text3)]">
                  {loading ? "" : isPro
                    ? "You're on the Pro plan — unlimited potential."
                    : `You've used ${stats?.requests_used ?? 0} of ${stats?.requests_limit ?? 100} requests this month.`
                  }
                </p>
              </div>
              {!isPro && !loading && usagePercent > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: usagePercent > 85 ? "#ef4444" : "#f97316" }}
                  />
                  {usagePercent}% used
                </span>
              )}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4 rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5">
                      <Skeleton className="h-11 w-11 shrink-0" />
                      <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                : STAT_CARDS.map((card, i) => (
                    <StatCard key={card.label} {...card} delay={0.08 + i * 0.06} />
                  ))}
            </div>

            {/* Usage bar (free tier) - full width */}
            {!loading && !isPro && stats && usagePercent > 0 && (
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30">
                  <BarChart3 size={16} />
                </div>
                <div className="min-w-[180px] flex-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[var(--text2)]">Monthly usage</span>
                    <span className="text-[11px]" style={{ color: usagePercent > 85 ? "#ef4444" : "var(--text3)" }}>
                      {stats.requests_used} / {stats.requests_limit}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg3)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-1000"
                      style={{
                        width: `${usagePercent}%`,
                        background: usagePercent > 85 ? "linear-gradient(90deg, #ef4444, #f87171)" : undefined
                      }}
                    />
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[hsl(var(--accent))] px-3.5 py-2 text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Upgrade <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* Analytics */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text3)]">
                  <Activity size={12} />
                  Analytics
                </span>
                <Link href="/settings" className="text-[10px] font-semibold text-[hsl(var(--accent))] transition-opacity hover:opacity-75">
                  View details
                </Link>
              </div>
              {loading
                ? <div className="h-[200px] rounded-xl bg-[var(--bg3)]" />
                : <AnalyticsCharts />
              }
            </div>

            {/* Quick Actions */}
            <div>
              <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text3)]">
                <Zap size={12} />
                Quick Actions
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                {QUICK_ACTIONS.map((qa, i) => (
                  <Link
                    key={qa.label}
                    href={qa.href}
                    className="group relative flex flex-col gap-2.5 rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border2)] hover:shadow-[var(--shadow-soft)]"
                    style={{ animation: `fadeInUp 0.4s ${0.25 + i * 0.06}s both` }}
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${qa.color}15`, color: qa.color }}
                    >
                      <qa.icon size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-[var(--text2)]">{qa.label}</div>
                      <div className="mt-0.5 text-[10px] text-[var(--text3)]">{qa.desc}</div>
                    </div>
                    <ArrowRight size={11} className="absolute right-3 top-3 text-[var(--text3)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12px] font-medium shadow-lg backdrop-blur-md ${
                t.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                  : t.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/80 dark:text-red-300"
                  : "border-[var(--card-b)] bg-[hsl(var(--card))] text-[var(--text2)]"
              }`}
              style={{ animation: "fadeInUp 0.3s both" }}
            >
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismissToast(t.id)}
                className="flex h-5 w-5 items-center justify-center rounded-md opacity-60 transition-opacity hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
