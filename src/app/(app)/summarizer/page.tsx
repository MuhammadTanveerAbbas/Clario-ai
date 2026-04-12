"use client";
import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
interface HistoryItem {
  id: string;
  mode: string;
  source_type: string;
  input_text: string;
  output_text: string;
  created_at: string;
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
  const p = {
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
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "chat":
      return (
        <svg {...p}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "doc":
      return (
        <svg {...p}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "remix":
      return (
        <svg {...p}>
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    case "voice":
      return (
        <svg {...p}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "cal":
      return (
        <svg {...p}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "settings":
      return (
        <svg {...p}>
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
            borderLeft: `3px solid ${t.type === "success" ? "#10b981" : t.type === "error" ? "#ef4444" : "var(--accent)"}`,
            borderRadius: 10,
            padding: "11px 14px",
            boxShadow: "0 8px 24px rgba(0,0,0,.2)",
            animation: "fu .3s ease both",
            maxWidth: 320,
            fontFamily: "var(--sans)",
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

type SummarizeMode =
  | "executive-brief"
  | "action-items"
  | "swot"
  | "meeting-minutes"
  | "eli5"
  | "key-quotes"
  | "sentiment"
  | "full-breakdown"
  | "brutal-roast"
  | "bullet-summary";

const MODES: {
  id: SummarizeMode;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "executive-brief",
    label: "Executive Brief",
    desc: "High-level overview for busy people",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    id: "action-items",
    label: "Action Items",
    desc: "Extract every task and next step",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: "swot",
    label: "SWOT Analysis",
    desc: "Strengths, weaknesses, opportunities, threats",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
  },
  {
    id: "meeting-minutes",
    label: "Meeting Minutes",
    desc: "Formal minutes with decisions and owners",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "eli5",
    label: "ELI5",
    desc: "Explain like I'm 5 years old",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "key-quotes",
    label: "Key Quotes",
    desc: "Most memorable and shareable quotes",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
    ),
  },
  {
    id: "sentiment",
    label: "Sentiment Analysis",
    desc: "Emotional tone and audience reaction",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    id: "full-breakdown",
    label: "Full Breakdown",
    desc: "Comprehensive section-by-section analysis",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "brutal-roast",
    label: "Brutal Roast",
    desc: "Savage honest critique of the content",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    id: "bullet-summary",
    label: "Bullet Summary",
    desc: "Clean scannable bullet points",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const MODE_API_MAP: Record<SummarizeMode, string> = {
  "executive-brief": "executive-brief",
  "action-items": "action-items",
  swot: "swot",
  "meeting-minutes": "meeting-minutes",
  eli5: "eli5",
  "key-quotes": "key-quotes",
  sentiment: "sentiment",
  "full-breakdown": "full-breakdown",
  "brutal-roast": "brutal-roast",
  "bullet-summary": "bullet-summary",
};

export default function SummarizerPage() {
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

  const [tab, setTab] = useState<"youtube" | "text">("text");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [selectedMode, setSelectedMode] =
    useState<SummarizeMode>("executive-brief");
  const [output, setOutput] = useState("");
  const [outputTitle, setOutputTitle] = useState("");
  const [videoMeta, setVideoMeta] = useState<{
    title: string;
    author: string;
    thumbnail: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Summarizing...");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userProfile, setUserProfile] = useState<{
    full_name?: string;
    plan?: string;
  } | null>(null);
  const isDark = theme === "dark";

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
  const dismissToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  useEffect(() => {
    if (!authUser) return;
    supabase
      .from("profiles")
      .select("full_name, plan")
      .eq("id", authUser.id)
      .single()
      .then(({ data }) => {
        if (data) setUserProfile(data);
      });
  }, [authUser]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await supabase
        .from("ai_summaries")
        .select("id, mode, original_text, summary_text, created_at")
        .eq("user_id", authUser?.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setHistory(
          data.map(
            (r: {
              id: string;
              mode: string;
              original_text: string;
              summary_text: string;
              created_at: string;
            }) => ({
              id: r.id,
              mode: r.mode,
              source_type: "paste_text",
              input_text: r.original_text || "",
              output_text: r.summary_text || "",
              created_at: r.created_at,
            }),
          ),
        );
      }
    } catch {
      /* ignore */
    }
    setHistoryLoading(false);
  };

  const handleSummarize = async () => {
    const text = tab === "text" ? pasteText.trim() : "";
    const url = tab === "youtube" ? youtubeUrl.trim() : "";
    if (!text && !url) {
      addToast("Please enter some text or a YouTube URL", "error");
      return;
    }
    if (text && text.length < 10) {
      addToast("Text is too short", "error");
      return;
    }

    setLoading(true);
    setOutput("");
    setVideoMeta(null);

    try {
      const apiMode = MODE_API_MAP[selectedMode];
      let finalText = text;
      let finalUrl = "";

      if (tab === "youtube") {
        setLoadingMsg("Fetching transcript...");
        const ytRes = await fetch("/api/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const ytData = await ytRes.json();
        if (!ytRes.ok) {
          throw new Error(
            ytData.error || ytData.hint || "Failed to fetch transcript",
          );
        }
        finalText = ytData.transcript;
        finalUrl = ytData.videoUrl || url;
        if (ytData.title || ytData.author) {
          setVideoMeta({
            title: ytData.title || "",
            author: ytData.author || "",
            thumbnail: ytData.thumbnail || "",
          });
          setOutputTitle(ytData.title || url);
        } else {
          setOutputTitle(url);
        }
      } else {
        setOutputTitle("Summary");
      }

      setLoadingMsg("Generating summary...");
      const body: Record<string, string> = { text: finalText, mode: apiMode };
      if (finalUrl) body.youtubeUrl = finalUrl;

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || err.message || "Request failed");
      }
      const data = await res.json();
      const summaryText: string = data.summary || "";

      const words = summaryText.split(" ");
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 8));
        setOutput(words.slice(0, i + 1).join(" "));
      }
      addToast("Summary generated", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      addToast(msg, "error");
    } finally {
      setLoading(false);
      setLoadingMsg("Summarizing...");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = (ext: "md" | "txt") => {
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `summary.${ext}`;
    a.click();
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
        .main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
        .page-content{flex:1;padding:24px;overflow:auto}
        @media(max-width:768px){.page-content{padding:16px}}
        @media(max-width:480px){.page-content{padding:12px}}
        .card{background:var(--card);border:1px solid var(--card-b);border-radius:14px;overflow:hidden}
        .mode-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
        @media(max-width:900px){.mode-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:600px){.mode-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:380px){.mode-grid{grid-template-columns:1fr}}
        .mode-card{background:var(--card);border:1px solid var(--card-b);border-radius:12px;padding:14px;cursor:pointer;transition:all .18s;position:relative}
        .mode-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.12)}
        .mode-card.selected{border-color:var(--accent);background:var(--accent-l)}
        .history-panel{position:fixed;right:0;top:0;bottom:0;width:320px;background:var(--bg2);border-left:1px solid var(--border);z-index:300;display:flex;flex-direction:column;transition:transform .25s}
        .history-panel.closed{transform:translateX(100%)}
        @media(max-width:480px){.history-panel{width:100%}}
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
      {mobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            zIndex: 299,
          }}
          onClick={() => setShowHistory(false)}
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
              >
                <NavIcon type={item.icon} />
                <span className="sb-lbl">{item.label}</span>
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </Link>
            ))}
          </nav>
          <div className="sb-bottom">
            {userProfile?.plan === "free" && (
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
            <button
              className="sb-btn"
              onClick={async () => {
                await signOut();
                router.push("/sign-in");
              }}
              title={sidebarCollapsed ? "Sign out" : undefined}
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
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.1rem",
                fontWeight: 300,
                color: "var(--text)",
                flex: 1,
              }}
            >
              Text Summarizer
            </span>
            <button
              className="topbar-btn"
              onClick={() => {
                setShowHistory(true);
                loadHistory();
              }}
              title="History"
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
            <button className="topbar-btn" onClick={toggleTheme}>
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
          </div>

          <div className="page-content">
            <div
              style={{
                maxWidth: 900,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div
                style={{ animation: "fu .4s ease both", textAlign: "center" }}
              >
                <h1
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.8rem",
                    fontWeight: 300,
                    color: "var(--text)",
                    marginBottom: 6,
                  }}
                >
                  Text Summarizer
                </h1>
                <p style={{ fontSize: ".88rem", color: "var(--text3)" }}>
                  Summarize anything in 10 different ways. Paste text or drop a
                  YouTube URL.
                </p>
              </div>

              <div
                className="card"
                style={{ animation: "fu .4s .05s ease both" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    borderBottom: "1px solid var(--card-b)",
                    padding: "12px 16px",
                    gap: 8,
                  }}
                >
                  {(["text", "youtube"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 18px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--sans)",
                        fontSize: ".82rem",
                        fontWeight: 500,
                        background: tab === t ? "var(--accent)" : "transparent",
                        color: tab === t ? "#fff" : "var(--text3)",
                        transition: "all .15s",
                      }}
                    >
                      {t === "text" ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
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
                          strokeLinejoin="round"
                        >
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                        </svg>
                      )}
                      {t === "text" ? "Paste Text" : "YouTube URL"}
                    </button>
                  ))}
                </div>
                <div style={{ padding: 16 }}>
                  {tab === "text" ? (
                    <>
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder="Paste your article, transcript, meeting notes, or any text here..."
                        style={{
                          width: "100%",
                          height: 160,
                          background: "var(--bg2)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          padding: "12px 14px",
                          fontFamily: "var(--sans)",
                          fontSize: ".88rem",
                          color: "var(--text)",
                          resize: "none",
                          outline: "none",
                          lineHeight: 1.6,
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 10,
                        }}
                      >
                        <span
                          style={{ fontSize: ".72rem", color: "var(--text3)" }}
                        >
                          {pasteText.length.toLocaleString()} chars
                        </span>
                        <button
                          onClick={handleSummarize}
                          disabled={loading || !pasteText.trim()}
                          style={{
                            background: "var(--accent)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 9,
                            padding: "9px 20px",
                            fontFamily: "var(--sans)",
                            fontSize: ".84rem",
                            fontWeight: 600,
                            cursor:
                              loading || !pasteText.trim()
                                ? "not-allowed"
                                : "pointer",
                            opacity: loading || !pasteText.trim() ? 0.5 : 1,
                          }}
                        >
                          {loading ? loadingMsg : "Summarize"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        style={{
                          width: "100%",
                          height: 46,
                          background: "var(--bg2)",
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          padding: "0 14px",
                          fontFamily: "var(--sans)",
                          fontSize: ".88rem",
                          color: "var(--text)",
                          outline: "none",
                          display: "block",
                        }}
                      />
                      <button
                        onClick={handleSummarize}
                        disabled={loading || !youtubeUrl.trim()}
                        style={{
                          marginTop: 12,
                          width: "100%",
                          height: 42,
                          background: "var(--accent)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 9,
                          fontFamily: "var(--sans)",
                          fontSize: ".84rem",
                          fontWeight: 600,
                          cursor:
                            loading || !youtubeUrl.trim()
                              ? "not-allowed"
                              : "pointer",
                          opacity: loading || !youtubeUrl.trim() ? 0.5 : 1,
                        }}
                      >
                        {loading ? loadingMsg : "Fetch & Summarize"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ animation: "fu .4s .1s ease both" }}>
                <p
                  style={{
                    fontSize: ".78rem",
                    fontWeight: 600,
                    color: "var(--text3)",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Summary Mode
                </p>
                <div className="mode-grid">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      className={`mode-card${selectedMode === m.id ? " selected" : ""}`}
                      onClick={() => setSelectedMode(m.id)}
                    >
                      <div
                        style={{
                          color:
                            selectedMode === m.id
                              ? "var(--accent)"
                              : "var(--text3)",
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {m.icon}
                      </div>
                      <div
                        style={{
                          fontSize: ".8rem",
                          fontWeight: 600,
                          color: "var(--text2)",
                          marginBottom: 6,
                          lineHeight: 1.3,
                          textAlign: "center",
                        }}
                      >
                        {m.label}
                      </div>
                      <div
                        style={{
                          fontSize: ".7rem",
                          color: "var(--text3)",
                          lineHeight: 1.4,
                          textAlign: "center",
                        }}
                      >
                        {m.desc}
                      </div>
                      {selectedMode === m.id && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "var(--accent)",
                            fontSize: ".9rem",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {(output || loading) && (
                <div className="card" style={{ animation: "fu .4s ease both" }}>
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--card-b)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: ".7rem",
                        fontWeight: 700,
                        background: "var(--accent)",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 100,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                      }}
                    >
                      {MODES.find((m) => m.id === selectedMode)?.label}
                    </span>
                    {videoMeta?.title ? (
                      <span
                        style={{
                          fontSize: ".84rem",
                          color: "var(--text2)",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {videoMeta.title}
                        {videoMeta.author ? ` · ${videoMeta.author}` : ""}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: ".84rem",
                          color: "var(--text2)",
                          flex: 1,
                        }}
                      >
                        {outputTitle}
                      </span>
                    )}
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <button
                        onClick={handleCopy}
                        style={{
                          background: "var(--bg3)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "7px 14px",
                          fontSize: ".78rem",
                          fontWeight: 500,
                          color: "var(--text2)",
                          cursor: "pointer",
                          transition: "all .15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--bg2)";
                          e.currentTarget.style.borderColor = "var(--border2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--bg3)";
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      >
                        {copied ? "✓ Copied" : "Copy"}
                      </button>
                      <button
                        onClick={() => handleDownload("md")}
                        style={{
                          background: "var(--bg3)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "7px 14px",
                          fontSize: ".78rem",
                          fontWeight: 500,
                          color: "var(--text2)",
                          cursor: "pointer",
                          transition: "all .15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--bg2)";
                          e.currentTarget.style.borderColor = "var(--border2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--bg3)";
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      >
                        .md
                      </button>
                      <button
                        onClick={() => handleDownload("txt")}
                        style={{
                          background: "var(--bg3)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "7px 14px",
                          fontSize: ".78rem",
                          fontWeight: 500,
                          color: "var(--text2)",
                          cursor: "pointer",
                          transition: "all .15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--bg2)";
                          e.currentTarget.style.borderColor = "var(--border2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--bg3)";
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      >
                        .txt
                      </button>
                      <button
                        onClick={handleSummarize}
                        disabled={loading}
                        style={{
                          background: "var(--accent)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "7px 14px",
                          fontSize: ".78rem",
                          fontWeight: 600,
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                          transition: "all .15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!loading)
                            e.currentTarget.style.background = "#ea6c0a";
                        }}
                        onMouseLeave={(e) => {
                          if (!loading)
                            e.currentTarget.style.background = "var(--accent)";
                        }}
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    {loading && !output ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {[100, 90, 95, 80, 85].map((w, i) => (
                          <Skeleton key={i} w={`${w}%`} h={14} />
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "1rem",
                          lineHeight: 1.8,
                          color: "var(--text)",
                        }}
                        className="summary-prose-modern"
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            script: () => null,
                            h1: ({ node, ...props }) => (
                              <h1
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: 700,
                                  marginBottom: "0.75rem",
                                  color: "var(--text)",
                                  borderBottom: "1px solid var(--border)",
                                  paddingBottom: "0.5rem",
                                }}
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                style={{
                                  fontSize: "1.25rem",
                                  fontWeight: 600,
                                  marginTop: "1.25rem",
                                  marginBottom: "0.5rem",
                                  color: "var(--text)",
                                }}
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                style={{
                                  fontSize: "1.1rem",
                                  fontWeight: 600,
                                  marginTop: "1rem",
                                  marginBottom: "0.4rem",
                                  color: "var(--text2)",
                                }}
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p
                                style={{
                                  marginBottom: "0.75rem",
                                  color: "var(--text2)",
                                }}
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                style={{
                                  marginBottom: "0.75rem",
                                  paddingLeft: "1.5rem",
                                  listStyleType: "disc",
                                }}
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                style={{
                                  marginBottom: "0.75rem",
                                  paddingLeft: "1.5rem",
                                  listStyleType: "decimal",
                                }}
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li
                                style={{
                                  marginBottom: "0.25rem",
                                  color: "var(--text2)",
                                }}
                                {...props}
                              />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong
                                style={{
                                  fontWeight: 700,
                                  color: "var(--text)",
                                }}
                                {...props}
                              />
                            ),
                            em: ({ node, ...props }) => (
                              <em style={{ fontStyle: "italic" }} {...props} />
                            ),
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                style={{
                                  borderLeft: "3px solid var(--accent)",
                                  paddingLeft: "1rem",
                                  margin: "0.75rem 0",
                                  fontStyle: "italic",
                                  color: "var(--text3)",
                                }}
                                {...props}
                              />
                            ),
                            hr: ({ node, ...props }) => (
                              <hr
                                style={{
                                  borderColor: "var(--border)",
                                  margin: "1rem 0",
                                }}
                                {...props}
                              />
                            ),
                          }}
                        >
                          {output}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`history-panel${showHistory ? "" : " closed"}`}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1rem",
              fontWeight: 300,
              color: "var(--text)",
            }}
          >
            Recent Summaries
          </span>
          <button
            onClick={() => setShowHistory(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text3)",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {historyLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} h={60} r={10} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 16px",
                color: "var(--text3)",
                fontSize: ".84rem",
              }}
            >
              No summaries yet. Run your first one above.
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setOutput(item.output_text);
                  setShowHistory(false);
                }}
                style={{
                  width: "100%",
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 8,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: ".66rem",
                      fontWeight: 700,
                      background: "var(--accent)",
                      color: "#fff",
                      padding: "1px 7px",
                      borderRadius: 100,
                    }}
                  >
                    {item.mode}
                  </span>
                  <span style={{ fontSize: ".7rem", color: "var(--text3)" }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: ".78rem",
                    color: "var(--text2)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.input_text?.slice(0, 60)}...
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
