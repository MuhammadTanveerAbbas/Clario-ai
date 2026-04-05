"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface Toast { id: string; type: "success" | "error" | "info"; message: string; }
interface BrandVoice { id: string; name: string; tone?: string; vocabulary?: string; personality?: string; description?: string; examples?: string; is_active: boolean; created_at: string; }

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
    case "doc": return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>;
    case "remix": return <svg {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
    case "voice": return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "cal": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "settings": return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    default: return null;
  }
}

function Skeleton({ w = "100%", h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg, var(--card) 25%, var(--border) 50%, var(--card) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />;
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid var(--border)", borderLeft: `3px solid ${t.type === "success" ? "#10b981" : t.type === "error" ? "#ef4444" : "var(--accent)"}`, borderRadius: 10, padding: "11px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "fu .3s ease both", maxWidth: 320, fontFamily: "var(--sans)" }}>
          <span style={{ fontSize: ".82rem", color: "var(--text2)", flex: 1 }}>{t.message}</span>
          <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: ".75rem", padding: 0 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

export default function BrandVoicePage() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed, mobileOpen: mobileSidebarOpen, setMobileOpen: setMobileSidebarOpen } = useSidebar();

  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVoice, setEditingVoice] = useState<BrandVoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; plan?: string } | null>(null);
  const [form, setForm] = useState({ name: "", tone: "", vocabulary: "", personality: "", description: "" });
  const isDark = theme === "dark";

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const loadVoices = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    const { data } = await supabase.from("brand_voices").select("id, name, tone, vocabulary, personality, description, examples, is_active, created_at").eq("user_id", authUser.id).order("created_at", { ascending: false });
    setVoices(data || []);
    setLoading(false);
  }, [authUser, supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) return;
    supabase.from("profiles").select("full_name, plan").eq("id", authUser.id).single().then(({ data }) => { if (data) setUserProfile(data); });
    loadVoices();
  }, [authUser, authLoading, loadVoices]);

  const openCreate = () => { setEditingVoice(null); setForm({ name: "", tone: "", vocabulary: "", personality: "", description: "" }); setModalOpen(true); };
  const openEdit = (v: BrandVoice) => { setEditingVoice(v); setForm({ name: v.name, tone: v.tone || "", vocabulary: v.vocabulary || "", personality: v.personality || "", description: v.description || "" }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { addToast("Voice name is required", "error"); return; }
    setSaving(true);
    try {
      if (editingVoice) {
        const { error } = await supabase.from("brand_voices").update({ name: form.name, tone: form.tone, vocabulary: form.vocabulary, personality: form.personality, description: form.description }).eq("id", editingVoice.id);
        if (error) throw error;
        addToast("Voice updated", "success");
      } else {
        const { error } = await supabase.from("brand_voices").insert({ user_id: authUser?.id, name: form.name, tone: form.tone, vocabulary: form.vocabulary, personality: form.personality, description: form.description, examples: form.description, is_active: false });
        if (error) throw error;
        addToast("Voice saved", "success");
      }
      setModalOpen(false);
      loadVoices();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("brand_voices").delete().eq("id", id);
    if (error) { addToast("Failed to delete", "error"); return; }
    addToast("Voice deleted", "info");
    setDeleteConfirm(null);
    loadVoices();
  };

  const handleToggleActive = async (voice: BrandVoice) => {
    const newActive = !voice.is_active;
    if (newActive) {
      await supabase.from("brand_voices").update({ is_active: false }).eq("user_id", authUser?.id);
    }
    await supabase.from("brand_voices").update({ is_active: newActive }).eq("id", voice.id);
    addToast(newActive ? `${voice.name} is now active on all outputs` : `${voice.name} deactivated`, "success");
    loadVoices();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400&family=Geist:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--accent:#f97316;--serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif}
        body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .dash-layout{display:flex;height:100vh;overflow:hidden;background:var(--bg)}
        .sidebar{width:220px;min-height:100vh;background:var(--sidebar);border-right:1px solid var(--sidebar-b);display:flex;flex-direction:column;transition:width .22s cubic-bezier(.4,0,.2,1);flex-shrink:0;position:sticky;top:0;height:100vh;overflow:hidden}
        .sidebar[data-collapsed="true"]{width:60px}
        .sb-logo{height:56px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid var(--sidebar-b);gap:10px;overflow:hidden;flex-shrink:0;transition:padding .22s}
        .sidebar[data-collapsed="true"] .sb-logo{padding:0 14px}
        .sb-logo-mark{width:28px;height:28px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sb-logo-text{font-family:var(--serif);font-size:1.2rem;font-weight:300;color:var(--text);white-space:nowrap;opacity:1;transition:opacity .15s;pointer-events:none}
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
        .feature-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        @media(max-width:560px){.feature-grid-3{grid-template-columns:1fr}}
        .main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
        .page-content{flex:1;padding:24px;overflow:auto}
        @media(max-width:768px){.page-content{padding:16px}}
        @media(max-width:480px){.page-content{padding:12px}}
        .voices-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
        @media(max-width:700px){.voices-grid{grid-template-columns:1fr}}
        .voice-card{background:var(--card);border:1px solid var(--card-b);border-radius:14px;padding:20px;animation:fu .4s ease both}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px}
        .modal{background:var(--bg2);border:1px solid var(--border);border-radius:18px;width:100%;max-width:520px;padding:24px;animation:fu .25s ease both;max-height:90vh;overflow-y:auto}
        @media(max-width:480px){.modal{padding:16px;border-radius:14px}}
        .field-label{font-size:.78rem;font-weight:600;color:var(--text3);margin-bottom:6px;display:block}
        .field-input{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:9px;padding:10px 12px;font-family:var(--sans);font-size:.86rem;color:var(--text);outline:none;transition:border-color .15s}
        .field-input:focus{border-color:var(--accent)}
        .toggle-track{width:40px;height:22px;border-radius:100px;transition:background .2s;cursor:pointer;position:relative;flex-shrink:0;border:none}
        .toggle-thumb{width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;transition:left .2s}
        @media(max-width:768px){
          .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:200;width:220px!important;transition:transform .25s}
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
            <div className="sb-logo-mark"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
            <span className="sb-logo-text">Clario</span>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href} className={`sb-item${pathname === item.href ? " active" : ""}`}>
                <NavIcon type={item.icon} /><span className="sb-lbl">{item.label}</span>
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </Link>
            ))}
          </nav>
          <div className="sb-bottom">
            {userProfile?.plan === "free" && <button className="sb-upgrade" onClick={() => router.push("/pricing")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Upgrade to Pro
            </button>}
            <button className="sb-btn" onClick={toggleTheme} title={sidebarCollapsed ? (isDark ? "Light mode" : "Dark mode") : undefined}>
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
              <span className="sb-btn-lbl">{isDark ? "Light mode" : "Dark mode"}</span>
            </button>
            <button className="sb-btn" onClick={async () => { await signOut(); router.push("/sign-in"); }} title={sidebarCollapsed ? "Sign out" : undefined}>
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
            <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 300, color: "var(--text)", flex: 1 }}>Brand Voice</span>
            <button onClick={openCreate} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, padding: "7px 16px", fontFamily: "var(--sans)", fontSize: ".82rem", fontWeight: 600, cursor: "pointer" }}>+ Create Voice</button>
            <button className="topbar-btn" onClick={toggleTheme}>
              {isDark ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
          </div>

          <div className="page-content" style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ animation: "fu .4s ease both", marginBottom: 20 }}>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 300, color: "var(--text)", marginBottom: 6 }}>Brand Voice</h1>
              <p style={{ fontSize: ".88rem", color: "var(--text3)" }}>Teach Clario to write exactly like you. All AI outputs will match your style.</p>
            </div>

            {loading ? (
              <div className="voices-grid">
                {[1, 2].map(i => <div key={i} style={{ background: "var(--card)", border: "1px solid var(--card-b)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}><Skeleton h={20} w="60%" /><Skeleton h={12} /><Skeleton h={12} w="80%" /></div>)}
              </div>
            ) : voices.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", animation: "fu .4s ease both" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>❤️</div>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>Your voice, everywhere.</h2>
                <p style={{ fontSize: ".88rem", color: "var(--text3)", textAlign: "center", maxWidth: 400, marginBottom: 24 }}>Create a Brand Voice and Clario will automatically write in your style across all summaries, remixes, and chats.</p>
                <button onClick={openCreate} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontFamily: "var(--sans)", fontSize: ".88rem", fontWeight: 600, cursor: "pointer", marginBottom: 32 }}>Create your first voice</button>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, width: "100%", maxWidth: 560 }} className="feature-grid-3">
                  {[["Sounds like you", "Clario learns your tone, vocabulary, and personality"], ["Always on", "Activate a voice and it applies to every AI output automatically"], ["Multiple voices", "Create different voices for different brands or projects"]].map(([title, desc]) => (
                    <div key={title} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: ".84rem", fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>{title}</div>
                      <div style={{ fontSize: ".76rem", color: "var(--text3)" }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="voices-grid">
                {voices.map((v, i) => (
                  <div key={v.id} className="voice-card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 300, color: "var(--text)", flex: 1 }}>{v.name}</span>
                      {v.is_active && <span style={{ fontSize: ".66rem", fontWeight: 700, background: "#10b981", color: "#fff", padding: "2px 8px", borderRadius: 100 }}>Active</span>}
                      <button onClick={() => openEdit(v)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 10px", fontSize: ".72rem", color: "var(--text2)", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => setDeleteConfirm(v.id)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: ".72rem" }}>Delete</button>
                    </div>
                    {[["Tone", v.tone], ["Vocabulary", v.vocabulary], ["Personality", v.personality]].map(([label, val]) => val && (
                      <div key={label} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: ".72rem", color: "var(--text3)", fontWeight: 500 }}>{label}</span>
                          <span style={{ fontSize: ".72rem", color: "var(--text2)" }}>{val}</span>
                        </div>
                        <div style={{ height: 4, background: "var(--bg3)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: "70%", background: "var(--accent)", borderRadius: 100 }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--card-b)" }}>
                      <span style={{ fontSize: ".8rem", color: "var(--text2)", flex: 1 }}>Apply to all outputs</span>
                      <button className="toggle-track" onClick={() => handleToggleActive(v)} style={{ background: v.is_active ? "#10b981" : "var(--bg3)" }}>
                        <div className="toggle-thumb" style={{ left: v.is_active ? 21 : 3 }} />
                      </button>
                    </div>
                    {deleteConfirm === v.id && (
                      <div style={{ marginTop: 12, padding: 12, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10 }}>
                        <p style={{ fontSize: ".8rem", color: "var(--text2)", marginBottom: 10 }}>Delete &quot;{v.name}&quot;? This cannot be undone.</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleDelete(v.id)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: ".78rem", cursor: "pointer" }}>Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 14px", fontSize: ".78rem", color: "var(--text2)", cursor: "pointer" }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 300, color: "var(--text)", marginBottom: 20 }}>{editingVoice ? "Edit Voice" : "Create Voice"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "name", label: "Voice Name *", placeholder: "e.g. My Creator Voice", type: "input" },
                { key: "tone", label: "Tone", placeholder: "e.g. Conversational, Professional, Casual, Authoritative", type: "input" },
                { key: "vocabulary", label: "Vocabulary", placeholder: "e.g. Simple and clear, Technical jargon, Storytelling-heavy", type: "input" },
                { key: "personality", label: "Personality", placeholder: "e.g. Witty and direct, Warm and encouraging, Data-driven", type: "input" },
                { key: "description", label: "Description (optional)", placeholder: "Any extra notes about this voice...", type: "textarea" },
              ].map(field => (
                <div key={field.key}>
                  <label className="field-label">{field.label}</label>
                  {field.type === "textarea"
                    ? <textarea value={form[field.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} className="field-input" style={{ minHeight: 80, resize: "vertical" }} />
                    : <input value={form[field.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} className="field-input" />
                  }
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setModalOpen(false)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 9, padding: "9px 18px", fontFamily: "var(--sans)", fontSize: ".84rem", color: "var(--text2)", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, padding: "9px 18px", fontFamily: "var(--sans)", fontSize: ".84rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? .6 : 1 }}>{saving ? "Saving..." : "Save Voice"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
