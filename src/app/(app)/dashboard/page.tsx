"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { LoadingPage } from "@/components/ui/loading-page";
import { Button } from "@/components/ui/button";
import { Page, PageHeader, SectionHeading } from "@/components/layout/page";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  FileText,
  MessageCircle,
  MessageSquare,
  MessageSquareText,
  Mic,
  Sparkles,
  Wand2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ToolkitStat {
  comments: number;
  repurposes: number;
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

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[var(--surface-3)]", className)}
    />
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
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
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function activityLabel(type: string): string {
  switch (type) {
    case "summary":
    case "summarize":
      return "Generated a summary";
    case "chat":
      return "Sent a chat message";
    case "remix":
      return "Remixed content";
    case "comment":
    case "comments":
      return "Generated comments";
    case "repurpose":
      return "Repurposed content";
    default:
      return "Used Clario";
  }
}

function activityIcon(type: string): LucideIcon {
  switch (type) {
    case "summary":
    case "summarize":
      return FileText;
    case "chat":
      return MessageSquare;
    case "remix":
      return Zap;
    case "comment":
    case "comments":
      return MessageSquareText;
    case "repurpose":
      return Wand2;
    default:
      return Sparkles;
  }
}

// Module-level data cache so navigating away and back skips the skeleton.
let _cachedStats: UsageStat | null = null;
let _cachedToolkit: ToolkitStat | null = null;
let _cachedActivity: RecentActivity[] = [];
let _cachedSummaries: RecentSummary[] = [];
let _cachedUser: UserProfile | null = null;
let _cacheUserId: string | null = null;

function StatCell({
  label,
  value,
  sub,
  href,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  sub: string;
  href: string;
  icon: LucideIcon;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[132px] flex-col justify-between bg-[var(--surface)] p-5 no-underline transition-colors hover:bg-[var(--surface-2)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] font-medium leading-5 text-[var(--ink-3)]">
          {label}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)] transition-colors group-hover:border-[var(--brand-line)] group-hover:text-[var(--brand)]">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
      </div>
      <div className="pt-4">
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <div className="flex items-end justify-between gap-3">
            <span className="font-serif text-[30px] font-medium leading-none tracking-[-0.03em] text-[var(--ink)] tabular-nums sm:text-[34px]">
              {value.toLocaleString()}
            </span>
            <ArrowUpRight
              className="mb-0.5 h-4 w-4 shrink-0 text-[var(--ink-3)] opacity-0 transition-opacity group-hover:opacity-100"
              strokeWidth={1.8}
              aria-hidden
            />
          </div>
        )}
        <p className="mt-2 text-[12px] leading-5 text-[var(--ink-3)]">{sub}</p>
      </div>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-7 w-14" />
      ) : (
        <p className="font-serif text-[24px] font-medium leading-none tracking-[-0.02em] text-[var(--ink)] tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { user: authUser, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(() => _cachedStats === null);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(_cachedUser);
  const [stats, setStats] = useState<UsageStat | null>(_cachedStats);
  const [toolkit, setToolkit] = useState<ToolkitStat | null>(_cachedToolkit);
  const [recentActivity, setRecentActivity] =
    useState<RecentActivity[]>(_cachedActivity);
  const [recentSummaries, setRecentSummaries] =
    useState<RecentSummary[]>(_cachedSummaries);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const loadedForRef = useRef<string | null>(_cacheUserId);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadData = useCallback(
    async (options?: { silent?: boolean }) => {
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
          historyRes,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, avatar_url, plan, requests_used")
            .eq("id", uid)
            .single(),
          supabase
            .from("usage_tracking")
            .select("id, created_at, type")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(8),
          supabase
            .from("usage_tracking")
            .select("*", { count: "exact", head: true })
            .eq("user_id", uid)
            .in("type", ["summary", "summarize"]),
          supabase
            .from("usage_tracking")
            .select("*", { count: "exact", head: true })
            .eq("user_id", uid)
            .eq("type", "chat"),
          supabase
            .from("usage_tracking")
            .select("*", { count: "exact", head: true })
            .eq("user_id", uid)
            .eq("type", "remix"),
          supabase.from("brand_voices").select("id").eq("user_id", uid),
          supabase
            .from("summarizer_history")
            .select("id, source_title, summary_mode, created_at")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(5),
          fetch("/api/history", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ]);

        const profileData = profileRes.data;
        const tier = profileData?.plan || "free";

        const newUser: UserProfile = {
          id: uid,
          email: authUser.email!,
          full_name: profileData?.full_name,
          plan: tier === "pro" ? "pro" : "free",
        };

        const newActivity = (recentUsageRes.data || []).map(
          (row: { id: string; type: string; created_at: string }) => ({
            id: row.id,
            type: row.type,
            created_at: row.created_at,
          })
        );

        const newSummaries = summariesRes.data || [];

        const newStats: UsageStat = {
          summaries: summaryCountRes.count ?? 0,
          chats: chatCountRes.count ?? 0,
          remixes: remixCountRes.count ?? 0,
          brand_voices: brandVoiceRes.data?.length ?? 0,
          requests_used: profileData?.requests_used ?? 0,
          requests_limit: tier === "pro" ? 1000 : 100,
        };

        const newToolkit: ToolkitStat = {
          comments: Array.isArray(historyRes?.comments)
            ? historyRes.comments.length
            : 0,
          repurposes: Array.isArray(historyRes?.repurpose)
            ? historyRes.repurpose.length
            : 0,
        };

        _cachedUser = newUser;
        _cachedStats = newStats;
        _cachedToolkit = newToolkit;
        _cachedActivity = newActivity;
        _cachedSummaries = newSummaries;
        _cacheUserId = uid;
        loadedForRef.current = uid;

        setUser(newUser);
        setRecentActivity(newActivity);
        setRecentSummaries(newSummaries);
        setStats(newStats);
        setToolkit(newToolkit);
        setRefreshKey((key) => key + 1);
      } catch (error) {
        console.error("[Dashboard] Failed to load dashboard data:", error);
        setLoadError(true);
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          plan: "free",
        });
        setStats({
          summaries: 0,
          chats: 0,
          remixes: 0,
          brand_voices: 0,
          requests_used: 0,
          requests_limit: 100,
        });
        setToolkit({ comments: 0, repurposes: 0 });
      } finally {
        setLoading(false);
      }
    },
    [authUser, supabase]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/sign-in");
      return;
    }
    if (
      loadedForRef.current === authUser.id &&
      _cachedStats !== null &&
      _cachedToolkit !== null
    )
      return;
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

  const retryLoad = useCallback(() => {
    loadData();
  }, [loadData]);

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = user?.full_name?.split(" ")[0] || "there";

  if (authLoading) return <LoadingPage />;
  if (!authUser) return <LoadingPage />;

  const isPro = user?.plan === "pro";
  const requestsLeft = stats
    ? Math.max(0, stats.requests_limit - stats.requests_used)
    : 0;

  const totalCreations =
    (stats?.summaries ?? 0) +
    (stats?.chats ?? 0) +
    (stats?.remixes ?? 0) +
    (toolkit?.comments ?? 0) +
    (toolkit?.repurposes ?? 0);

  const statCards = [
    {
      label: "Summaries",
      value: stats?.summaries ?? 0,
      sub: "Content processed",
      href: "/summarizer",
      icon: FileText,
    },
    {
      label: "AI chats",
      value: stats?.chats ?? 0,
      sub: "Conversations",
      href: "/chat",
      icon: MessageSquare,
    },
    {
      label: "Remixes",
      value: stats?.remixes ?? 0,
      sub: "Content adapted",
      href: "/remix",
      icon: Zap,
    },
    {
      label: "Brand voices",
      value: stats?.brand_voices ?? 0,
      sub: "Voices created",
      href: "/brand-voice",
      icon: Mic,
    },
    {
      label: "Comments",
      value: toolkit?.comments ?? 0,
      sub: "Comments generated",
      href: "/comments",
      icon: MessageSquareText,
    },
    {
      label: "Repurposes",
      value: toolkit?.repurposes ?? 0,
      sub: "Repurpose runs",
      href: "/repurpose",
      icon: Wand2,
    },
  ];

  return (
    <Page>
      <PageHeader
        meta={
          <>
            <span className="app-chip app-chip-accent">
              {isPro ? "Pro workspace" : "Free workspace"}
            </span>
            <span className="text-[12px] font-medium text-[var(--ink-3)]">
              {new Date().toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </>
        }
        title={`Good ${greeting}, ${firstName}.`}
        description={
          isPro
            ? "Your studio is on Pro. All stats, usage, and activity are here in one place."
            : "All your stats, usage, and activity in one place."
        }
        actions={
          <>
            <Button asChild>
              <Link href="/summarizer">
                <Sparkles className="h-4 w-4" />
                New summary
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/chat">
                <MessageCircle className="h-4 w-4" />
                Open chat
              </Link>
            </Button>
          </>
        }
      />

      {loadError && !loading ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(180,35,24,0.22)] bg-[rgba(180,35,24,0.04)] px-4 py-3">
          <p className="flex items-center gap-2 text-[12.5px] text-[var(--error)]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Some workspace data could not be loaded. Numbers may be incomplete.
          </p>
          <button
            type="button"
            onClick={retryLoad}
            className="text-[12px] font-semibold text-[var(--brand)] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      {/* All statistics */}
      <section aria-label="Workspace statistics" className="space-y-4">
        <SectionHeading
          title="All statistics"
          description="Everything you have created across Clario."
        />
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => (
            <StatCell
              key={card.label}
              label={card.label}
              value={card.value}
              sub={card.sub}
              href={card.href}
              icon={card.icon}
              loading={loading}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
          <MiniStat
            label="Total creations"
            value={totalCreations}
            loading={loading}
          />
          <MiniStat
            label="Requests used"
            value={stats?.requests_used ?? 0}
            loading={loading}
          />
          <MiniStat
            label="Requests left"
            value={requestsLeft}
            loading={loading}
          />
          <MiniStat label="Plan" value={isPro ? "Pro" : "Free"} loading={loading} />
        </div>
      </section>

      <div className="mt-10 space-y-10">
        <section>
          <SectionHeading
            title="Usage over time"
            description="Daily requests and feature mix across your workspace."
          />
          {loading ? (
            <div className="surface">
              <div className="space-y-4 px-5 py-5 sm:px-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-[200px] w-full" />
              </div>
              <div className="border-t border-[var(--line)] space-y-4 px-5 py-5 sm:px-6">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-[160px] w-full" />
              </div>
            </div>
          ) : (
            <AnalyticsCharts refreshKey={refreshKey} />
          )}
        </section>

        <section>
          <SectionHeading
            title="Recent summaries"
            description="Pick up where you left off."
            action={
              <Link
                href="/summarizer"
                className="link-accent inline-flex items-center gap-1 text-[12px]"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="surface overflow-hidden">
            {loading ? (
              <div className="divide-y divide-[var(--line)]">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSummaries.length === 0 ? (
              <div className="px-6 py-12 sm:px-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)]">
                  <FileText className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <p className="mt-4 text-[15px] font-semibold text-[var(--ink)]">
                  No summaries yet
                </p>
                <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--ink-3)]">
                  Paste an article, a URL, or a YouTube link to create your
                  first one.
                </p>
                <Link
                  href="/summarizer"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2.5 text-[13px] font-semibold text-[var(--ink-2)] no-underline transition-colors hover:border-[var(--brand-line)] hover:text-[var(--brand)]"
                >
                  Open the summarizer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--line)]">
                {recentSummaries.map((summary) => (
                  <li key={summary.id}>
                    <Link
                      href="/summarizer"
                      className="group flex items-center gap-4 px-5 py-4 no-underline transition-colors hover:bg-[var(--surface-2)] sm:px-6"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-3)] transition-colors group-hover:text-[var(--brand)]">
                        <FileText className="h-4 w-4" strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium leading-5 text-[var(--ink)]">
                          {summary.source_title || "Untitled summary"}
                        </span>
                        <span className="mt-1 block text-[12px] leading-4 text-[var(--ink-3)]">
                          {summary.summary_mode.replace(/-/g, " ")} ·{" "}
                          {formatRelativeTime(summary.created_at)}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-[var(--ink-3)] opacity-0 transition-opacity group-hover:opacity-100"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {toasts.length > 0 ? (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 md:bottom-6 md:right-6">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[12.5px] font-medium shadow-[var(--shadow-medium)]",
                toast.type === "success"
                  ? "border-[rgba(21,128,61,0.25)] bg-[rgba(21,128,61,0.06)] text-[var(--success)]"
                  : toast.type === "error"
                    ? "border-[rgba(180,35,24,0.25)] bg-[rgba(180,35,24,0.06)] text-[var(--error)]"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)]"
              )}
            >
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-current opacity-60 transition-opacity hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </Page>
  );
}
