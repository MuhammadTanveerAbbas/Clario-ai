"use client";

import { useState, useEffect } from "react";
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

const NAV_ITEMS: { label: string; href: string; icon: string }[] = [
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

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UsageStat | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("clario-sidebar-collapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("clario-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

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

        const usageData = usageRes.data || [];
        setStats({
          summaries: usageData.filter(
            (r: { type: string }) => r.type === "summary",
          ).length,
          chats: usageData.filter((r: { type: string }) => r.type === "chat")
            .length,
          remixes: usageData.filter((r: { type: string }) => r.type === "remix")
            .length,
          brand_voices: brandVoiceRes.data?.length ?? 0,
          requests_used:
            profileData?.requests_used_this_month || usageData.length,
          requests_limit: tier === "pro" ? 1000 : 100,
        });
      } catch {
        setUser({
          id: authUser?.id || "",
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
      icon: "doc",
    },
    {
      label: "AI Chats",
      value: stats?.chats ?? 0,
      sub: "Conversations",
      color: "#0ea5e9",
      href: "/chat",
      icon: "chat",
    },
    {
      label: "Remixes",
      value: stats?.remixes ?? 0,
      sub: "Content remixed",
      color: "#8b5cf6",
      href: "/remix",
      icon: "remix",
    },
    {
      label: "Brand Voices",
      value: stats?.brand_voices ?? 0,
      sub: "Voices created",
      color: "#10b981",
      href: "/brand-voice",
      icon: "voice",
    },
  ];

  const QUICK_ACTIONS = [
    {
      label: "Summarize",
      desc: "YouTube, text, or any URL",
      href: "/summarizer",
      color: "#f97316",
      icon: "doc",
      gradient: isDark
        ? "linear-gradient(135deg,#2a1500,#1a0f07)"
        : "linear-gradient(135deg,#fff7ed,#ffedd5)",
    },
    {
      label: "Remix Studio",
      desc: "10 platform formats at once",
      href: "/remix",
      color: "#8b5cf6",
      icon: "remix",
      gradient: isDark
        ? "linear-gradient(135deg,#1e1b2e,#130f1e)"
        : "linear-gradient(135deg,#faf5ff,#ede9fe)",
    },
    {
      label: "AI Chat",
      desc: "Creator-focused assistant",
      href: "/chat",
      color: "#0ea5e9",
      icon: "chat",
      gradient: isDark
        ? "linear-gradient(135deg,#0c1a26,#071018)"
        : "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
    },
    {
      label: "Brand Voice",
      desc: "Define your tone & style",
      href: "/brand-voice",
      color: "#10b981",
      icon: "voice",
      gradient: isDark
        ? "linear-gradient(135deg,#0c1f18,#071410)"
        : "linear-gradient(135deg,#f0fdf4,#dcfce7)",
    },
  ];

  const greeting = `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${user?.full_name?.split(" ")[0] || "there"} 👋`;

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="dash-layout">
        {/* ── Sidebar ── */}
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
              </Link>
            ))}
          </nav>

          <div className="sb-bottom">
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

        {/* ── Main ── */}
        <div className="main-area">
          {/* Topbar */}
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
                  <span className="topbar-greeting-full">{greeting}</span>
                  <span className="topbar-greeting-short">
                    {user?.full_name?.split(" ")[0] || "Hey"} 👋
                  </span>
                </>
              )}
            </div>
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

          {/* Page content */}
          <div className="page-content">
            {/* ── Stat Cards ── */}
            <div className="overview-grid">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="overview-card">
                      <Skeleton h={12} w="50%" />
                      <Skeleton h={40} w="35%" r={6} />
                      <Skeleton h={11} w="60%" />
                    </div>
                  ))
                : STAT_CARDS.map((card) => (
                    <Link
                      key={card.label}
                      href={card.href}
                      className="overview-card"
                      style={
                        { "--ov-color": card.color } as React.CSSProperties
                      }
                    >
                      <div className="ov-top">
                        <span
                          className="ov-icon"
                          style={{
                            color: card.color,
                            background: `${card.color}18`,
                          }}
                        >
                          <NavIcon type={card.icon} />
                        </span>
                        <span className="ov-label">{card.label}</span>
                      </div>
                      <div className="ov-value">{card.value}</div>
                      <div className="ov-sub">{card.sub}</div>
                    </Link>
                  ))}
            </div>

            {/* ── Quick Actions ── */}
            <div className="section-block">
              <div className="section-label">Quick Actions</div>
              <div className="launch-grid">
                {QUICK_ACTIONS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="launch-card"
                  >
                    <div
                      className="launch-icon"
                      style={{ background: item.gradient, color: item.color }}
                    >
                      <NavIcon type={item.icon} />
                    </div>
                    <div className="launch-body">
                      <span
                        className="launch-label"
                        style={{ color: item.color }}
                      >
                        {item.label}
                      </span>
                      <span className="launch-desc">{item.desc}</span>
                    </div>
                    <svg
                      className="launch-arrow"
                      width="14"
                      height="14"
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

            {/* ── Usage + Analytics ── */}
            <div className="dash-bottom-grid">
              {/* Usage Meter */}
              <div className="section-block">
                <div className="section-label">Monthly Usage</div>
                <div className="usage-meter-card">
                  <div className="um-top">
                    <div className="um-left">
                      {loading ? (
                        <Skeleton w={80} h={36} r={6} />
                      ) : (
                        <>
                          <span
                            className="um-count"
                            data-danger={String(usagePercent > 85)}
                          >
                            {stats?.requests_used ?? 0}
                          </span>
                          <span className="um-limit">
                            / {stats?.requests_limit ?? 100} requests
                          </span>
                        </>
                      )}
                    </div>
                    {!loading && (
                      <span
                        className="um-plan"
                        data-pro={String(user?.plan === "pro")}
                      >
                        {user?.plan === "pro" ? "Pro" : "Free"}
                      </span>
                    )}
                  </div>
                  <div className="um-bar-track">
                    <div
                      className="um-bar-fill"
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      data-danger={String(usagePercent > 85)}
                    />
                  </div>
                  <div className="um-breakdown">
                    {[
                      {
                        label: "Summaries",
                        val: stats?.summaries ?? 0,
                        color: "#f97316",
                      },
                      {
                        label: "Chats",
                        val: stats?.chats ?? 0,
                        color: "#0ea5e9",
                      },
                      {
                        label: "Remixes",
                        val: stats?.remixes ?? 0,
                        color: "#8b5cf6",
                      },
                      {
                        label: "Remaining",
                        val: Math.max(
                          0,
                          (stats?.requests_limit ?? 100) -
                            (stats?.requests_used ?? 0),
                        ),
                        color: "var(--text3)",
                      },
                    ].map((item) => (
                      <div key={item.label} className="um-seg">
                        <span
                          className="um-seg-dot"
                          style={{ background: item.color }}
                        />
                        <span className="um-seg-label">{item.label}</span>
                        <span className="um-seg-val">{item.val}</span>
                      </div>
                    ))}
                  </div>
                  {user?.plan === "free" && (
                    <Link href="/pricing" className="um-upgrade-btn">
                      Upgrade to Pro 1,000 requests/mo
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>

              {/* Analytics Charts */}
              <div className="section-block">
                <div className="section-label">Analytics</div>
                {loading ? (
                  <div className="analytics-mini-grid">
                    <div className="analytics-mini-skeleton" />
                    <div className="analytics-mini-skeleton" />
                  </div>
                ) : (
                  <AnalyticsCharts />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
