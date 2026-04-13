"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import { AnalyticsCharts } from "@/components/analytics-charts";
import "./dashboard.css";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
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

const NAV_ITEMS: {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}[] = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "AI Chat", href: "/chat", icon: "chat" },
  { label: "Summarizer", href: "/summarizer", icon: "doc" },
  { label: "Remix Studio", href: "/remix", icon: "remix" },
  { label: "Brand Voice", href: "/brand-voice", icon: "voice" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

function NavIcon({ type }: { type: string }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "grid":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "chat":
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "doc":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "remix":
      return (
        <svg {...props}>
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    case "voice":
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "cal":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

function Skeleton({
  w = "100%",
  h = 16,
  r = 8,
}: {
  w?: string | number;
  h?: number;
  r?: number;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background:
          "linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderLeft: `3px solid ${t.type === "success" ? "var(--success)" : t.type === "error" ? "var(--error)" : "var(--accent)"}`,
            borderRadius: 10,
            padding: "11px 14px",
            boxShadow: "0 8px 24px rgba(0,0,0,.2)",
            animation: "fu .3s ease both",
            maxWidth: 320,
            fontFamily: "Geist, system-ui, sans-serif",
          }}
        >
          <span style={{ fontSize: ".82rem", color: "var(--text2)", flex: 1 }}>
            {t.message}
          </span>
          <button
            onClick={() => dismiss(t.id)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text3)",
              cursor: "pointer",
              fontSize: ".75rem",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user: authUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    collapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
    mobileOpen: mobileSidebarOpen,
    setMobileOpen: setMobileSidebarOpen,
  } = useSidebar();

  // State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UsageStat | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [onboardingSteps, setOnboardingSteps] = useState({
    summarize: false,
    remix: false,
    brandVoice: false,
    chat: false,
  });

  // Persist sidebar collapse state
  useEffect(() => {
    const saved = localStorage.getItem("clario-sidebar-collapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("clario-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Toast helpers
  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        4000,
      );
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch user + data
  useEffect(() => {
    async function loadData() {
      try {
        const uid = authUser?.id;
        if (!uid) {
          router.push("/sign-in");
          return;
        }

        const [profileRes, usageRes, brandVoiceRes] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, full_name, avatar_url, subscription_tier, requests_used_this_month",
            )
            .eq("id", uid)
            .single(),
          supabase
            .from("usage_tracking")
            .select("created_at, type")
            .eq("user_id", uid)
            .order("created_at", { ascending: false })
            .limit(60),
          supabase.from("brand_voices").select("id").eq("user_id", uid),
        ]);

        const profileData = profileRes.data;
        const tier = profileData?.subscription_tier || "free";

        setUser({
          id: uid,
          email: authUser.email!,
          full_name: profileData?.full_name,
          avatar_url: profileData?.avatar_url,
          plan: (tier === "pro" ? "pro" : "free") as "free" | "pro",
        });

        // Build stats from usage records
        const usageData = usageRes.data || [];

        const summaries = usageData.filter(
          (r: { type: string }) => r.type === "summary",
        ).length;
        const chats = usageData.filter(
          (r: { type: string }) => r.type === "chat",
        ).length;
        const remixes = usageData.filter(
          (r: { type: string }) => r.type === "remix",
        ).length;
        const brand_voices = brandVoiceRes.data?.length ?? 0;
        const requestsUsed =
          profileData?.requests_used_this_month || usageData.length;
        setStats({
          summaries,
          chats,
          remixes,
          brand_voices,
          requests_used: requestsUsed,
          requests_limit: tier === "pro" ? 1000 : 100,
        });

        // Check onboarding
        const ob = JSON.parse(
          localStorage.getItem("clario-onboarding") || "{}",
        );
        setOnboardingSteps(ob);
        setOnboardingDone(ob.summarize && ob.remix && ob.brandVoice && ob.chat);
      } catch {
        // Show empty state instead of fake mock data
        setUser({
          id: authUser?.id || "unknown",
          email: authUser?.email || "",
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
      } finally {
        setLoading(false);
      }
    }
    if (!authUser && !loading) {
      router.push("/sign-in");
      return;
    }
    loadData();
  }, [authUser]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    addToast("Signed out successfully", "success");
  };

  const completeOnboardingStep = (step: keyof typeof onboardingSteps) => {
    const updated = { ...onboardingSteps, [step]: true };
    setOnboardingSteps(updated);
    localStorage.setItem("clario-onboarding", JSON.stringify(updated));
    if (Object.values(updated).every(Boolean)) {
      setOnboardingDone(true);
      addToast("Onboarding complete! 🎉", "success");
    }
  };

  const usagePercent = stats
    ? Math.round((stats.requests_used / stats.requests_limit) * 100)
    : 0;
  const isDark = theme === "dark";

  const STAT_CARDS = [
    {
      label: "Summaries",
      value: stats?.summaries ?? 0,
      sub: "Videos processed",
      color: "#f97316",
      href: "/summarizer",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
        </svg>
      ),
    },
    {
      label: "AI Chats",
      value: stats?.chats ?? 0,
      sub: "Conversations",
      color: "#0ea5e9",
      href: "/chat",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      label: "Remixes",
      value: stats?.remixes ?? 0,
      sub: "Content remixed",
      color: "#8b5cf6",
      href: "/remix",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      ),
    },
    {
      label: "Brand Voices",
      value: stats?.brand_voices ?? 0,
      sub: "Voices created",
      color: "#10b981",
      href: "/brand-voice",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  const ONBOARDING = [
    {
      key: "summarize" as const,
      label: "Summarize your first video",
      href: "/summarizer",
      done: onboardingSteps.summarize,
    },
    {
      key: "remix" as const,
      label: "Remix content into 10 formats",
      href: "/remix",
      done: onboardingSteps.remix,
    },
    {
      key: "brandVoice" as const,
      label: "Create your Brand Voice",
      href: "/brand-voice",
      done: onboardingSteps.brandVoice,
    },
    {
      key: "chat" as const,
      label: "Ask AI your first question",
      href: "/chat",
      done: onboardingSteps.chat,
    },
  ];
  const onboardingProgress = ONBOARDING.filter((o) => o.done).length;

  return (
    <>
      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      {mobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="dash-layout">
        <aside
          className="sidebar"
          data-collapsed={String(sidebarCollapsed)}
          data-mobile-open={String(mobileSidebarOpen)}
        >
          <div className="sb-logo">
            <div className="sb-logo-mark">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="sb-logo-text">Clario</span>
          </div>

          <nav className="sb-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-item${pathname === item.href ? " active" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <NavIcon type={item.icon} />
                <span className="sb-lbl">{item.label}</span>
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </Link>
            ))}
          </nav>

          <div className="sb-bottom">
            {!sidebarCollapsed && stats && (
              <div
                style={{
                  padding: "8px 10px",
                  background: "var(--bg3)",
                  borderRadius: 9,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: ".68rem",
                      color: "var(--text3)",
                      fontWeight: 500,
                    }}
                  >
                    Usage
                  </span>
                  <span style={{ fontSize: ".68rem", color: "var(--text3)" }}>
                    {stats.requests_used}/{stats.requests_limit}
                  </span>
                </div>
                <div className="usage-bar" style={{ margin: 0 }}>
                  <div
                    className="usage-fill"
                    style={{ width: `${usagePercent}%` }}
                    data-danger={String(usagePercent > 85)}
                  />
                </div>
              </div>
            )}

            {user?.plan === "free" && (
              <button
                className="sb-upgrade"
                onClick={() => router.push("/pricing")}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Upgrade to Pro
              </button>
            )}

            <button
              className="sb-btn"
              onClick={toggleTheme}
              title={
                sidebarCollapsed
                  ? isDark
                    ? "Light mode"
                    : "Dark mode"
                  : undefined
              }
            >
              {isDark ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span className="sb-btn-lbl">
                {isDark ? "Light mode" : "Dark mode"}
              </span>
            </button>

            <button className="sb-btn" onClick={handleSignOut}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="sb-btn-lbl">Sign out</span>
            </button>

            <button
              className="sb-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              )}
              <span className="sb-btn-lbl">Collapse</span>
            </button>
          </div>
        </aside>

        <div className="main-area">
          <div className="topbar">
            <button
              className="topbar-btn topbar-hamburger"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="topbar-title">
              {loading ? (
                <Skeleton w={200} h={18} />
              ) : (
                <>
                  <span className="topbar-greeting-full">
                    {`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${user?.full_name?.split(" ")[0] || "there"} 👋`}
                  </span>
                  <span className="topbar-greeting-short">
                    {`${user?.full_name?.split(" ")[0] || "Hey"} 👋`}
                  </span>
                </>
              )}
            </div>
            <button
              className="topbar-btn"
              onClick={toggleTheme}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="topbar-btn"
              onClick={() => router.push("/settings")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            {user && (
              <div
                className="avatar-btn"
                onClick={() => router.push("/settings")}
                title={user.full_name || user.email}
              >
                {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="page-content">
            <div className="stat-grid">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="card stat-card">
                      <Skeleton h={14} w="60%" />
                      <Skeleton h={36} w="40%" r={6} />
                      <Skeleton h={12} w="50%" />
                    </div>
                  ))
                : STAT_CARDS.map((card) => (
                    <Link
                      key={card.label}
                      href={card.href}
                      className="card stat-card"
                    >
                      <div className="stat-label" style={{ color: card.color }}>
                        {card.icon}
                        {card.label}
                      </div>
                      <div className="stat-value">{card.value}</div>
                      <div className="stat-sub">{card.sub}</div>
                    </Link>
                  ))}
            </div>

            <div>
              <div
                style={{
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 8,
                }}
              >
                Analytics
              </div>
              {loading ? (
                <div className="analytics-mini-grid">
                  <div className="analytics-mini-skeleton" />
                  <div className="analytics-mini-skeleton" />
                </div>
              ) : (
                <AnalyticsCharts />
              )}
            </div>

            <div>
              <div
                style={{
                  fontSize: ".75rem",
                  fontWeight: 600,
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 10,
                }}
              >
                Quick Actions
              </div>
              <div className="qa-grid">
                {[
                  {
                    label: "Summarize a video",
                    href: "/summarizer",
                    color: "#f97316",
                    bg: "var(--accent-l)",
                    icon: "doc",
                  },
                  {
                    label: "Remix content",
                    href: "/remix",
                    color: "#8b5cf6",
                    bg: isDark ? "#1e1b2e" : "#faf5ff",
                    icon: "remix",
                  },
                  {
                    label: "Open AI chat",
                    href: "/chat",
                    color: "#0ea5e9",
                    bg: isDark ? "#0c1a26" : "#f0f9ff",
                    icon: "chat",
                  },
                  {
                    label: "Set brand voice",
                    href: "/brand-voice",
                    color: "#10b981",
                    bg: isDark ? "#0c1f18" : "#f0fdf4",
                    icon: "voice",
                  },
                ].map((qa) => (
                  <Link key={qa.label} href={qa.href} className="qa-card">
                    <div
                      className="qa-icon"
                      style={{ background: qa.bg, color: qa.color }}
                    >
                      <NavIcon type={qa.icon} />
                    </div>
                    <span>{qa.label}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
