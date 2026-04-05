"use client";
import { useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";

interface Toast { id: string; type: "success" | "error" | "info"; message: string; }
interface CalEvent {
  id: string;
  title: string;
  scheduled_at: string;
  platform?: string;
  content_text?: string;
  color?: string;
  status?: string;
}

const PLATFORMS = ["Twitter", "LinkedIn", "Instagram", "YouTube", "Newsletter", "Podcast", "Blog", "TikTok", "Other"];
const COLORS = ["var(--accent)", "#0ea5e9", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b"];
const STATUSES = ["Draft", "Scheduled", "Published", "Cancelled"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "grid": return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case "chat": return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "doc": return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
    case "remix": return <svg {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
    case "voice": return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "cal": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "settings": return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    default: return null;
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${t.type === "success" ? "var(--success)" : t.type === "error" ? "var(--error)" : "var(--accent)"}`, borderRadius: 10, padding: "11px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "fu .3s ease both", maxWidth: 320, fontFamily: "var(--sans)" }}>
          <span style={{ fontSize: ".82rem", color: "var(--text2)", flex: 1 }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: ".75rem", padding: 0 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed, mobileOpen: mobileSidebarOpen, setMobileOpen: setMobileSidebarOpen } = useSidebar();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; plan?: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "", scheduled_at: "", platform: "Other", content: "", color: COLORS[0], status: "Draft"
  });

  const isDark = theme === "dark";

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, plan").eq("id", user.id).single()
      .then(({ data }) => { if (data) setUserProfile(data); });
  }, [user]);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, year, month]);

  useEffect(() => {
    const content = searchParams?.get("content");
    const platform = searchParams?.get("platform");
    if (content) {
      setFormData(prev => ({ ...prev, content: decodeURIComponent(content), platform: platform || "Other" }));
      setModalOpen(true);
    }
  }, [searchParams]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const { data, error } = await supabase
        .from("calendar_events").select("id, title, content, platform, scheduled_at, status, created_at").eq("user_id", user.id)
        .gte("scheduled_at", startDate).lte("scheduled_at", endDate)
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (error: unknown) {
      showToast("Failed to load events", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!user || !formData.title || !formData.scheduled_at) {
      showToast("Please fill in required fields", "error");
      return;
    }
    try {
      if (editingEvent) {
        const { error } = await supabase.from("calendar_events").update({
          title: formData.title, scheduled_at: formData.scheduled_at,
          platform: formData.platform?.toLowerCase(), content_text: formData.content,
          color: formData.color, status: formData.status?.toLowerCase()
        }).eq("id", editingEvent.id);
        if (error) throw error;
        showToast("Event updated", "success");
      } else {
        const { error } = await supabase.from("calendar_events").insert({
          user_id: user.id, title: formData.title, scheduled_at: formData.scheduled_at,
          platform: formData.platform?.toLowerCase(), content_text: formData.content,
          color: formData.color, status: formData.status?.toLowerCase()
        });
        if (error) throw error;
        showToast("Event added", "success");
      }
      setModalOpen(false);
      setEditingEvent(null);
      setFormData({ title: "", scheduled_at: "", platform: "Other", content: "", color: COLORS[0], status: "Draft" });
      fetchEvents();
    } catch (error) {
      console.error(error);
      showToast("Failed to save event", "error");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
      showToast("Event deleted", "success");
      fetchEvents();
    } catch (error) {
      console.error(error);
      showToast("Failed to delete event", "error");
    }
  };

  const openEditModal = (event: CalEvent) => {
    setEditingEvent(event);
    setFormData({ title: event.title, scheduled_at: event.scheduled_at, platform: event.platform || "Other", content: event.content_text || "", color: event.color || COLORS[0], status: event.status || "Draft" });
    setModalOpen(true);
  };

  const openAddModal = (date?: Date) => {
    setEditingEvent(null);
    const scheduledDate = date || new Date();
    setFormData({ title: "", scheduled_at: scheduledDate.toISOString().slice(0, 16), platform: "Other", content: "", color: COLORS[0], status: "Draft" });
    setModalOpen(true);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} style={{ minHeight: 90 }} />);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayEvents = events.filter(e => e.scheduled_at.startsWith(dateStr));
      const isToday = dateStr === new Date().toISOString().split("T")[0];
      days.push(
        <div key={day} onClick={() => openAddModal(date)}
          style={{ background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 8, minHeight: 90, padding: 8, cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--card-b)"}
        >
          <div style={{ fontSize: ".75rem", color: isToday ? "var(--accent)" : "var(--text3)", fontWeight: isToday ? 600 : 400, marginBottom: 4 }}>{day}</div>
          {dayEvents.slice(0, 2).map(event => (
            <div key={event.id} onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
              style={{ background: event.color || "var(--accent)", color: "#fff", fontSize: ".7rem", padding: "2px 6px", borderRadius: 4, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && <div style={{ fontSize: ".65rem", color: "var(--text3)", marginTop: 2 }}>+{dayEvents.length - 2} more</div>}
        </div>
      );
    }
    return days;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Geist:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--accent:#f97316;--serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif}
        body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

        .dash-layout{display:flex;min-height:100vh;background:var(--bg)}

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
        .topbar-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text3);cursor:pointer;transition:all .15s}
        .topbar-btn:hover{background:var(--bg3);color:var(--text2);border-color:var(--border2)}
        .topbar-hamburger{display:none}
        @media(max-width:768px){.topbar-hamburger{display:flex}.topbar{padding:0 12px;gap:8px}}

        .main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
        .page-content{flex:1;padding:24px;overflow:auto}
        @media(max-width:768px){.page-content{padding:16px}}
        @media(max-width:480px){.page-content{padding:12px}}

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
            {userProfile?.plan === "free" && (
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
            <button className="sb-btn" onClick={async () => { await signOut(); router.push("/sign-in"); }}>
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
            <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 300, color: "var(--text)", flex: 1 }}>Content Calendar</span>
            <button className="topbar-btn" onClick={toggleTheme} title={isDark ? "Light mode" : "Dark mode"}>
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          </div>

          <div className="page-content">
            {!user ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>Please sign in to view your calendar</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                  <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 300, color: "var(--text)", margin: 0 }}>
                    {MONTHS[month]} {year}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => setMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1)}
                      style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "var(--text)" }}>←</button>
                    <button onClick={() => setMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1)}
                      style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "var(--text)" }}>→</button>
                    <button onClick={() => openAddModal()}
                      style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", color: "#fff", fontWeight: 500 }}>
                      Add Event
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div style={{ textAlign: "center", padding: 60, color: "var(--text3)" }}>Loading...</div>
                ) : (
                  <>
                    <div style={{ overflowX: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(40px, 1fr))", gap: 8, marginBottom: 8, minWidth: 280 }}>
                      {DAYS.map(day => (
                        <div key={day} style={{ fontSize: ".75rem", color: "var(--text3)", textAlign: "center", fontWeight: 500 }}>{day}</div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(40px, 1fr))", gap: 8, minWidth: 280 }}>
                      {renderMonthView()}
                    </div>
                    </div>
                  </>
                )}

                {!loading && events.length === 0 && (
                  <div style={{ textAlign: "center", padding: 60 }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📅</div>
                    <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>Your content schedule, at a glance</h2>
                    <p style={{ color: "var(--text2)", marginBottom: 24 }}>Plan and track every post across every platform in one place</p>
                    <button onClick={() => openAddModal()}
                      style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", color: "#fff", fontWeight: 500 }}>
                      Add your first event
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div onClick={() => setModalOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18, padding: 24, maxWidth: 480, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 300, color: "var(--text)", marginBottom: 20 }}>
              {editingEvent ? "Edit Event" : "Add Event"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem" }} placeholder="Event title" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Date & Time *</label>
                <input type="datetime-local" value={formData.scheduled_at} onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Platform</label>
                <select value={formData.platform} onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem" }}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Content</label>
                <textarea value={formData.content} onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem", minHeight: 100, resize: "vertical" }} placeholder="Post content..." />
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Status</label>
                <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  style={{ width: "100%", background: "var(--input)", border: "1px solid var(--input-b)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: ".9rem" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: ".85rem", color: "var(--text2)", marginBottom: 6 }}>Color</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLORS.map(color => (
                    <button key={color} onClick={() => setFormData(prev => ({ ...prev, color }))}
                      style={{ width: 32, height: 32, borderRadius: 6, background: color, border: formData.color === color ? "2px solid var(--text)" : "1px solid var(--border)", cursor: "pointer" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button onClick={() => setModalOpen(false)}
                  style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", cursor: "pointer", color: "var(--text)", fontWeight: 500 }}>Cancel</button>
                {editingEvent && (
                  <button onClick={() => { handleDeleteEvent(editingEvent.id); setModalOpen(false); }}
                    style={{ background: "var(--error)", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", color: "#fff", fontWeight: 500 }}>Delete</button>
                )}
                <button onClick={handleSaveEvent}
                  style={{ flex: 1, background: "var(--accent)", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", color: "#fff", fontWeight: 500 }}>
                  {editingEvent ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
