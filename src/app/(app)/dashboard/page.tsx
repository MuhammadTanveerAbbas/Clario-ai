"use client";

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  Star,
  X,
  Clock,
  Sparkles,
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

interface RecentActivity {
  id: string;
  type: string;
  created_at: string;
}

interface RecentSummary {
  id: string;
  source_title: string | null;
  summary_mode: string;
  created_at: string;
}

function Skeleton({ className = "", circle = false }: { className?: string; circle?: boolean }) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg3)] ${circle ? "rounded-full" : "rounded-lg"} ${className}`}
    />
  );
}

function SectionHeader({
  icon: Icon,
  children,
  action,
}: {
  icon: typeof Activity;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex h-5 items-center justify-between">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text3)]">
        <Icon size={12} />
        {children}
      </span>
      {action}
    </div>
  );
}

function CardIcon({
  icon: Icon,
  color,
  accent = false,
}: {
  icon: typeof FileText;
  color?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={
        accent
          ? { background: "color-mix(in srgb, hsl(var(--accent)) 12%, transparent)", color: "hsl(var(--accent))" }
          : { background: `${color}15`, color }
      }
    >
      <Icon size={18} />
    </div>
  );
}

function PanelCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 ${className}`}>
      {children}
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

function StatCard({
  label, value, sub, color, icon: Icon, href, delay,
}: {
  label: string; value: number; sub: string; color: string; icon: typeof FileText; href: string; delay: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[92px] items-center gap-4 rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border2)] hover:shadow-[var(--shadow-medium)]"
      style={{ animation: `fadeInUp 0.5s ${delay}s both` }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
        style={{ background: `${color}15`, color }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-serif text-2xl font-light tracking-tight text-[var(--text)]">
          {value}
        </span>
        <div className="mt-0.5 text-[11px] font-medium text-[var(--text3)]">{label}</div>
        <div className="mt-0.5 text-[10px] text-[var(--text3)] opacity-70">{sub}</div>
      </div>
    </Link>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function activityLabel(type: string): string {
  switch (type) {
    case "summary":
    case "summarize":
      return "Generated a summary";
    case "chat":
      return "AI chat message";
    case "remix":
      return "Remixed content";
    default:
      return "Used Clario";
  }
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { user: authUser, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { setMobileOpen: setMobileSidebarOpen, mobileOpen: mobileSidebarOpen } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UsageStat | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadData = useCallback(async (options?: { silent?: boolean }) => {
    if (!authUser) return;
    if (!options?.silent) setLoading(true);
    setLoadError(false);
    try {
      const uid = authUser.id;
      const [
        profileRes,
        recentUsageRes,
        summaryCountRes,
        chatCountRes,
        remixCountRes,
        brandVoiceRes,
        summariesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url, plan, requests_used").eq("id", uid).single(),
        supabase.from("usage_tracking").select("id, created_at, type").eq("user_id", uid).order("created_at", { ascending: false }).limit(8),
        supabase.from("usage_tracking").select("*", { count: "exact", head: true }).eq("user_id", uid).in("type", ["summary", "summarize"]),
        supabase.from("usage_tracking").select("*", { count: "exact", head: true }).eq("user_id", uid).eq("type", "chat"),
        supabase.from("usage_tracking").select("*", { count: "exact", head: true }).eq("user_id", uid).eq("type", "remix"),
        supabase.from("brand_voices").select("id").eq("user_id", uid),
        supabase.from("summarizer_history").select("id, source_title, summary_mode, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
      ]);

      const profileData = profileRes.data;
      const tier = profileData?.plan || "free";

      setUser({
        id: uid,
        email: authUser.email!,
        full_name: profileData?.full_name,
        plan: tier === "pro" ? "pro" : "free",
      });

      const recentUsage = recentUsageRes.data || [];
      setRecentActivity(recentUsage.map((r: { id: string; type: string; created_at: string }) => ({
        id: r.id,
        type: r.type,
        created_at: r.created_at,
      })));
      setRecentSummaries(summariesRes.data || []);
      setStats({
        summaries: summaryCountRes.count ?? 0,
        chats: chatCountRes.count ?? 0,
        remixes: remixCountRes.count ?? 0,
        brand_voices: brandVoiceRes.data?.length ?? 0,
        requests_used: profileData?.requests_used ?? 0,
        requests_limit: tier === "pro" ? 1000 : 100,
      });
      setRefreshKey((k) => k + 1);
    } catch (e) {
      console.error("[Dashboard] Failed to load dashboard data:", e);
      setLoadError(true);
      setUser({ id: authUser.id, email: authUser.email || "", plan: "free" });
      setStats({ summaries: 0, chats: 0, remixes: 0, brand_voices: 0, requests_used: 0, requests_limit: 100 });
    } finally {
      setLoading(false);
    }
  }, [authUser, supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/sign-in");
      return;
    }
    if (pathname !== "/dashboard") return;
    loadData();
  }, [authUser, authLoading, pathname, loadData, router]);

  useEffect(() => {
    if (authLoading || !authUser || pathname !== "/dashboard") return;

    const refetchIfVisible = () => {
      if (document.visibilityState === "visible") {
        loadData({ silent: true });
      }
    };

    document.addEventListener("visibilitychange", refetchIfVisible);
    window.addEventListener("focus", refetchIfVisible);
    return () => {
      document.removeEventListener("visibilitychange", refetchIfVisible);
      window.removeEventListener("focus", refetchIfVisible);
    };
  }, [authLoading, authUser, pathname, loadData]);

  const retryLoad = useCallback(() => {
    loadData();
  }, [loadData]);

  const usagePercent = stats ? Math.round((stats.requests_used / stats.requests_limit) * 100) : 0;
  const greeting = useMemo(() => getGreeting(), []);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  if (authLoading) return <LoadingPage />;
  if (!authUser) return <LoadingPage />;

  const isPro = user?.plan === "pro";

  const STAT_CARDS = [
    { label: "Summaries", value: stats?.summaries ?? 0, sub: "Total processed", color: "#f97316", href: "/summarizer", icon: FileText },
    { label: "AI Chats", value: stats?.chats ?? 0, sub: "Conversations", color: "#0ea5e9", href: "/chat", icon: MessageCircle },
    { label: "Remixes", value: stats?.remixes ?? 0, sub: "Content remixed", color: "#8b5cf6", href: "/remix", icon: Repeat },
    { label: "Brand Voices", value: stats?.brand_voices ?? 0, sub: "Voices created", color: "#10b981", href: "/brand-voice", icon: Mic },
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
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-6 sm:px-6 lg:px-8 xl:px-10">
            {/* Hero banner */}
            <div
              className="relative overflow-hidden rounded-2xl border border-[var(--card-b)] p-6 sm:p-8"
              style={{
                background: "linear-gradient(135deg, hsl(var(--card)) 0%, var(--bg2) 50%, hsl(var(--card)) 100%)",
                animation: "fadeInUp 0.4s both",
              }}
            >
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-4 bottom-0 h-32 w-32 rounded-full bg-sky-500/8 blur-2xl pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--accent))] mb-2">
                    Your workspace
                  </p>
                  <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[var(--text)]">
                    Good {greeting}, <em className="italic text-[hsl(var(--accent))]">{firstName}</em>
                  </h1>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--text3)] max-w-lg">
                    {loading
                      ? "Loading your workspace..."
                      : isPro
                      ? "Pro plan active unlimited requests, priority processing."
                      : `You've used ${stats?.requests_used ?? 0} of ${stats?.requests_limit ?? 100} requests this month.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <Link
                    href="/summarizer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[hsl(var(--accent))] px-4 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 no-underline"
                  >
                    <Sparkles size={14} />
                    New summary
                  </Link>
                  <Link
                    href="/chat"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] px-4 text-[12px] font-semibold text-[var(--text2)] transition-colors hover:border-[var(--border2)] no-underline"
                  >
                    <MessageCircle size={14} />
                    Open chat
                  </Link>
                </div>
              </div>
            </div>

            {loadError && !loading && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/20">
                <p className="text-[12px] text-red-700 dark:text-red-400">
                  Some dashboard data couldn&apos;t be loaded. Stats may be incomplete.
                </p>
                <button
                  type="button"
                  onClick={retryLoad}
                  className="text-[11px] font-semibold text-[hsl(var(--accent))]"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 min-h-[92px]">
                      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                      <div className="flex flex-1 flex-col gap-2.5">
                        <Skeleton className="h-6 w-12 rounded-md" />
                        <Skeleton className="h-3 w-20 rounded-md" />
                        <Skeleton className="h-2.5 w-16 rounded-md" />
                      </div>
                    </div>
                  ))
                : STAT_CARDS.map((card, i) => (
                    <StatCard key={card.label} {...card} delay={0.08 + i * 0.06} />
                  ))}
            </div>

            {/* Usage bar (free tier) */}
            {!loading && !isPro && stats && (
              <div className="rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-4 sm:p-5">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <BarChart3 size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[12px] font-semibold text-[var(--text2)]">Monthly usage</h3>
                        <p className="text-[10px] text-[var(--text3)] mt-0.5">
                          {stats.requests_used} of {stats.requests_limit} requests
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/pricing"
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-[10px] font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                    >
                      Upgrade <ArrowRight size={12} />
                    </Link>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-[var(--text3)]">Progress</span>
                      <span className="text-[10px] font-semibold" style={{ color: usagePercent > 85 ? "#ef4444" : usagePercent > 70 ? "#f59e0b" : "hsl(var(--accent))" }}>
                        {usagePercent}%
                      </span>
                    </div>
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--bg3)] dark:bg-[var(--bg2)]">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.max(usagePercent, 2)}%`,
                          background: usagePercent > 85
                            ? "linear-gradient(90deg, #ef4444, #f87171)"
                            : usagePercent > 70
                            ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                            : "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent)) 80%, #10b981)",
                          boxShadow: usagePercent > 0 ? `0 0 12px ${usagePercent > 85 ? "rgba(239, 68, 68, 0.4)" : usagePercent > 70 ? "rgba(245, 158, 11, 0.4)" : "rgba(var(--accent-rgb), 0.3)"}` : "none"
                        }}
                      />
                    </div>
                  </div>

                  {/* Status message */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--text3)]">
                      {usagePercent >= 100
                        ? "Limit reached. Upgrade to continue."
                        : usagePercent > 85
                        ? "Approaching limit. Consider upgrading."
                        : usagePercent > 70
                        ? `${stats.requests_limit - stats.requests_used} requests remaining`
                        : usagePercent === 0
                        ? `${stats.requests_limit} requests available to use`
                        : `${stats.requests_limit - stats.requests_used} requests available`}
                    </span>
                    {usagePercent > 0 && (
                      <span className="text-[var(--text3)]">
                        {Math.round((stats.requests_used / stats.requests_limit) * 100)}% used
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Usage bar loading state */}
            {loading && !isPro && (
              <div className="rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-4 sm:p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2.5 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-7 w-20 shrink-0 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-2.5 w-12" />
                      <Skeleton className="h-2.5 w-8" />
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Analytics + Overview Section */}
            <div className="space-y-6">
              {/* Analytics */}
              <div>
                <SectionHeader icon={Activity}>Usage analytics</SectionHeader>
                {loading ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="h-[260px] rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 animate-pulse" />
                    <div className="h-[260px] rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 animate-pulse" />
                  </div>
                ) : (
                  <AnalyticsCharts refreshKey={refreshKey} />
                )}
              </div>

              {/* Overview */}
              <div>
                <SectionHeader icon={Sparkles}>Overview</SectionHeader>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Recent Activity */}
                  <PanelCard>
                    <div className="mb-4 flex items-center gap-3">
                      <CardIcon icon={Clock} color="#78716c" />
                      <span className="text-[12px] font-semibold text-[var(--text2)]">Recent activity</span>
                    </div>
                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--card-b)] last:border-0">
                            <Skeleton className="h-3 w-36" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        ))}
                      </div>
                    ) : recentActivity.length === 0 ? (
                      <p className="text-[11px] text-[var(--text3)] m-0">No activity yet. Start with a summary or chat.</p>
                    ) : (
                      <ul className="space-y-1 list-none m-0 p-0">
                        {recentActivity.map((item) => (
                          <li key={item.id} className="flex items-center justify-between gap-2 py-2 border-b border-[var(--card-b)] last:border-0">
                            <span className="text-[11px] text-[var(--text2)] truncate">{activityLabel(item.type)}</span>
                            <span className="text-[10px] text-[var(--text3)] shrink-0">{formatRelativeTime(item.created_at)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </PanelCard>

                  {/* Recent Summaries */}
                  <PanelCard>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardIcon icon={FileText} color="#f97316" />
                        <span className="text-[12px] font-semibold text-[var(--text2)]">Recent summaries</span>
                      </div>
                      <Link href="/summarizer" className="text-[10px] font-semibold text-[hsl(var(--accent))] no-underline hover:opacity-80">
                        View all
                      </Link>
                    </div>
                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex flex-col gap-1.5 rounded-lg px-2 py-2">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-2.5 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : recentSummaries.length === 0 ? (
                      <p className="text-[11px] text-[var(--text3)] m-0">No summaries yet. Paste text, a URL, or a YouTube link to get started.</p>
                    ) : (
                      <ul className="space-y-1 list-none m-0 p-0">
                        {recentSummaries.map((s) => (
                          <li key={s.id}>
                            <Link
                              href="/summarizer"
                              className="flex flex-col gap-0.5 rounded-lg px-2 py-2 hover:bg-[var(--bg3)] transition-colors no-underline"
                            >
                              <span className="text-[11px] font-medium text-[var(--text2)] truncate">
                                {s.source_title || "Untitled summary"}
                              </span>
                              <span className="text-[10px] text-[var(--text3)]">
                                {s.summary_mode.replace(/-/g, " ")} · {formatRelativeTime(s.created_at)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </PanelCard>
                </div>
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
