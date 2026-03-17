"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/app-navbar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles, Youtube, Lightbulb, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CREATOR_PROMPTS = [
  {
    icon: Youtube,
    title: "Analyze video",
    prompt: "I just watched a YouTube video about [topic]. Help me identify: 1) The main hook, 2) Content structure, 3) What made it engaging, 4) How I can apply this to my content",
  },
  {
    icon: Lightbulb,
    title: "Content ideas",
    prompt: "I create content about [your niche]. Give me 10 viral content ideas based on current trends. Format: Title + Hook + Why it works",
  },
  {
    icon: TrendingUp,
    title: "Improve hook",
    prompt: "Here's my video/post hook: [paste your hook]. Make it 10x more attention-grabbing. Give me 5 variations.",
  },
  {
    icon: Target,
    title: "Repurpose content",
    prompt: "I have this piece of content: [paste content]. Show me how to repurpose it into: 1) Twitter thread, 2) LinkedIn post, 3) Email newsletter, 4) Instagram carousel",
  },
];

const formatMessage = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-3 mb-1.5 text-white">{line.replace('### ', '')}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold mt-4 mb-2 text-white">{line.replace('## ', '')}</h2>;
    if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-semibold mt-4 mb-2 text-white">{line.replace('# ', '')}</h1>;
    
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const formatted = parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-medium text-white">{part}</strong> : part);
    
    if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1 text-white/80">{line.replace('- ', '• ')}</li>;
    if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 mb-1 text-white/80">{line}</li>;
    if (line.trim() === '') return <br key={i} />;
    
    return <p key={i} className="mb-1.5 text-white/80">{formatted}</p>;
  });
};

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(48);

  useEffect(() => {
    if (!authLoading && !user) router.push("/sign-in");
  }, [user, authLoading, router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || loading) return;

    const userMsg = { role: "user" as const, content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          conversationId,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to send message");
      }
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message" });
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-[#0A0A0A] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <AppNavbar />
      <main className="flex-1 flex flex-col pt-16">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            {messages.length === 0 ? (
              <div className="space-y-8">
                {/* Header */}
                <div className="text-center pt-8 pb-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] mb-4">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-white mb-2">AI Chat</h1>
                  <p className="text-sm text-white/50">Ask me anything about content strategy</p>
                </div>

                {/* Prompt Cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {CREATOR_PROMPTS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptClick(item.prompt)}
                      className="group text-left rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-white/[0.08]">
                          <item.icon className="h-4 w-4 text-white/70" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-white mb-1">{item.title}</h3>
                          <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{item.prompt}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user" 
                        ? "bg-white text-black" 
                        : "bg-white/[0.04] border border-white/[0.06]"
                    }`}>
                      {msg.role === "user" ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed">{formatMessage(msg.content)}</div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                        <span className="text-sm text-white/40">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/[0.06] bg-[#0A0A0A]/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
            <div className="flex items-stretch gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything..."
                  disabled={loading}
                  className="w-full bg-white/[0.04] text-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-white/[0.12] disabled:opacity-50 border border-white/[0.06] placeholder:text-white/30 text-base max-h-40"
                  rows={1}
                  style={{ minHeight: '48px', height: `${textareaHeight}px` }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = '48px';
                    const newHeight = Math.min(target.scrollHeight, 160);
                    target.style.height = newHeight + 'px';
                    setTextareaHeight(newHeight);
                  }}
                />
              </div>
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed w-12 h-12 rounded-xl p-0 shrink-0 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
              </Button>
            </div>
            <p className="text-xs text-white/20 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
