"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { LoadingPage } from "@/components/ui/loading-page";

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

function Skeleton({ w = "100%", h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "linear-gradient(90deg, hsl(var(--card)) 25%, hsl(var(--border)) 50%, hsl(var(--card)) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

function NavIcon({ type }: { type: string }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "doc": return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>;
    case "remix": return <svg {...p}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>;
    case "chat": return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case "voice": return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
    default: return null;
  }
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderLeft: `3px solid ${t.type === "success" ? "#10b981" : t.type === "error" ? "#ef4444" : "hsl(var(--accent))"}`, borderRadius: 10, padding: "11px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.2)", maxWidth: 320, fontFamily: "var(--sans)" }}>
          <span style={{ fontSize: ".82rem", color: "var(--text2)", flex: 1 }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: ".75rem", padding: 0 }}>✕</button>
        </div>
      ))}
    </div>
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
          supabase.from("profiles").select("id, full_name, avatar_url, subscription_tier, requests_used_this_month").eq("id", uid).single(),
          supabase.from("usage_tracking").select("created_at, type").eq("user_id", uid).order("created_at", { ascending: false }).limit(60),
          supabase.from("brand_voices").select("id").eq("user_id", uid),
        ]);

        const profileData = profileRes.data;
        const tier = profileData?.subscription_tier || "free";

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
          requests_used: profileData?.requests_used_this_month || usageData.length,
          requests_limit: tier === "pro" ? 1000 : 100,
        });

        const ob = JSON.parse(localStorage.getItem("clario-onboarding") || "{}");
        if (ob.summarize && ob.remix && ob.brandVoice && ob.chat) {
          addToast("Onboarding complete! 🎉", "success");
        }
      } catch {
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

  const isDark = theme === "dark";
  const usagePercent = stats ? Math.round((stats.requests_used / stats.requests_limit) * 100) : 0;

  const STAT_CARDS = [
    { label: "Summaries", value: stats?.summaries ?? 0, sub: "Videos processed", color: "#f97316", href: "/summarizer", icon: "doc" },
    { label: "AI Chats", value: stats?.chats ?? 0, sub: "Conversations", color: "#0ea5e9", href: "/chat", icon: "chat" },
    { label: "Remixes", value: stats?.remixes ?? 0, sub: "Content remixed", color: "#8b5cf6", href: "/remix", icon: "remix" },
    { label: "Brand Voices", value: stats?.brand_voices ?? 0, sub: "Voices created", color: "#10b981", href: "/brand-voice", icon: "voice" },
  ];

  const QUICK_ACTIONS = [
    { label: "Summarize a video", href: "/summarizer", color: "#f97316", bg: "var(--accent-l)", icon: "doc" },
    { label: "Remix content", href: "/remix", color: "#8b5cf6", bg: isDark ? "#1e1b2e" : "#faf5ff", icon: "remix" },
    { label: "Open AI chat", href: "/chat", color: "#0ea5e9", bg: isDark ? "#0c1a26" : "#f0f9ff", icon: "chat" },
    { label: "Set brand voice", href: "/brand-voice", color: "#10b981", bg: isDark ? "#0c1f18" : "#f0fdf4", icon: "voice" },
  ];

  if (authLoading) return <LoadingPage />;
  if (!authUser) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .dash-page{flex:1;display:flex;flex-direction:column;min-height:100vh;background:var(--bg)}
        .dash-topbar{height:56px;border-bottom:1px solid hsl(var(--border));display:flex;align-items:center;padding:0 20px;gap:12px;background:var(--bg);position:sticky;top:0;z-index:40;flex-shrink:0}
        .dash-topbar-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;border:1px solid hsl(var(--border));background:var(--bg2);color:var(--text3);cursor:pointer;transition:all .15s}
        .dash-topbar-btn:hover{background:var(--bg3);color:var(--text2)}
        .dash-hamburger{display:none}
        @media(max-width:768px){.dash-hamburger{display:flex}.dash-topbar{padding:0 12px;gap:8px}}
        .dash-content{flex:1;padding:24px;overflow-y:auto;display:flex;flex-direction:column;gap:20px}
        @media(max-width:768px){.dash-content{padding:16px;gap:14px}}
        @media(max-width:480px){.dash-content{padding:12px;gap:12px}}
        .dash-content>*{animation:fu .4s ease both}
        .dash-content>*:nth-child(1){animation-delay:.05s}
        .dash-content>*:nth-child(2){animation-delay:.1s}
        .dash-content>*:nth-child(3){animation-delay:.15s}
        .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        @media(max-width:900px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.stat-grid{grid-template-columns:1fr}}
        .stat-card{background:hsl(var(--card));border:1px solid var(--card-b);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:4px;cursor:pointer;transition:transform .2s,box-shadow .2s;text-decoration:none}
        .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.12)}
        .stat-label{font-size:.72rem;font-weight:500;display:flex;align-items:center;gap:6px;margin-bottom:4px}
        .stat-value{font-family:var(--serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:300;letter-spacing:-.04em;color:var(--text);line-height:1}
        .stat-sub{font-size:.7rem;color:var(--text3);margin-top:4px}
        .section-label{font-size:.75rem;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
        .analytics-mini-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        @media(max-width:900px){.analytics-mini-grid{grid-template-columns:1fr}}
        .analytics-mini-skeleton{background:linear-gradient(90deg,var(--bg3) 0%,var(--bg2) 50%,var(--bg3) 100%);background-size:200% 100%;animation:shimmer 2s infinite;border-radius:10px;height:140px}
        .qa-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        @media(max-width:700px){.qa-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:400px){.qa-grid{grid-template-columns:1fr}}
        .qa-card{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:16px;border-radius:11px;border:1px solid var(--card-b);background:hsl(var(--card));text-decoration:none;color:var(--text2);font-size:.8rem;font-weight:500;transition:all .2s;cursor:pointer}
        .qa-card:hover{border-color:hsl(var(--accent));background:var(--accent-l);color:hsl(var(--accent));transform:translateY(-2px)}
        .qa-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center}
        .usage-bar{height:6px;background:var(--bg3);border-radius:100px;overflow:hidden;margin:6px 0 2px}
        .usage-fill{height:100%;border-radius:100px;transition:width 1s ease;background:hsl(var(--accent))}
        .usage-fill[data-danger="true"]{background:#ef4444}
        .avatar-chip{width:32px;height:32px;border-radius:50%;border:1.5px solid hsl(var(--border));background:var(--accent-l);color:hsl(var(--accent));font-size:.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
      `}</style>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      <div className="dash-page">
        {/* Topbar */}
        <div className="dash-topbar">
          <button className="dash-topbar-btn dash-hamburger" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 300, color: "var(--text)", flex: 1 }}>
            {loading ? "Dashboard" : `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${user?.full_name?.split(" ")[0] || "there"} 👋`}
          </span>
          <button className="dash-topbar-btn" onClick={toggleTheme} title={isDark ? "Light mode" : "Dark mode"}>
            {isDark
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            }
          </button>
          <button className="dash-topbar-btn" onClick={() => router.push("/settings")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {user && (
            <div className="avatar-chip" onClick={() => router.push("/settings")} title={user.full_name || user.email}>
              {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="dash-content">
          {/* Usage bar for free users */}
          {!loading && user?.plan === "free" && stats && (
            <div style={{ background: "hsl(var(--card))", border: "1px solid var(--card-b)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: ".74rem", fontWeight: 600, color: "var(--text2)" }}>Monthly Usage</span>
                  <span style={{ fontSize: ".74rem", color: usagePercent > 85 ? "#ef4444" : "var(--text3)" }}>{stats.requests_used}/{stats.requests_limit}</span>
                </div>
                <div className="usage-bar">
                  <div className="usage-fill" style={{ width: `${usagePercent}%` }} data-danger={String(usagePercent > 85)} />
                </div>
              </div>
              <Link href="/pricing" style={{ background: "hsl(var(--accent))", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: ".78rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap" }}>
                Upgrade to Pro
              </Link>
            </div>
          )}

          {/* Stat cards */}
          <div className="stat-grid">
            {loading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} style={{ background: "hsl(var(--card))", border: "1px solid var(--card-b)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skeleton h={12} w="55%" /><Skeleton h={32} w="35%" r={6} /><Skeleton h={10} w="50%" />
                  </div>
                ))
              : STAT_CARDS.map((card) => (
                  <Link key={card.label} href={card.href} className="stat-card">
                    <div className="stat-label" style={{ color: card.color }}>
                      <NavIcon type={card.icon} />
                      {card.label}
                    </div>
                    <div className="stat-value">{card.value}</div>
                    <div className="stat-sub">{card.sub}</div>
                  </Link>
                ))}
          </div>

          {/* Analytics */}
          <div>
            <div className="section-label">Analytics</div>
            {loading
              ? <div className="analytics-mini-grid"><div className="analytics-mini-skeleton" /><div className="analytics-mini-skeleton" /></div>
              : <AnalyticsCharts />
            }
          </div>

          {/* Quick Actions */}
          <div>
            <div className="section-label">Quick Actions</div>
            <div className="qa-grid">
              {QUICK_ACTIONS.map((qa) => (
                <Link key={qa.label} href={qa.href} className="qa-card">
                  <div className="qa-icon" style={{ background: qa.bg, color: qa.color }}>
                    <NavIcon type={qa.icon} />
                  </div>
                  <span>{qa.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
