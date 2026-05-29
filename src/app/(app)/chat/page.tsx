"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/contexts/SidebarContext";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { LoadingPage } from "@/components/ui/loading-page";
import { Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
            borderLeft: `3px solid ${t.type === "success" ? "#10b981" : t.type === "error" ? "#ef4444" : "hsl(var(--accent))"}`,
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

export default function ChatPage() {
  const supabase = createClient();
  const { user: authUser, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { mobileOpen: mobileSidebarOpen, setMobileOpen: setMobileSidebarOpen } =
    useSidebar();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("New Chat");
  const [editingTitle, setEditingTitle] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeBrandVoice, setActiveBrandVoice] = useState<BrandVoice | null>(
    null,
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState<
    { id: string; title: string; created_at: string; updated_at: string }[]
  >([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!authUser) return;
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

  const loadSessions = useCallback(async () => {
    if (!authUser) return;
    setSessionsLoading(true);
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("id, title, created_at, updated_at")
      .eq("user_id", authUser.id)
      .order("updated_at", { ascending: false });
    if (!error && data) setSessions(data);
    setSessionsLoading(false);
  }, [authUser, supabase]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const adjustTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 144) + "px";
  };

  const deactivateVoice = async () => {
    if (!activeBrandVoice) return;
    await supabase
      .from("brand_voices")
      .update({ is_active: false })
      .eq("id", activeBrandVoice.id);
    setActiveBrandVoice(null);
    addToast("Brand voice deactivated", "info");
  };

  const openSession = async (id: string, title: string) => {
    setConversationId(id);
    setSessionTitle(title);
    const { data } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true });
    if (data?.length) {
      setMessages(
        data.map((row) => ({
          id: row.id,
          role: row.role as "user" | "assistant",
          content: row.content,
        })),
      );
    } else {
      setMessages([]);
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("chat_sessions").delete().eq("id", id);
    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
      setSessionTitle("New Chat");
    }
    void loadSessions();
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      pending: true,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const body: Record<string, unknown> = {
        message: content,
        conversationId,
        history,
      };
      if (activeBrandVoice) {
        body.brandVoice = [
          activeBrandVoice.tone && `Tone: ${activeBrandVoice.tone}`,
          activeBrandVoice.personality &&
            `Personality: ${activeBrandVoice.personality}`,
        ]
          .filter(Boolean)
          .join(". ");
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }
      const data = await res.json();
      const aiContent: string = data.response || "";
      if (data.conversationId && typeof data.conversationId === "string") {
        setConversationId(data.conversationId);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: aiContent, pending: false }
            : m,
        ),
      );
      void loadSessions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      addToast(msg, "error");
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMsg.id && m.id !== userMsg.id),
      );
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

  if (authLoading) return <LoadingPage />;
  if (!authUser) return <LoadingPage />;

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes pulse-dot{0%,80%,100%{opacity:0.3;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}

        .dash-layout{display:flex;height:100vh;overflow:hidden;background:var(--bg)}
        .topbar{height:56px;border-bottom:1px solid hsl(var(--border));display:flex;align-items:center;padding:0 20px;gap:12px;background:var(--bg);position:sticky;top:0;z-index:40;flex-shrink:0}
        .topbar-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;border:1px solid hsl(var(--border));background:var(--bg2);color:var(--text3);cursor:pointer;transition:all .15s}
        .topbar-btn:hover{background:var(--bg3);color:var(--text2);border-color:var(--border2)}
        .topbar-hamburger{display:none}
        @media(max-width:768px){.topbar-hamburger{display:flex}.topbar{padding:0 12px;gap:8px}}
        .main-area{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
        .chat-layout{display:flex;flex:1;height:calc(100vh - 56px);overflow:hidden}
        .sessions-panel{width:260px;border-right:1px solid hsl(var(--border));display:flex;flex-direction:column;flex-shrink:0;background:var(--bg2);transition:width .22s cubic-bezier(.4,0,.2,1),opacity .22s}
        .sessions-panel[data-collapsed="true"]{width:0;opacity:0;overflow:hidden;border-right:none}
        @media(max-width:768px){.sessions-panel{display:none}.sessions-panel.open{display:flex;position:fixed;left:0;top:56px;bottom:0;z-index:100;width:260px;background:var(--bg2);opacity:1;border-right:1px solid hsl(var(--border))}}
        .chat-area{flex:1;display:flex;flex-direction:column;min-width:0}
        .chat-header{height:56px;border-bottom:1px solid hsl(var(--border));display:flex;align-items:center;padding:0 16px;gap:10px;flex-shrink:0}
        .messages-area{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.15) transparent}
        .messages-area::-webkit-scrollbar{width:4px}
        .messages-area::-webkit-scrollbar-track{background:transparent}
        .messages-area::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px}
        .messages-area::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.25)}
        @media(max-width:480px){.messages-area{padding:12px;gap:8px}}
        .msg-user{align-self:flex-end;background:hsl(var(--accent));color:#fff;border-radius:16px 16px 4px 16px;padding:10px 14px;max-width:85%;font-size:.88rem;line-height:1.5;white-space:pre-wrap;word-break:break-word}
        .msg-assistant{align-self:flex-start;background:hsl(var(--card));border:1px solid var(--card-b);border-radius:4px 16px 16px 16px;padding:10px 14px;max-width:88%;font-size:.88rem;line-height:1.6;white-space:normal;word-break:break-word}
        .input-area{border-top:1px solid hsl(var(--border));padding:16px;flex-shrink:0;background:var(--bg)}
        @media(max-width:480px){.input-area{padding:10px}}
        .input-row{display:flex;gap:10px;align-items:flex-end}
        .chat-textarea{flex:1;background:var(--bg2);border:1px solid hsl(var(--border));border-radius:12px;padding:10px 14px;font-family:var(--sans);font-size:.88rem;color:var(--text);resize:none;min-height:44px;max-height:144px;outline:none;transition:border-color .15s;line-height:1.5}
        .chat-textarea:focus{border-color:hsl(var(--accent))}
        .send-btn{width:40px;height:40px;border-radius:50%;background:hsl(var(--accent));border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}
        .send-btn:disabled{opacity:.4;cursor:not-allowed}
        .send-btn:not(:disabled):hover{background:#ea6c0a}
        .typing-dot{width:7px;height:7px;border-radius:50%;background:var(--text3);display:inline-block;animation:pulse-dot 1.2s ease-in-out infinite}
        .starter-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
        @media(max-width:600px){.starter-grid{grid-template-columns:1fr}}
        .starter-card{background:var(--bg3);border:1px solid hsl(var(--border));border-radius:10px;padding:14px;cursor:pointer;font-size:.82rem;color:var(--text2);transition:all .15s;text-align:left}
        .starter-card:hover{border-color:hsl(var(--accent));color:hsl(var(--accent))}
      `}</style>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      <div className="dash-layout">
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
              AI Chat
            </span>
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

          <div className="chat-layout">
            <div
              className={`sessions-panel${showSessions ? " open" : ""}`}
              data-collapsed={String(!showSessions)}
            >
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid hsl(var(--border))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 600,
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Conversations
                </span>
                <button
                  onClick={() => {
                    setConversationId(null);
                    setMessages([]);
                    setSessionTitle("New Chat");
                  }}
                  style={{
                    background: "hsl(var(--accent))",
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    padding: "4px 10px",
                    fontSize: ".72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + New
                </button>
              </div>
              <div
                className="scrollable-sessions"
                style={{
                  flex: 1,
                  padding: "8px",
                  overflowY: "auto",
                }}
              >
                {sessionsLoading ? (
                  <div
                    style={{
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 44,
                          borderRadius: 8,
                          background: "var(--bg3)",
                          animation: "pulse 1.2s ease-in-out infinite",
                        }}
                      />
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: "32px 16px",
                      color: "var(--text3)",
                      textAlign: "center",
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span
                      style={{
                        fontSize: ".8rem",
                        fontWeight: 500,
                        color: "var(--text2)",
                      }}
                    >
                      No conversations yet
                    </span>
                    <span style={{ fontSize: ".74rem" }}>
                      Start a new chat below
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => void openSession(s.id, s.title)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            void openSession(s.id, s.title);
                        }}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          background:
                            conversationId === s.id
                              ? "var(--accent-l)"
                              : "var(--bg3)",
                          border: `1px solid ${conversationId === s.id ? "var(--accent-m)" : "hsl(var(--border))"}`,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            fontSize: ".82rem",
                            fontWeight: 600,
                            color: "var(--text2)",
                            marginBottom: 4,
                          }}
                        >
                          {s.title}
                        </div>
                        <div
                          style={{
                            fontSize: ".68rem",
                            color: "var(--text3)",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <span>
                            {new Date(s.updated_at).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => void deleteSession(s.id, e)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: ".68rem",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="chat-area">
              <div className="chat-header">
                <button
                  className="topbar-btn"
                  onClick={() => setShowSessions(!showSessions)}
                  title="Toggle sessions"
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
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
                {editingTitle ? (
                  <input
                    autoFocus
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setEditingTitle(false)
                    }
                    style={{
                      flex: 1,
                      background: "var(--bg2)",
                      border: "1px solid hsl(var(--accent))",
                      borderRadius: 7,
                      padding: "4px 10px",
                      fontFamily: "var(--sans)",
                      fontSize: ".88rem",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                ) : (
                  <div
                    className="group relative flex flex-1 items-center gap-1"
                    style={{ minWidth: 0, flex: 1 }}
                  >
                    <span
                      onDoubleClick={() => setEditingTitle(true)}
                      style={{
                        flex: 1,
                        fontSize: ".88rem",
                        fontWeight: 500,
                        color: "var(--text2)",
                        cursor: "text",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sessionTitle}
                    </span>
                    <button
                      type="button"
                      className="opacity-0 transition-opacity group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 text-[var(--text3)]"
                      aria-label="Edit title"
                      onClick={() => setEditingTitle(true)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <button
                  className="topbar-btn"
                  title="Clear chat"
                  type="button"
                  onClick={() => {
                    if (messages.length > 0) setClearDialogOpen(true);
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
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>

              <div className="messages-area scrollable">
                {messages.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      padding: "40px 20px",
                      animation: "fu .4s ease both",
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>✨</div>
                    <h2
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "1.5rem",
                        fontWeight: 300,
                        color: "var(--text)",
                        marginBottom: 8,
                        textAlign: "center",
                      }}
                    >
                      What are you creating today?
                    </h2>
                    <p
                      style={{
                        fontSize: ".88rem",
                        color: "var(--text3)",
                        textAlign: "center",
                        maxWidth: 400,
                        marginBottom: 24,
                      }}
                    >
                      Ask anything about your content strategy, get writing
                      feedback, or repurpose ideas.
                    </p>
                    <div
                      className="starter-grid"
                      style={{ width: "100%", maxWidth: 480 }}
                    >
                      {STARTER_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          className="starter-card"
                          onClick={() => sendMessage(prompt)}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={
                        msg.role === "user" ? "msg-user" : "msg-assistant"
                      }
                    >
                      {msg.role === "user" ? (
                        msg.content
                      ) : msg.pending ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              fontSize: ".74rem",
                              color: "var(--text3)",
                              marginRight: 4,
                            }}
                          >
                            Clario is writing...
                          </span>
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="typing-dot"
                              style={{ animationDelay: `${i * 0.16}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="input-area">
                {activeBrandVoice && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: ".74rem",
                        background: "var(--accent-l)",
                        color: "hsl(var(--accent))",
                        border: "1px solid var(--accent-m)",
                        borderRadius: 100,
                        padding: "2px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      🎨 {activeBrandVoice.name} active
                      <button
                        onClick={deactivateVoice}
                        style={{
                          background: "none",
                          border: "none",
                          color: "hsl(var(--accent))",
                          cursor: "pointer",
                          fontSize: ".7rem",
                          padding: 0,
                          marginLeft: 2,
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                )}
                {input.length > 1800 && (
                  <div
                    style={{
                      fontSize: ".72rem",
                      color: input.length > 1950 ? "#ef4444" : "var(--text3)",
                      textAlign: "right",
                      marginBottom: 4,
                    }}
                  >
                    {input.length}/2000
                  </div>
                )}
                <div className="input-row">
                  <textarea
                    ref={textareaRef}
                    className="chat-textarea"
                    placeholder="Ask anything..."
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      adjustTextarea();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    maxLength={2000}
                    rows={1}
                  />
                  <button
                    className="send-btn"
                    disabled={!input.trim() || loading}
                    onClick={() => sendMessage()}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              onClick={() => {
                setMessages([]);
                setClearDialogOpen(false);
                addToast("Chat cleared", "info");
              }}
            >
              Clear Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
