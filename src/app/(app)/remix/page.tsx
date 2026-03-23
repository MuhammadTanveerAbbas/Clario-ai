"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface Toast { id: string; type: "success" | "error" | "info"; message: string; }
interface BrandVoice { id: string; name: string; tone?: string; personality?: string; is_active: boolean; }

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

const FORMATS = [
  { id: "twitter", label: "Twitter Thread", color: "#f97316" },
  { id: "linkedin", label: "LinkedIn Post", color: "#0ea5e9" },
  { id: "email", label: "Email Newsletter", color: "#8b5cf6" },
  { id: "youtube", label: "YouTube Description", color: "#10b981" },
  { id: "podcast", label: "Podcast Show Notes", color: "#f43f5e" },
  { id: "blog", label: "Blog Outline", color: "#f59e0b" },
  { id: "instagram", label: "Instagram Caption", color: "#ec4899" },
  { id: "shorts", label: "Short-form Script", color: "#6366f1" },
  { id: "quotes", label: "Quote Graphics", color: "#14b8a6" },
  { id: "carousel", label: "LinkedIn Carousel", color: "#84cc16" },
];

export default function RemixPage() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user: authUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed, mobileOpen: mobileSidebarOpen, setMobileOpen: setMobileSidebarOpen } = useSidebar();

  const [content, setContent] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set(FORMATS.map(f => f.id)));
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeBrandVoice, setActiveBrandVoice] = useState<BrandVoice | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; plan?: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isDark = theme === "dark";

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  useEffect(() => {
    if (!authUser) return;
    supabase.from("profiles").select("full_name, plan").eq("id", authUser.id).single().then(({ data }) => { if (data) setUserProfile(data); });
    supabase.from("brand_voices").select("*").eq("user_id", authUser.id).eq("is_active", true).single().then(({ data }) => { if (data) setActiveBrandVoice(data); });
  }, [authUser]);

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleGenerate = async () => {
    if (!content.trim() || content.trim().length < 50) { addToast("Content must be at least 50 characters", "error"); return; }
    setLoading(true);
    setOutputs({});
    try {
      const res = await fetch("/api/remix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: content.trim() }) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }
      const data = await res.json();
      const results: Record<string, string> = data.results || {};
      // Reveal outputs one by one
      const keys = FORMATS.filter(f => selectedFormats.has(f.id)).map(f => f.id);
      for (const key of keys) {
        if (results[key]) {
          setOutputs(prev => ({ ...prev, [key]: results[key] }));
          await new Promise(r => setTimeout(r, 150));
        }
      }
      addToast("Remix complete!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  const handleDownload = (label: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${label.replace(/\s+/g, "-").toLowerCase()}.md`; a.click();
  };

  const hasOutputs = Object.keys(outputs).length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400&family=Geist:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--accent:#f97316;--serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif}
        body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .dash-layout{display:flex;min-height:100vh;background:var(--bg)}
        .sidebar{width:220px;min-height:100vh;background:var(--sidebar);border-right:1px solid var(--sidebar-b);display:flex;flex-direction:column;transition:width .22s;flex-shrink:0;position:sticky;top:0;height:100vh;overflow:hidden}
        .sidebar[data-collapsed="true"]{width:60px}
        .sb-logo{height:56px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid var(--sidebar-b);gap:10px;overflow:hidden;flex-shrink:0}
        .sidebar[data-collapsed="true"] .sb-logo{padding:0 14px}
        .sb-logo-mark{width:28px;height:28px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sb-logo-text{font-family:var(--serif);font-size:1.2rem;font-weight:300;color:var(--text);white-space:nowrap;opacity:1;transition:opacity .15s}
        .sidebar[data-collapsed="true"] .sb-logo-text{opacity:0}
        .sb-nav{flex:1;padding:10px 8px;display:flex;flex-direction:column;gap:2px;overflow:hidden auto}
        .sb-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;border:1px solid transparent;background:transparent;cursor:pointer;text-decoration:none;color:var(--text3);font-family:var(--sans);font-size:.82rem;font-weight:400;transition:all .15s;white-space:nowrap;justify-content:flex-start}
        .sidebar[data-collapsed="true"] .sb-item{justify-content:center;padding:9px 12px}
        .sidebar[data-collapsed="true"] .sb-item svg{flex-shrink:0}
        .sb-item:hover{background:var(--bg3);color:var(--text2);border-color:var(--border)}
        .sb-item.active{background:var(--accent-l);color:var(--accent);font-weight:500;border-color:var(--accent)}
        .sb-lbl{opacity:1;transition:opacity .12s;flex:1}
        .sidebar[data-collapsed="true"] .sb-lbl{opacity:0;width:0;overflow:hidden}
        .sb-badge{font-size:.56rem;font-weight:700;background:var(--accent);color:#fff;padding:2px 6px;border-radius:100px}
        .sidebar[data-collapsed="true"] .sb-badge{opacity:0;width:0;overflow:hidden}
        .sb-bottom{padding:10px 8px 14px;border-top:1px solid var(--sidebar-b);display:flex;flex-direction:column;gap:5px;flex-shrink:0}
        .sb-btn{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;border:none;background:transparent;cursor:pointer;color:var(--text3);font-family:var(--sans);font-size:.78rem;font-weight:400;transition:all .15s;width:100%;justify-content:flex-start}
        .sidebar[data-collapsed="true"] .sb-btn{justify-content:center;padding:8px 0}
        .sb-btn:hover{background:var(--bg3);color:var(--text2)}
        .sb-btn-lbl{opacity:1;transition:opacity .12s}
        .sidebar[data-collapsed="true"] .sb-btn-lbl{opacity:0;width:0;overflow:hidden}
        .sb-upgrade{margin:0 2px 4px;background:var(--accent);color:#fff;border:none;border-radius:9px;padding:10px;font-family:var(--sans);font-size:.76rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
        .sidebar[data-collapsed="true"] .sb-upgrade{opacity:0;pointer-events:none;height:0;padding:0;margin:0;overflow:hidden}
        .sb-upgrade:hover{background:#ea6c0a}
        .topbar{height:56px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:12px;background:var(--bg);position:sticky;top:0;z-index:40;flex-shrink:0}
        .topbar-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text3);cursor:pointer;transition:all .15s}
        .topbar-btn:hover{background:var(--bg3);color:var(--text2)}
        .main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
        .page-content{flex:1;padding:24px;overflow:auto}
        .card{background:var(--card);border:1px solid var(--card-b);border-radius:14px;overflow:hidden}
        .remix-layout{display:flex;gap:20px;min-height:0}
        .remix-left{flex:1;min-width:0;display:flex;flex-direction:column;gap:16px}
        .remix-right{width:280px;flex-shrink:0}
        @media(max-width:900px){.remix-right{display:none}}
        .format-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
        .format-card{background:var(--card);border:1px solid var(--card-b);border-radius:10px;padding:12px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:8px;position:relative}
        .format-card:hover{background:var(--bg3)}
        .output-card{background:var(--card);border:1px solid var(--card-b);border-radius:14px;overflow:hidden;animation:fu .3s ease both}
        @media(max-width:768px){
          .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:200;width:220px!important;transition:transform .25s}
          .sidebar[data-mobile-open="false"]{transform:translateX(-100%)}
          .sidebar[data-mobile-open="true"]{transform:translateX(0)}
          .sb-lbl,.sb-badge,.sb-btn-lbl{opacity:1!important;width:auto!important;overflow:visible!important}
          .sb-item{justify-content:flex-start!important;padding:9px 10px!important}
          .sb-btn{justify-content:flex-start!important;padding:8px 10px!important}
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
            {userProfile?.plan === "free" && <button className="sb-upgrade" onClick={() => router.push("/pricing")}>Upgrade to Pro</button>}
            <button className="sb-btn" onClick={toggleTheme}><span className="sb-btn-lbl">{isDark ? "Light mode" : "Dark mode"}</span></button>
            <button className="sb-btn" onClick={async () => { await signOut(); router.push("/sign-in"); }}><span className="sb-btn-lbl">Sign out</span></button>
            <button className="sb-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}><span className="sb-btn-lbl">Collapse</span></button>
          </div>
        </aside>

        <div className="main-area">
          <div className="topbar">
            <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 300, color: "var(--text)", flex: 1 }}>Remix Studio</span>
            <button className="topbar-btn" onClick={toggleTheme}>
              {isDark ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
          </div>

          <div className="page-content">
            <div style={{ animation: "fu .4s ease both", marginBottom: 20 }}>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", fontWeight: 300, color: "var(--text)", marginBottom: 6 }}>Remix Studio</h1>
              <p style={{ fontSize: ".88rem", color: "var(--text3)" }}>One input. Ten formats. Instantly.</p>
            </div>

            <div className="remix-layout">
              <div className="remix-left">
                {/* Input card */}
                <div className="card" style={{ animation: "fu .4s .05s ease both" }}>
                  <div style={{ padding: 16 }}>
                    {activeBrandVoice && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: ".74rem", background: "var(--accent-l)", color: "var(--accent)", border: "1px solid var(--accent-m)", borderRadius: 100, padding: "2px 10px" }}>🎨 {activeBrandVoice.name} active</span>
                      </div>
                    )}
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Paste your content here — a video transcript, blog post, newsletter, or any text..." style={{ width: "100%", minHeight: 160, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--text)", resize: "vertical", outline: "none", lineHeight: 1.6 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={() => setSelectedFormats(new Set(FORMATS.map(f => f.id)))} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: ".76rem", cursor: "pointer" }}>Select All</button>
                        <button onClick={() => setSelectedFormats(new Set())} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: ".76rem", cursor: "pointer" }}>Deselect All</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: ".72rem", color: "var(--text3)" }}>{selectedFormats.size} formats selected</span>
                        <button onClick={handleGenerate} disabled={loading || !content.trim() || selectedFormats.size === 0} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 9, padding: "8px 18px", fontFamily: "var(--sans)", fontSize: ".84rem", fontWeight: 600, cursor: loading || !content.trim() || selectedFormats.size === 0 ? "not-allowed" : "pointer", opacity: loading || !content.trim() || selectedFormats.size === 0 ? .5 : 1 }}>
                          {loading ? "Generating..." : "Generate Selected"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Format selector */}
                <div style={{ animation: "fu .4s .1s ease both" }}>
                  <p style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Formats</p>
                  <div className="format-grid">
                    {FORMATS.map(f => {
                      const sel = selectedFormats.has(f.id);
                      return (
                        <button key={f.id} className="format-card" onClick={() => toggleFormat(f.id)} style={{ borderColor: sel ? f.color : "var(--card-b)", background: sel ? `${f.color}15` : "var(--card)", opacity: sel ? 1 : .6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                          <span style={{ fontSize: ".8rem", fontWeight: 500, color: "var(--text2)", flex: 1, textAlign: "left" }}>{f.label}</span>
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${sel ? f.color : "var(--border)"}`, background: sel ? f.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Outputs */}
                {loading && !hasOutputs && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {FORMATS.filter(f => selectedFormats.has(f.id)).map(f => (
                      <div key={f.id} className="card" style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color }} />
                          <span style={{ fontSize: ".82rem", fontWeight: 500, color: "var(--text2)" }}>{f.label}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[100, 90, 95].map((w, i) => <Skeleton key={i} w={`${w}%`} h={12} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {hasOutputs && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {FORMATS.filter(f => outputs[f.id]).map(f => {
                      const isCollapsed = collapsed.has(f.id);
                      return (
                        <div key={f.id} className="output-card">
                          <div style={{ padding: "12px 16px", borderBottom: isCollapsed ? "none" : "1px solid var(--card-b)", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.color, flexShrink: 0 }} />
                            <span style={{ fontSize: ".84rem", fontWeight: 500, color: "var(--text2)", flex: 1 }}>{f.label}</span>
                            <button onClick={() => handleCopy(f.id, outputs[f.id])} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: ".72rem", color: "var(--text2)", cursor: "pointer" }}>{copiedId === f.id ? "✓" : "Copy"}</button>
                            <button onClick={() => handleDownload(f.label, outputs[f.id])} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: ".72rem", color: "var(--text2)", cursor: "pointer" }}>.md</button>
                            <button onClick={() => router.push(`/calendar?content=${encodeURIComponent(outputs[f.id])}&platform=${encodeURIComponent(f.label)}`)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: ".72rem", color: "var(--text2)", cursor: "pointer" }}>📅</button>
                            <button onClick={() => setCollapsed(prev => { const n = new Set(prev); n.has(f.id) ? n.delete(f.id) : n.add(f.id); return n; })} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: ".8rem" }}>{isCollapsed ? "▼" : "▲"}</button>
                          </div>
                          {!isCollapsed && <div style={{ padding: 16, fontSize: ".86rem", color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{outputs[f.id]}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty state */}
                {!hasOutputs && !loading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", animation: "fu .4s .15s ease both" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔄</div>
                    <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>One input. Ten formats. Instantly.</h2>
                    <p style={{ fontSize: ".88rem", color: "var(--text3)", textAlign: "center", maxWidth: 400, marginBottom: 24 }}>Paste any content and Clario remixes it into every format you need — simultaneously.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, width: "100%", maxWidth: 560 }}>
                      {[["All 10 formats at once", "Twitter, LinkedIn, newsletters, and 7 more"], ["Sounds like you", "Applies your Brand Voice automatically"], ["Calendar ready", "Add any output directly to your content calendar"]].map(([title, desc]) => (
                        <div key={title} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                          <div style={{ fontSize: ".84rem", fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>{title}</div>
                          <div style={{ fontSize: ".76rem", color: "var(--text3)" }}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right history panel */}
              <div className="remix-right">
                <div className="card" style={{ position: "sticky", top: 80 }}>
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--card-b)" }}>
                    <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Recent Remixes</span>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ textAlign: "center", padding: "24px 12px", color: "var(--text3)", fontSize: ".8rem" }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🔄</div>
                      <div style={{ fontWeight: 500, color: "var(--text2)", marginBottom: 4 }}>No remixes yet</div>
                      <div>Your history appears here after your first remix</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
