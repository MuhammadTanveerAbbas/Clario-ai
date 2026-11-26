"use client";
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingPage } from "@/components/ui/loading-page";
import { getMarkdownComponents } from "@/lib/markdown-components";
import { Page, PageHeader } from "@/components/layout/page";


interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}
interface BrandVoice {
  id: string;
  name: string;
  tone?: string;
  vocabulary?: string;
  personality?: string;
  description?: string;
  is_active: boolean;
}

function formatBrandVoice(voice: BrandVoice): string {
  return [
    `Name: ${voice.name}`,
    voice.tone && `Tone: ${voice.tone}`,
    voice.vocabulary && `Vocabulary: ${voice.vocabulary}`,
    voice.personality && `Personality: ${voice.personality}`,
    voice.description && `Description: ${voice.description}`,
  ]
    .filter(Boolean)
    .join("\n");
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
        <svg {...p} aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case "chat":
      return (
        <svg {...p} aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "doc":
      return (
        <svg {...p} aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
        </svg>
      );
    case "remix":
      return (
        <svg {...p} aria-hidden="true">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    case "voice":
      return (
        <svg {...p} aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "cal":
      return (
        <svg {...p} aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "settings":
      return (
        <svg {...p} aria-hidden="true">
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
      className="animate-pulse"
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "var(--surface-3)",
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
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderLeft: `3px solid ${t.type === "success" ? "var(--color-success)" : t.type === "error" ? "var(--color-danger)" : "hsl(var(--accent))"}`,
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

const FORMATS = [
  { id: "twitter",   label: "X Thread" },
  { id: "linkedin",  label: "LinkedIn Post" },
  { id: "email",     label: "Email Newsletter" },
  { id: "youtube",   label: "YouTube Description" },
  { id: "podcast",   label: "Podcast Show Notes" },
  { id: "blog",      label: "Blog Outline" },
  { id: "instagram", label: "Instagram Caption" },
  { id: "shorts",    label: "Short-form Script" },
  { id: "quotes",    label: "Pull Quotes" },
  { id: "carousel",  label: "LinkedIn Carousel" },
];

function FormatIcon({ type }: { type: string }) {
  // filled icons for brand logos, stroke for generic
  switch (type) {
    case "twitter": // X (formerly Twitter)
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.207-6.807-5.974 6.807H2.882l7.432-8.504-8.17-10.996h6.82l4.71 6.23 5.886-6.23zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "email":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
        </svg>
      );
    case "youtube":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "podcast":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
          <path d="M19 10v2a7 7 0 01-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      );
    case "blog":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      );
    case "instagram":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "shorts": // short-form video script clapperboard
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.2 6L3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.6l13.5-4.6c1-.3 2.1.2 2.4 1.3L20.2 6z" />
          <path d="M2 11h20v9a2 2 0 01-2 2H4a2 2 0 01-2-2v-9z" />
          <line x1="7" y1="11" x2="7" y2="23" />
          <line x1="12" y1="11" x2="12" y2="23" />
        </svg>
      );
    case "quotes": // pull quotes
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      );
    case "carousel": // LinkedIn carousel slides
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="4" width="14" height="16" rx="2" />
          <path d="M18 7h1a2 2 0 012 2v9a2 2 0 01-2 2h-1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function RemixPage() {
  const supabase = createClient();
  const { user: authUser, loading: authLoading } = useAuth();

  const [content, setContent] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(
    new Set(FORMATS.map((f) => f.id)),
  );
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [activeBrandVoice, setActiveBrandVoice] = useState<BrandVoice | null>(
    null,
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userProfile, setUserProfile] = useState<{
    full_name?: string;
    subscription_tier?: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      .select("full_name, subscription_tier")
      .eq("id", authUser.id)
      .single()
      .then(({ data }) => {
        if (data) setUserProfile(data);
      });
    supabase
      .from("brand_voices")
      .select(
        "id, name, tone, vocabulary, personality, description, is_active, created_at",
      )
      .eq("user_id", authUser.id)
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        if (data) setActiveBrandVoice(data);
      });
  }, [authUser, supabase]);

  const toggleFormat = (id: string) => {
    setSelectedFormats((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleGenerate = async () => {
    if (!content.trim() || content.trim().length < 50) {
      addToast("Content must be at least 50 characters", "error");
      return;
    }
    setLoading(true);
    setOutputs({});
    try {
      const res = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          formats: Array.from(selectedFormats),
          ...(activeBrandVoice && { brandVoice: formatBrandVoice(activeBrandVoice) }),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }
      const data = await res.json();
      const results: Record<string, string> = data.results || {};
      // Reveal outputs one by one
      const keys = FORMATS.filter((f) => selectedFormats.has(f.id)).map(
        (f) => f.id,
      );
      for (const key of keys) {
        if (results[key]) {
          setOutputs((prev) => ({ ...prev, [key]: results[key] }));
          await new Promise((r) => setTimeout(r, 150));
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
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDownload = (label: string, text: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${label.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
  };

  const hasOutputs = Object.keys(outputs).length > 0;

  if (authLoading) return <LoadingPage />;
  if (!authUser) return <LoadingPage />;

  return (
    <>
      <style>{`
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .remix-feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        @media(max-width:560px){.remix-feature-grid{grid-template-columns:1fr}}
        .card{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:visible}
        .remix-layout{display:flex;gap:20px;min-height:0}
        .remix-left{flex:1;min-width:0;display:flex;flex-direction:column;gap:16px}
        .remix-right{width:280px;flex-shrink:0}
        @media(max-width:900px){.remix-right{display:none}}
        .format-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
        @media(max-width:1024px){.format-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:768px){.format-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:480px){.format-grid{grid-template-columns:1fr}}
        .format-card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px;cursor:pointer;transition:border-color .15s,background .15s;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;text-align:center}
        .format-card:hover{background:var(--surface-2);border-color:var(--line-strong)}
        .format-card.selected{border-color:var(--brand);background:var(--brand-soft)}
        .format-card.selected svg{color:var(--brand)}
      `}</style>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
      <Page wide>
        <PageHeader
          title="Remix Studio"
          description="One input, ten formats. Adapt a single idea for every channel."
        />
        <div className="remix-layout">
              <div className="remix-left">
                <div
                  className="card"
                  style={{ animation: "fu .4s .05s ease both" }}
                >
                  <div style={{ padding: 16 }}>
                    {activeBrandVoice && (
                      <div style={{ marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: ".74rem",
                            background: "var(--accent-l)",
                            color: "hsl(var(--accent))",
                            border: "1px solid var(--accent-m)",
                            borderRadius: 100,
                            padding: "2px 10px",
                          }}
                        >
                          {activeBrandVoice.name} active
                        </span>
                      </div>
                    )}
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste your content here  a video transcript, blog post, newsletter, or any text..."
                      style={{
                        width: "100%",
                        height: 160,
                        background: "var(--bg2)",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 10,
                        padding: "12px 14px",
                        fontFamily: "var(--sans)",
                        fontSize: ".88rem",
                        color: "var(--text)",
                        resize: "none",
                        outline: "none",
                        lineHeight: 1.6,
                        marginBottom: 12,
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 0,
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={() =>
                            setSelectedFormats(
                              new Set(FORMATS.map((f) => f.id)),
                            )
                          }
                          style={{
                            background: "var(--bg3)",
                            border: "1px solid hsl(var(--border))",
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
                            e.currentTarget.style.borderColor =
                              "var(--border2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--bg3)";
                            e.currentTarget.style.borderColor = "hsl(var(--border))";
                          }}
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setSelectedFormats(new Set())}
                          style={{
                            background: "var(--bg3)",
                            border: "1px solid hsl(var(--border))",
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
                            e.currentTarget.style.borderColor =
                              "var(--border2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--bg3)";
                            e.currentTarget.style.borderColor = "hsl(var(--border))";
                          }}
                        >
                          Deselect All
                        </button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{ fontSize: ".72rem", color: "var(--text3)" }}
                        >
                          {selectedFormats.size} formats selected
                        </span>
                        <button
                          onClick={handleGenerate}
                          disabled={
                            loading ||
                            !content.trim() ||
                            selectedFormats.size === 0
                          }
                          style={{
                            background: "hsl(var(--accent))",
                            color: "var(--color-paper)",
                            border: "none",
                            borderRadius: 9,
                            padding: "8px 18px",
                            fontFamily: "var(--sans)",
                            fontSize: ".84rem",
                            fontWeight: 600,
                            cursor:
                              loading ||
                              !content.trim() ||
                              selectedFormats.size === 0
                                ? "not-allowed"
                                : "pointer",
                            opacity:
                              loading ||
                              !content.trim() ||
                              selectedFormats.size === 0
                                ? 0.5
                                : 1,
                          }}
                        >
                          {loading ? "Generating..." : "Generate Selected"}
                        </button>
                      </div>
                    </div>
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
                    Formats
                  </p>
                  <div className="format-grid">
                    {FORMATS.map((f) => {
                      const sel = selectedFormats.has(f.id);
                      return (
                        <button
                          key={f.id}
                          className={`format-card${sel ? " selected" : ""}`}
                          onClick={() => toggleFormat(f.id)}
                        >
                          <FormatIcon type={f.id} />
                          <span
                            style={{
                              fontSize: ".7rem",
                              fontWeight: 500,
                              color: "var(--text2)",
                              flex: 1,
                              textAlign: "center",
                            }}
                          >
                            {f.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {loading && !hasOutputs && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {FORMATS.filter((f) => selectedFormats.has(f.id)).map(
                      (f) => (
                        <div
                          key={f.id}
                          className="card"
                          style={{ padding: 16 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 12,
                            }}
                          >
                            <FormatIcon type={f.id} />
                            <span
                              style={{
                                fontSize: ".82rem",
                                fontWeight: 500,
                                color: "var(--text2)",
                              }}
                            >
                              {f.label}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {[100, 90, 95].map((w, i) => (
                              <Skeleton key={i} w={`${w}%`} h={12} />
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {hasOutputs && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {FORMATS.filter((f) => outputs[f.id]).map((f) => {
                      const isCollapsed = collapsed.has(f.id);
                      return (
                        <div key={f.id} className="card">
                          <div
                            style={{
                              padding: "12px 16px",
                              borderBottom: isCollapsed
                                ? "none"
                                : "1px solid var(--card-b)",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <FormatIcon type={f.id} />
                            <span
                              style={{
                                fontSize: ".84rem",
                                fontWeight: 500,
                                color: "var(--text2)",
                                flex: 1,
                              }}
                            >
                              {f.label}
                            </span>
                            <button
                              onClick={() => handleCopy(f.id, outputs[f.id])}
                              style={{
                                background: "var(--bg3)",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: 8,
                                padding: "7px 14px",
                                fontSize: ".78rem",
                                fontWeight: 500,
                                color: "var(--text2)",
                                cursor: "pointer",
                                transition: "all .15s",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--bg2)";
                                e.currentTarget.style.borderColor =
                                  "var(--border2)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "var(--bg3)";
                                e.currentTarget.style.borderColor =
                                  "hsl(var(--border))";
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                               aria-hidden="true">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <rect
                                  x="8"
                                  y="2"
                                  width="8"
                                  height="4"
                                  rx="1"
                                  ry="1"
                                />
                              </svg>
                              {copiedId === f.id ? "✓ Copied" : "Copy"}
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(f.label, outputs[f.id])
                              }
                              style={{
                                background: "var(--bg3)",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: 8,
                                padding: "7px 14px",
                                fontSize: ".78rem",
                                fontWeight: 500,
                                color: "var(--text2)",
                                cursor: "pointer",
                                transition: "all .15s",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--bg2)";
                                e.currentTarget.style.borderColor =
                                  "var(--border2)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "var(--bg3)";
                                e.currentTarget.style.borderColor =
                                  "hsl(var(--border))";
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                               aria-hidden="true">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              .md
                            </button>
                            <button
                              onClick={() =>
                                setCollapsed((prev) => {
                                  const n = new Set(prev);
                                  n.has(f.id) ? n.delete(f.id) : n.add(f.id);
                                  return n;
                                })
                              }
                              style={{
                                background: "var(--bg3)",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: 8,
                                padding: "7px 14px",
                                fontSize: ".78rem",
                                fontWeight: 500,
                                color: "var(--text2)",
                                cursor: "pointer",
                                transition: "all .15s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--bg2)";
                                e.currentTarget.style.borderColor =
                                  "var(--border2)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "var(--bg3)";
                                e.currentTarget.style.borderColor =
                                  "hsl(var(--border))";
                              }}
                            >
                              {isCollapsed ? (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                 aria-hidden="true">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              ) : (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                 aria-hidden="true">
                                  <polyline points="18 15 12 9 6 15" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {!isCollapsed && (
                            <div
                              style={{
                                padding: 16,
                                fontSize: ".86rem",
                                color: "var(--text)",
                                lineHeight: 1.7,
                              }}
                            >
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={getMarkdownComponents()}
                              >
                                {outputs[f.id]}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
      </Page>
    </>
  );
}
