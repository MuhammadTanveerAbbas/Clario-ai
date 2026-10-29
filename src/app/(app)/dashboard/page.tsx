"use client";

import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { LoadingPage } from "@/components/ui/loading-page";
import { AppNavbar } from "@/components/layout/app-navbar";
import {
  BarChart3,
  Activity,
  ArrowRight,
  X,
  Clock,
  Sparkles,
  MessageCircle,
  FileText,
  MessageSquare,
  Zap,
  Mic,
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

// ── Module-level data cache so navigating away & back skips skeleton ─────────
let _cachedStats: UsageStat | null = null;
let _cachedActivity: RecentActivity[] = [];
let _cachedSummaries: RecentSummary[] = [];
let _cachedUser: UserProfile | null = null;
let _cacheUserId: string | null = null;

// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  href,
  delay,
  icon,
  iconColor,
  iconBg,
}: {
  label: string;
  value: number;
  sub: string;
  href: string;
  delay: number;
  icon: ReactNode;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[104px] items-center gap-4 rounded-2xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border2)] hover:shadow-[var(--shadow-medium)] no-underline"
      style={{ animation: `fadeInUp 0.5s ${delay}s both` }}
    >
      {/* Subtle glow blob */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
           style={{ background: "hsl(var(--accent) / 0.12)" }} />
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]"
           style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-serif text-2xl font-light tracking-tight text-[var(--text)]">
          {value}
        </span>
        <div className="mt-0.5 text-[12px] font-semibold text-[var(--text2)]">{label}</div>
        <div className="mt-0.5 text-[11px] text-[var(--text3)]">{sub}</div>
      </div>
      <div className="shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "var(--text3)" }}>
          <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
  const supabase = createClient();
  const { user: authUser, loading: authLoading } = useAuth();

  // Seed state from module-level cache to avoid skeleton flash on back-navigation
  const [loading, setLoading] = useState(() => _cachedStats === null);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(_cachedUser);
  const [stats, setStats] = useState<UsageStat | null>(_cachedStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(_cachedActivity);
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>(_cachedSummaries);
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Track whether we've already loaded for this user to prevent double-fetch
  const loadedForRef = useRef<string | null>(_cacheUserId);

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

      const newUser: UserProfile = {
        id: uid,
        email: authUser.email!,
        full_name: profileData?.full_name,
        plan: tier === "pro" ? "pro" : "free",
      };

      const newActivity = (recentUsageRes.data || []).map((r: { id: string; type: string; created_at: string }) => ({
        id: r.id,
        type: r.type,
        created_at: r.created_at,
      }));

      const newSummaries = summariesRes.data || [];

      const newStats: UsageStat = {
        summaries: summaryCountRes.count ?? 0,
        chats: chatCountRes.count ?? 0,
        remixes: remixCountRes.count ?? 0,
        brand_voices: brandVoiceRes.data?.length ?? 0,
        requests_used: profileData?.requests_used ?? 0,
        requests_limit: tier === "pro" ? 1000 : 100,
      };

      // Write to module-level cache
      _cachedUser = newUser;
      _cachedStats = newStats;
      _cachedActivity = newActivity;
      _cachedSummaries = newSummaries;
      _cacheUserId = uid;
      loadedForRef.current = uid;

      setUser(newUser);
      setRecentActivity(newActivity);
      setRecentSummaries(newSummaries);
      setStats(newStats);
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
    // If we already have cached data for this user, skip the full reload
    if (loadedForRef.current === authUser.id && _cachedStats !== null) return;
    loadData();
  }, [authUser, authLoading, loadData, router]);

  useEffect(() => {
    if (authLoading || !authUser) return;
    const refetchIfVisible = () => {
      if (document.visibilityState === "visible") loadData({ silent: true });
    };
    document.addEventListener("visibilitychange", refetchIfVisible);
    window.addEventListener("focus", refetchIfVisible);
    return () => {
      document.removeEventListener("visibilitychange", refetchIfVisible);
      window.removeEventListener("focus", refetchIfVisible);
    };
  }, [authLoading, authUser, loadData]);

  const retryLoad = useCallback(() => { loadData(); }, [loadData]);

  const usagePercent = stats ? Math.round((stats.requests_used / stats.requests_limit) * 100) : 0;
  const greeting = useMemo(() => getGreeting(), []);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  if (authLoading) return <LoadingPage />;
  if (!authUser) return <LoadingPage />;

  const isPro = user?.plan === "pro";

  const STAT_CARDS = [
    {
      label: "Summaries",
      value: stats?.summaries ?? 0,
      sub: "Total processed",
      href: "/summarizer",
      icon: <FileText size={22} />,
      iconColor: "#f97316",
      iconBg: "rgba(249,115,22,0.12)",
    },
    {
      label: "AI Chats",
      value: stats?.chats ?? 0,
      sub: "Conversations",
      href: "/chat",
      icon: <MessageSquare size={22} />,
      iconColor: "#0ea5e9",
      iconBg: "rgba(14,165,233,0.12)",
    },
    {
      label: "Remixes",
      value: stats?.remixes ?? 0,
      sub: "Content remixed",
      href: "/remix",
      icon: <Zap size={22} />,
      iconColor: "#a855f7",
      iconBg: "rgba(168,85,247,0.12)",
    },
    {
      label: "Brand Voices",
      value: stats?.brand_voices ?? 0,
      sub: "Voices created",
      href: "/brand-voice",
      icon: <Mic size={22} />,
      iconColor: "#10b981",
      iconBg: "rgba(16,185,129,0.12)",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dash-content { flex: 1; display: flex; flex-direction: column; }
      `}</style>

      <div className="flex flex-col min-h-screen bg-[var(--bg)]">
        <AppNavbar />
        <div className="dash-content">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">

            {/* ── Hero Banner ────────────────────────────────────────────────── */}
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
                    Good {greeting},{" "}
                    <em className="italic text-[hsl(var(--accent))]">{firstName}</em>
                  </h1>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--text3)] max-w-lg">
                    {loading
                      ? "Loading your workspace…"
                      : isPro
                      ? "Pro plan active — unlimited requests, priority processing."
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

            {/* Error banner */}
            {loadError && !loading && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-[12px] text-red-700">
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

            {/* ── Category 1: Overview Stats ─────────────────────────────────── */}
            <section>
              <SectionHeader icon={Activity}>Overview</SectionHeader>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {loading
                  ? [...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-2xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 min-h-[108px]">
                        <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
                        <div className="flex flex-1 flex-col gap-2.5">
                          <Skeleton className="h-7 w-14 rounded-md" />
                          <Skeleton className="h-3 w-24 rounded-md" />
                          <Skeleton className="h-2.5 w-16 rounded-md" />
                        </div>
                      </div>
                    ))
                  : STAT_CARDS.map((card, i) => (
                      <StatCard key={card.label} {...card} delay={0.08 + i * 0.06} />
                    ))}
              </div>
            </section>

            {/* ── Category 2: Usage ─────────────────────────────────────────── */}
            {(!isPro) && (
              <section>
                <SectionHeader icon={BarChart3}>Usage</SectionHeader>

                {loading ? (
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
                ) : stats && (
                  <div className="rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
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
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-[10px] font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap no-underline"
                        >
                          Upgrade <ArrowRight size={12} />
                        </Link>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-[var(--text3)]">Progress</span>
                          <span
                            className="text-[10px] font-semibold"
                            style={{
                              color:
                                usagePercent > 85
                                  ? "#ef4444"
                                  : usagePercent > 70
                                  ? "#f59e0b"
                                  : "hsl(var(--accent))",
                            }}
                          >
                            {usagePercent}%
                          </span>
                        </div>
                        <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--bg3)]">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${Math.max(usagePercent, 2)}%`,
                              background:
                                usagePercent > 85
                                  ? "linear-gradient(90deg, #ef4444, #f87171)"
                                  : usagePercent > 70
                                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                                  : "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent)) 80%, #10b981)",
                              boxShadow:
                                usagePercent > 0
                                  ? `0 0 12px ${usagePercent > 85 ? "rgba(239, 68, 68, 0.4)" : usagePercent > 70 ? "rgba(245, 158, 11, 0.4)" : "rgba(var(--accent-rgb), 0.3)"}`
                                  : "none",
                            }}
                          />
                        </div>
                      </div>
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
                          <span className="text-[var(--text3)]">{usagePercent}% used</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── Category 3: Analytics ─────────────────────────────────────── */}
            <section>
              <SectionHeader icon={BarChart3}>Analytics</SectionHeader>
              {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="h-[260px] rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 animate-pulse" />
                  <div className="h-[260px] rounded-xl border border-[var(--card-b)] bg-[hsl(var(--card))] p-5 animate-pulse" />
                </div>
              ) : (
                <AnalyticsCharts refreshKey={refreshKey} />
              )}
            </section>

            {/* ── Category 4: Activity ──────────────────────────────────────── */}
            <section>
              <SectionHeader icon={Sparkles}>Activity</SectionHeader>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Recent Activity */}
                <PanelCard>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                         style={{ background: "color-mix(in srgb, #78716c 12%, transparent)", color: "#78716c" }}>
                      <Clock size={16} />
                    </div>
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
                    <p className="text-[11px] text-[var(--text3)] m-0">
                      No activity yet. Start with a summary or chat.
                    </p>
                  ) : (
                    <ul className="space-y-1 list-none m-0 p-0">
                      {recentActivity.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 py-2 border-b border-[var(--card-b)] last:border-0"
                        >
                          <span className="text-[11px] text-[var(--text2)] truncate">
                            {activityLabel(item.type)}
                          </span>
                          <span className="text-[10px] text-[var(--text3)] shrink-0">
                            {formatRelativeTime(item.created_at)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </PanelCard>

                {/* Recent Summaries */}
                <PanelCard>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                           style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}>
                        <FileText size={18} />
                      </div>
                      <span className="text-[12px] font-semibold text-[var(--text2)]">Recent summaries</span>
                    </div>
                    <Link
                      href="/summarizer"
                      className="text-[10px] font-semibold text-[hsl(var(--accent))] no-underline hover:opacity-80"
                    >
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
                    <p className="text-[11px] text-[var(--text3)] m-0">
                      No summaries yet. Paste text, a URL, or a YouTube link to get started.
                    </p>
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
                              {s.summary_mode.replace(/-/g, " ")} ·{" "}
                              {formatRelativeTime(s.created_at)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </PanelCard>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 md:bottom-6 md:right-6">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12px] font-medium shadow-lg backdrop-blur-md ${
                t.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : t.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
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
