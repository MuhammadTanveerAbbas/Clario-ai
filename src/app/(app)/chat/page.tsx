"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

interface BrandVoice {
  id: string;
  name: string;
  tone?: string;
  personality?: string;
  is_active: boolean;
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

function Sidebar({ user, pathname, sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, theme, toggleTheme, signOut, router }: {
  user: { full_name?: string; plan?: string } | null;
  pathname: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (v: boolean) => void;
  theme: string;
  toggleTheme: () => void;
  signOut: () => Promise<void>;
  router: ReturnType<typeof useRouter>;
}) {
  const isDark = theme === "dark";
  return (
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
  );
}

export default function ChatPage() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user: authUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed, mobileOpen: mobileSidebarOpen, setMobileOpen: setMobileSidebarOpen } = useSidebar();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("New Chat");
  const [editingTitle, setEditingTitle] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const [activeBrandVoice, setActiveBrandVoice] = useState<BrandVoice | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; plan?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!authUser) return;
    supabase.from("profiles").select("full_name, plan").eq("id", authUser.id).single()
      .then(({ data }) => { if (data) setUserProfile(data); });
    supabase.from("brand_voices").select("*").eq("user_id", authUser.id).eq("is_active", true).single()
      .then(({ data }) => { if (data) setActiveBrandVoice(data); });
  }, [authUser]);

  const adjustTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 144) + "px";
  };

  const deactivateVoice = async () => {
    if (!activeBrandVoice) return;
    await supabase.from("brand_voices").update({ is_active: false }).eq("id", activeBrandVoice.id);
    setActiveBrandVoice(null);
    addToast("Brand voice deactivated", "info");
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "", pending: true };
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const body: Record<string, unknown> = { message: content, conversationId, history };
      if (activeBrandVoice) {
        body.message = `${content}\n\n[Write in this style: ${activeBrandVoice.tone || ""}. Personality: ${activeBrandVoice.personality || ""}.]`;
      }

      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }
      const data = await res.json();
      const aiContent: string = data.response || "";

      setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: "", pending: false } : m));
      const words = aiContent.split(" ");
      for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 18));
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: words.slice(0, i + 1).join(" ") } : m));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      addToast(msg, "error");
      setMessages(prev => prev.filter(m => m.id !== assistantMsg.id && m.id !== userMsg.id));
      setInput(content);
    } finally {
      setLoading(false);
    }
  };

  const STARTER_PROMPTS = [
    "Analyze my last video for content ideas",
    "Write a Twitter thread from this transcript",
    "Improve the hook of this intro",
    "Repurpose this content for LinkedIn",
  ];

  const isDark = theme === "dark";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Geist:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--accent:#f97316;--serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif}
        body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes dotPulse{0%,80%,100%{transform:scale(0);opacity:.5}40%{transform:scale(1);opacity:1}}

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
        @media(max-width:768px){.topbar-hamburger{display:flex}}
        .main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
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
        .chat-layout{display:flex;flex:1;height:calc(100vh - 56px);overflow:hidden}
        .sessions-panel{width:260px;border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;background:var(--bg2)}
        @media(max-width:768px){.sessions-panel{display:none}.sessions-panel.open{display:flex;position:fixed;left:0;top:56px;bottom:0;z-index:100;width:260px;background:var(--bg2)}}
        .chat-area{flex:1;display:flex;flex-direction:column;min-width:0}
        .chat-header{height:56px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 16px;gap:10px;flex-shrink:0}
        .messages-area{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px}
        .msg-user{align-self:flex-end;background:var(--accent);color:#fff;border-radius:16px 16px 4px 16px;padding:10px 14px;max-width:75%;font-size:.88rem;line-height:1.5;white-space:pre-wrap;word-break:break-word}
        .msg-assistant{align-self:flex-start;background:var(--card);border:1px solid var(--card-b);border-radius:4px 16px 16px 16px;padding:10px 14px;max-width:80%;font-size:.88rem;line-height:1.6;white-space:pre-wrap;word-break:break-word}
        .input-area{border-top:1px solid var(--border);padding:16px;flex-shrink:0;background:var(--bg)}
        .input-row{display:flex;gap:10px;align-items:flex-end}
        .chat-textarea{flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:10px 14px;font-family:var(--sans);font-size:.88rem;color:var(--text);resize:none;min-height:44px;max-height:144px;outline:none;transition:border-color .15s;line-height:1.5}
        .chat-textarea:focus{border-color:var(--accent)}
        .send-btn{width:40px;height:40px;border-radius:50%;background:var(--accent);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}
        .send-btn:disabled{opacity:.4;cursor:not-allowed}
        .send-btn:not(:disabled):hover{background:#ea6c0a}
        .typing-dot{width:7px;height:7px;border-radius:50%;background:var(--text3);display:inline-block;animation:dotPulse 1.4s ease-in-out infinite}
        .starter-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
        @media(max-width:500px){.starter-grid{grid-template-columns:1fr}}
        .starter-card{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;font-size:.82rem;color:var(--text2);transition:all .15s;text-align:left}
        .starter-card:hover{border-color:var(--accent);color:var(--accent)}
      `}</style>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      {mobileSidebarOpen && <div className="mobile-overlay" onClick={() => setMobileSidebarOpen(false)} />}

      <div className="dash-layout">
        <Sidebar
          user={userProfile}
          pathname={pathname}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          signOut={signOut}
          router={router}
        />

        <div className="main-area">
          <div className="topbar">
            <button className="topbar-btn topbar-hamburger" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", fontWeight: 300, color: "var(--text)", flex: 1 }}>AI Chat</span>
            <button className="topbar-btn" onClick={toggleTheme} title={isDark ? "Light mode" : "Dark mode"}>
              {isDark
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
          </div>

          <div className="chat-layout">
            <div className={`sessions-panel${showSessions ? " open" : ""}`}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: ".68rem", fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Conversations</span>
                <button onClick={() => { setMessages([]); setSessionTitle("New Chat"); }} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 7, padding: "4px 10px", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>+ New</button>
              </div>
              <div style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "32px 16px", color: "var(--text3)", textAlign: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span style={{ fontSize: ".8rem", fontWeight: 500, color: "var(--text2)" }}>No conversations yet</span>
                  <span style={{ fontSize: ".74rem" }}>Start a new chat below</span>
                </div>
              </div>
            </div>

            <div className="chat-area">
              <div className="chat-header">
                <button className="topbar-btn" onClick={() => setShowSessions(!showSessions)} title="Toggle sessions">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                {editingTitle
                  ? <input autoFocus value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} onBlur={() => setEditingTitle(false)} onKeyDown={e => e.key === "Enter" && setEditingTitle(false)} style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--accent)", borderRadius: 7, padding: "4px 10px", fontFamily: "var(--sans)", fontSize: ".88rem", color: "var(--text)", outline: "none" }} />
                  : <span onDoubleClick={() => setEditingTitle(true)} style={{ flex: 1, fontSize: ".88rem", fontWeight: 500, color: "var(--text2)", cursor: "text" }} title="Double-click to edit">{sessionTitle}</span>
                }
                <button className="topbar-btn" title="Clear chat" onClick={() => { if (messages.length > 0 && confirm("Clear this chat?")) { setMessages([]); addToast("Chat cleared", "info"); } }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>

              <div className="messages-area">
                {messages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "40px 20px", animation: "fu .4s ease both" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>✨</div>
                    <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 300, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>What are you creating today?</h2>
                    <p style={{ fontSize: ".88rem", color: "var(--text3)", textAlign: "center", maxWidth: 400, marginBottom: 24 }}>Ask anything about your content strategy, get writing feedback, or repurpose ideas.</p>
                    <div className="starter-grid" style={{ width: "100%", maxWidth: 480 }}>
                      {STARTER_PROMPTS.map(prompt => (
                        <button key={prompt} className="starter-card" onClick={() => sendMessage(prompt)}>{prompt}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={msg.role === "user" ? "msg-user" : "msg-assistant"}>
                      {msg.pending
                        ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: ".74rem", color: "var(--text3)", marginRight: 4 }}>Clario is writing...</span>
                            {[0, 1, 2].map(i => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.16}s` }} />)}
                          </div>
                        : msg.content
                      }
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="input-area">
                {activeBrandVoice && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: ".74rem", background: "var(--accent-l)", color: "var(--accent)", border: "1px solid var(--accent-m)", borderRadius: 100, padding: "2px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                      🎨 {activeBrandVoice.name} active
                      <button onClick={deactivateVoice} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: ".7rem", padding: 0, marginLeft: 2 }}>✕</button>
                    </span>
                  </div>
                )}
                {input.length > 1800 && (
                  <div style={{ fontSize: ".72rem", color: input.length > 1950 ? "#ef4444" : "var(--text3)", textAlign: "right", marginBottom: 4 }}>{input.length}/2000</div>
                )}
                <div className="input-row">
                  <textarea
                    ref={textareaRef}
                    className="chat-textarea"
                    placeholder="Ask anything..."
                    value={input}
                    onChange={e => { setInput(e.target.value); adjustTextarea(); }}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    maxLength={2000}
                    rows={1}
                  />
                  <button className="send-btn" disabled={!input.trim() || loading} onClick={() => sendMessage()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
