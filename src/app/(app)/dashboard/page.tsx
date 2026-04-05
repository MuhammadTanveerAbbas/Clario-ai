"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";


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

interface ActivityPoint {
  date: string;
  requests: number;
  summaries: number;
  remixes: number;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "AI Chat", href: "/chat", icon: "chat" },
  { label: "Summarizer", href: "/summarizer", icon: "doc" },
  { label: "Remix Studio", href: "/remix", icon: "remix" },
  { label: "Brand Voice", href: "/brand-voice", icon: "voice" },
  { label: "Calendar", href: "/calendar", icon: "cal", badge: "New" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

function NavIcon({ type }: { type: string }) {
  const props = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "grid": return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case "chat": return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "doc": return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
    case "remix": return <svg {...props}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
    case "voice": return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "cal": return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    default: return null;
  }
}

function Skeleton({ w = "100%", h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }} />
  );
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "var(--card)", border: "1px solid var(--border)",
          borderLeft: `3px solid ${t.type === "success" ? "var(--success)" : t.type === "error" ? "var(--error)" : "var(--accent)"}`,
          borderRadius: 10, padding: "11px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,.2)",
          animation: "fu .3s ease both",
          maxWidth: 320, fontFamily: "Geist, system-ui, sans-serif",
        }}>
          <span style={{ fontSize: ".82rem", color: "var(--text2)", flex: 1 }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: ".75rem", padding: 0 }}>✕</button>
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
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed, mobileOpen: mobileSidebarOpen, setMobileOpen: setMobileSidebarOpen } = useSidebar();

  // State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UsageStat | null>(null);
  const [activity, setActivity] = useState<ActivityPoint[]>([]);
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
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch user + data
  useEffect(() => {
    async function loadData() {
      try {
        const uid = authUser?.id;
        if (!uid) { router.push("/sign-in"); return; }

        const [profileRes, usageRes, brandVoiceRes] = await Promise.all([
          supabase.from("profiles").select("id, full_name, avatar_url, subscription_tier, requests_used_this_month").eq("id", uid).single(),
          supabase.from("usage_tracking").select("created_at, type").eq("user_id", uid).order("created_at", { ascending: false }).limit(60),
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

        // Build activity from usage records
        const usageData = usageRes.data || [];
        const grouped: Record<string, ActivityPoint> = {};
        usageData.forEach((row: { created_at: string; type: string }) => {
          const date = new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (!grouped[date]) grouped[date] = { date, requests: 0, summaries: 0, remixes: 0 };
          grouped[date].requests++;
          if (row.type === "summary") grouped[date].summaries++;
          if (row.type === "remix") grouped[date].remixes++;
        });
        const activityArr = Object.values(grouped).slice(-14);
        setActivity(activityArr.length > 0 ? activityArr : []);

        const summaries = usageData.filter((r: { type: string }) => r.type === "summary").length;
        const chats = usageData.filter((r: { type: string }) => r.type === "chat").length;
        const remixes = usageData.filter((r: { type: string }) => r.type === "remix").length;
        const brand_voices = brandVoiceRes.data?.length ?? 0;
        const requestsUsed = profileData?.requests_used_this_month || usageData.length;
        setStats({
          summaries, chats, remixes, brand_voices,
          requests_used: requestsUsed,
          requests_limit: tier === "pro" ? 1000 : 100,
        });

        // Check onboarding
        const ob = JSON.parse(localStorage.getItem("clario-onboarding") || "{}");
        setOnboardingSteps(ob);
        setOnboardingDone(ob.summarize && ob.remix && ob.brandVoice && ob.chat);
      } catch {
        // Show empty state instead of fake mock data
        setUser({ id: authUser?.id || "unknown", email: authUser?.email || "", plan: "free" });
        setStats({ summaries: 0, chats: 0, remixes: 0, brand_voices: 0, requests_used: 0, requests_limit: 100 });
        setActivity([]);
      } finally {
        setLoading(false);
      }
    }
    if (!authUser && !loading) { router.push("/sign-in"); return; }
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

  const usagePercent = stats ? Math.round((stats.requests_used / stats.requests_limit) * 100) : 0;
  const isDark = theme === "dark";

  const STAT_CARDS = [
    { label: "Summaries", value: stats?.summaries ?? 0, sub: "Videos processed", color: "#f97316", href: "/summarizer",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg> },
    { label: "AI Chats", value: stats?.chats ?? 0, sub: "Conversations", color: "#0ea5e9", href: "/chat",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { label: "Remixes", value: stats?.remixes ?? 0, sub: "Content remixed", color: "#8b5cf6", href: "/remix",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> },
    { label: "Brand Voices", value: stats?.brand_voices ?? 0, sub: "Voices created", color: "#10b981", href: "/brand-voice",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  ];

  const ONBOARDING = [
    { key: "summarize" as const, label: "Summarize your first video", href: "/summarizer", done: onboardingSteps.summarize },
    { key: "remix" as const, label: "Remix content into 10 formats", href: "/remix", done: onboardingSteps.remix },
    { key: "brandVoice" as const, label: "Create your Brand Voice", href: "/brand-voice", done: onboardingSteps.brandVoice },
    { key: "chat" as const, label: "Ask AI your first question", href: "/chat", done: onboardingSteps.chat },
  ];
  const onboardingProgress = ONBOARDING.filter(o => o.done).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Geist:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--accent:#f97316;--serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif}
        body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

        .dash-layout{display:flex;height:100vh;overflow:hidden;background:var(--bg)}

        .sidebar{width:220px;min-height:100vh;background:var(--sidebar);border-right:1px solid var(--sidebar-b);display:flex;flex-direction:column;transition:width .22s cubic-bezier(.4,0,.2,1);flex-shrink:0;position:sticky;top:0;height:100vh;overflow:hidden}
        .sidebar[data-collapsed="true"]{width:60px}

        .sb-logo{height:56px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid var(--sidebar-b);gap:10px;overflow:hidden;flex-shrink:0;transition:padding .22s}
        .sidebar[data-collapsed="true"] .sb-logo{padding:0 14px}
        .sb-logo-mark{width:28px;height:28px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sb-logo-text{font-family:var(--serif);font-size:1.2rem;font-weight:300;color:var(--text);letter-spacing:-.02em;white-space:nowrap;opacity:1;transition:opacity .15s;pointer-events:none}
        .sidebar[data-collapsed="true"] .sb-logo-text{opacity:0}

        .sb-nav{flex:1;padding:10px 8px;display:flex;flex-direction:column;gap:2px;overflow:hidden auto}
        .sb-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;border:1px solid transparent;background:transparent;cursor:pointer;text-decoration:none;color:var(--text3);font-family:var(--sans);font-size:.82rem;font-weight:400;transition:all .15s;white-space:nowrap;justify-content:flex-start;position:relative}
        .sidebar[data-collapsed="true"] .sb-item{justify-content:center;padding:9px 0;gap:0}
        .sidebar[data-collapsed="true"] .sb-item svg{flex-shrink:0}
        .sb-item:hover{background:var(--bg3);color:var(--text2);border-color:var(--border)}
        .sb-item.active{background:var(--accent-l);color:var(--accent);font-weight:500;border-color:var(--accent)}

        .sb-lbl{opacity:1;transition:opacity .12s;pointer-events:none;flex:1}
        .sidebar[data-collapsed="true"] .sb-lbl{opacity:0;max-width:0;overflow:hidden}
        .sb-badge{font-size:.56rem;font-weight:700;background:var(--accent);color:#fff;padding:2px 6px;border-radius:100px;opacity:1;transition:opacity .12s,max-width .12s,padding .12s;max-width:60px}
        .sidebar[data-collapsed="true"] .sb-badge{opacity:0;max-width:0;overflow:hidden;padding:0}

        .sb-bottom{padding:10px 8px 14px;border-top:1px solid var(--sidebar-b);display:flex;flex-direction:column;gap:5px;flex-shrink:0}
        .sb-btn{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;border:none;background:transparent;cursor:pointer;color:var(--text3);font-family:var(--sans);font-size:.78rem;font-weight:400;transition:all .15s;width:100%;justify-content:flex-start}
        .sidebar[data-collapsed="true"] .sb-btn{justify-content:center;padding:8px 0;gap:0}
        .sb-btn:hover{background:var(--bg3);color:var(--text2)}
        .sb-btn-lbl{opacity:1;transition:opacity .12s;pointer-events:none}
        .sidebar[data-collapsed="true"] .sb-btn-lbl{opacity:0;max-width:0;overflow:hidden}

        .sb-upgrade{margin:0 2px 4px;background:var(--accent);color:#fff;border:none;border-radius:9px;padding:10px;font-family:var(--sans);font-size:.76rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background .18s,opacity .15s}
        .sidebar[data-collapsed="true"] .sb-upgrade{opacity:0;pointer-events:none;height:0;padding:0;margin:0;overflow:hidden}
        .sb-upgrade:hover{background:#ea6c0a}

        .topbar{height:56px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:12px;background:var(--bg);position:sticky;top:0;z-index:40;flex-shrink:0}
        .topbar-title{font-family:var(--serif);font-size:1.1rem;font-weight:300;color:var(--text);letter-spacing:-.02em;flex:1}
        .topbar-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text3);cursor:pointer;transition:all .15s}
        .topbar-btn:hover{background:var(--bg3);color:var(--text2);border-color:var(--border2)}
        .topbar-hamburger{display:none}
        @media(max-width:768px){.topbar-hamburger{display:flex}.topbar{padding:0 12px;gap:8px}}
        .avatar-btn{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--border);background:var(--accent-l);color:var(--accent);font-size:.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0}
        .avatar-btn:hover{border-color:var(--accent)}

        .main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
        .page-content{flex:1;padding:24px;overflow-y:auto;display:flex;flex-direction:column;gap:20px}
        @media(max-width:768px){.page-content{padding:16px;gap:14px}}
        @media(max-width:480px){.page-content{padding:12px;gap:12px}}

        .card{background:var(--card);border:1px solid var(--card-b);border-radius:14px;overflow:hidden}
        .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        @media(max-width:900px){.stat-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.stat-grid{grid-template-columns:1fr}}
        .stat-card{padding:20px;display:flex;flex-direction:column;gap:4px;cursor:pointer;transition:transform .2s,box-shadow .2s;text-decoration:none}
        .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.12)}
        .stat-label{font-size:.72rem;font-weight:500;color:var(--text3);display:flex;align-items:center;gap:6px;margin-bottom:4px}
        .stat-value{font-family:var(--serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:300;letter-spacing:-.04em;color:var(--text);line-height:1}
        .stat-sub{font-size:.7rem;color:var(--text3);margin-top:4px}

        .charts-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:14px}
        @media(max-width:900px){.charts-grid{grid-template-columns:1fr}}
        @media(max-width:768px){.charts-grid{gap:12px}}
        .chart-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 0;margin-bottom:4px}
        .chart-title{font-size:.82rem;font-weight:600;color:var(--text2)}
        .chart-badge{font-size:.64rem;font-weight:700;background:var(--accent-l);color:var(--accent);padding:2px 9px;border-radius:100px;border:1px solid var(--accent-m)}

        .usage-bar{height:6px;background:var(--bg3);border-radius:100px;overflow:hidden;margin:8px 0 4px}
        .usage-fill{height:100%;border-radius:100px;transition:width 1s ease;background:var(--accent)}
        .usage-fill[data-danger="true"]{background:#ef4444}
        span[data-danger="true"]{color:#ef4444!important}

        .ob-step{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:9px;background:var(--bg3);margin-bottom:6px;cursor:pointer;text-decoration:none;transition:background .15s}
        .ob-step:hover{background:var(--bg2)}
        .ob-check{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
        .ob-check.done{background:var(--accent);border-color:var(--accent)}
        .ob-label{font-size:.82rem;color:var(--text2);font-weight:500}
        .ob-label.done{text-decoration:line-through;color:var(--text3)}

        .qa-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        @media(max-width:700px){.qa-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:400px){.qa-grid{grid-template-columns:1fr}}
        .qa-card{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:16px;border-radius:11px;border:1px solid var(--card-b);background:var(--card);text-decoration:none;color:var(--text2);font-size:.8rem;font-weight:500;transition:all .2s;cursor:pointer}
        .qa-card:hover{border-color:var(--accent);background:var(--accent-l);color:var(--accent);transform:translateY(-2px)}
        .qa-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center}

        @media(max-width:768px){
          .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:200;width:220px!important;transition:transform .25s cubic-bezier(.4,0,.2,1)}
          .sidebar[data-mobile-open="false"]{transform:translateX(-100%)}
          .sidebar[data-mobile-open="true"]{transform:translateX(0)}
          .sb-lbl,.sb-badge,.sb-btn-lbl{opacity:1!important;max-width:none!important;overflow:visible!important;padding:2px 6px!important}
          .sb-item{justify-content:flex-start!important;padding:9px 10px!important;gap:10px!important}
          .sb-btn{justify-content:flex-start!important;padding:8px 10px!important;gap:9px!important}
          .sb-upgrade{opacity:1!important;pointer-events:auto!important;height:auto!important;padding:10px!important;margin:0 2px 4px!important}
        }
        .mobile-overlay{display:none}
        @media(max-width:768px){.mobile-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:190}}

        .page-content>*{animation:fu .4s ease both}
        .page-content>*:nth-child(1){animation-delay:.05s}
        .page-content>*:nth-child(2){animation-delay:.1s}
        .page-content>*:nth-child(3){animation-delay:.15s}
        .page-content>*:nth-child(4){animation-delay:.2s}
        .page-content>*:nth-child(5){animation-delay:.25s}
      `}</style>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      {mobileSidebarOpen && <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />}

      <div className="dash-layout">
        <aside className="sidebar" data-collapsed={String(sidebarCollapsed)} data-mobile-open={String(mobileSidebarOpen)}>
          <div className="sb-logo">
            <div className="sb-logo-mark">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="sb-logo-text">Clario</span>
          </div>

          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} className={`sb-item${pathname === item.href ? " active" : ""}`} title={sidebarCollapsed ? item.label : undefined}>
                <NavIcon type={item.icon} />
                <span className="sb-lbl">{item.label}</span>
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </Link>
            ))}
          </nav>

          <div className="sb-bottom">
            {!sidebarCollapsed && stats && (
              <div style={{ padding: "8px 10px", background: "var(--bg3)", borderRadius: 9, marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: ".68rem", color: "var(--text3)", fontWeight: 500 }}>Usage</span>
                  <span style={{ fontSize: ".68rem", color: "var(--text3)" }}>{stats.requests_used}/{stats.requests_limit}</span>
                </div>
                <div className="usage-bar" style={{ margin: 0 }}>
                  <div className="usage-fill" style={{ width: `${usagePercent}%` }} data-danger={String(usagePercent > 85)} />
                </div>
              </div>
            )}

            {user?.plan === "free" && (
              <button className="sb-upgrade" onClick={() => router.push("/pricing")}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Upgrade to Pro
              </button>
            )}

            <button className="sb-btn" onClick={toggleTheme} title={sidebarCollapsed ? (isDark ? "Light mode" : "Dark mode") : undefined}>
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
              <span className="sb-btn-lbl">{isDark ? "Light mode" : "Dark mode"}</span>
            </button>

            <button className="sb-btn" onClick={handleSignOut}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="sb-btn-lbl">Sign out</span>
            </button>

            <button className="sb-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {sidebarCollapsed
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              }
              <span className="sb-btn-lbl">Collapse</span>
            </button>
          </div>
        </aside>

        <div className="main-area">
          <div className="topbar">
            <button className="topbar-btn topbar-hamburger" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="topbar-title">
              {loading ? <Skeleton w={200} h={18} /> : `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, ${user?.full_name?.split(" ")[0] || "there"} 👋`}
            </div>
            <button className="topbar-btn" onClick={toggleTheme} title={isDark ? "Light mode" : "Dark mode"}>
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <button className="topbar-btn" onClick={() => router.push("/settings")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            {user && (
              <div className="avatar-btn" onClick={() => router.push("/settings")} title={user.full_name || user.email}>
                {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="page-content">
            {!onboardingDone && !loading && (
              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--text2)", marginBottom: 3 }}>Get started with Clario</div>
                    <div style={{ fontSize: ".72rem", color: "var(--text3)" }}>{onboardingProgress}/4 completed</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {ONBOARDING.map((o, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: o.done ? "var(--accent)" : "var(--border2)" }} />
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div className="usage-bar"><div className="usage-fill" style={{ width: `${(onboardingProgress / 4) * 100}%` }} /></div>
                </div>
                {ONBOARDING.map(step => (
                  <Link key={step.key} href={step.href} className="ob-step" onClick={() => completeOnboardingStep(step.key)}>
                    <div className={`ob-check${step.done ? " done" : ""}`}>
                      {step.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span className={`ob-label${step.done ? " done" : ""}`}>{step.label}</span>
                    {!step.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.8" strokeLinecap="round" style={{ marginLeft: "auto" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                  </Link>
                ))}
              </div>
            )}

            <div className="stat-grid">
              {loading ? [...Array(4)].map((_, i) => (
                <div key={i} className="card stat-card"><Skeleton h={14} w="60%" /><Skeleton h={36} w="40%" r={6} /><Skeleton h={12} w="50%" /></div>
              )) : STAT_CARDS.map(card => (
                <Link key={card.label} href={card.href} className="card stat-card">
                  <div className="stat-label" style={{ color: card.color }}>{card.icon}{card.label}</div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-sub">{card.sub}</div>
                </Link>
              ))}
            </div>

            <div className="charts-grid">
              <div className="card">
                <div className="chart-head">
                  <span className="chart-title">Activity</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: ".64rem", color: "var(--text3)" }}>Live</span>
                  </div>
                </div>
                <div style={{ padding: "0 20px 16px" }}>
                  {loading ? <Skeleton h={160} r={8} /> : (
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={activity} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#292524" : "#f0efee"} vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? "#78716c" : "#a8a29e" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: isDark ? "#78716c" : "#a8a29e" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: isDark ? "#1c1917" : "#fff", border: `1px solid ${isDark ? "#292524" : "#e7e5e4"}`, borderRadius: 8, fontSize: 12, color: isDark ? "#fafaf9" : "#0c0a09" }} />
                        <Area type="monotone" dataKey="requests" stroke="#f97316" strokeWidth={2} fill="url(#grad1)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {stats && (
                  <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: ".7rem", color: "var(--text3)" }}>Monthly usage</span>
                        <span style={{ fontSize: ".7rem", color: "var(--text3)" }}>{stats.requests_used}/{stats.requests_limit}</span>
                      </div>
                      <div className="usage-bar"><div className="usage-fill" style={{ width: `${usagePercent}%` }} data-danger={String(usagePercent > 85)} /></div>
                    </div>
                    <span style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--accent)" }} data-danger={String(usagePercent > 85)}>{usagePercent}%</span>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="chart-head">
                  <span className="chart-title">Usage Breakdown</span>
                  <span className="chart-badge">This month</span>
                </div>
                <div style={{ padding: "0 20px 16px" }}>
                  {loading ? <Skeleton h={160} r={8} /> : (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={activity.slice(-7)} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#292524" : "#f0efee"} vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? "#78716c" : "#a8a29e" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: isDark ? "#78716c" : "#a8a29e" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: isDark ? "#1c1917" : "#fff", border: `1px solid ${isDark ? "#292524" : "#e7e5e4"}`, borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="summaries" fill="#f97316" radius={[4, 4, 0, 0]} name="Summaries" />
                        <Bar dataKey="remixes" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Remixes" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[{ label: "Daily avg", value: "0.6", color: "var(--text2)" }, { label: "Projected", value: "18", color: "var(--accent)" }].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: ".68rem", color: "var(--text3)", marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: ".9rem", fontWeight: 600, color: s.color, fontFamily: "var(--serif)", letterSpacing: "-.02em" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Quick Actions</div>
              <div className="qa-grid">
                {[
                  { label: "Summarize a video", href: "/summarizer", color: "#f97316", bg: "var(--accent-l)", icon: "doc" },
                  { label: "Remix content", href: "/remix", color: "#8b5cf6", bg: isDark ? "#1e1b2e" : "#faf5ff", icon: "remix" },
                  { label: "Open AI chat", href: "/chat", color: "#0ea5e9", bg: isDark ? "#0c1a26" : "#f0f9ff", icon: "chat" },
                  { label: "Schedule content", href: "/calendar", color: "#10b981", bg: isDark ? "#0c1f18" : "#f0fdf4", icon: "cal" },
                ].map(qa => (
                  <Link key={qa.label} href={qa.href} className="qa-card">
                    <div className="qa-icon" style={{ background: qa.bg, color: qa.color }}>
                      <NavIcon type={qa.icon} />
                    </div>
                    <span>{qa.label}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                ))}
              </div>
            </div>

            {user?.plan === "free" && (
              <div className="card" style={{ padding: "20px", background: "linear-gradient(135deg, var(--accent-l) 0%, var(--bg3) 100%)", borderColor: "var(--accent-m)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>⚡ Upgrade to Clario Pro</div>
                  <div style={{ fontSize: ".78rem", color: "var(--text3)", lineHeight: 1.5 }}>Get 1,000 AI requests, all 10 remix formats, Content Calendar, and Notion export.</div>
                </div>
                <button onClick={() => router.push("/pricing")} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)", whiteSpace: "nowrap", transition: "background .18s" }}>
                  Upgrade  $19/mo →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
