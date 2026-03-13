"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppNavbar } from "@/components/layout/app-navbar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Sparkles, Youtube, Lightbulb, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CREATOR_PROMPTS = [
  {
    icon: Youtube,
    title: "Analyze this video",
    prompt: "I just watched a YouTube video about [topic]. Help me identify: 1) The main hook, 2) Content structure, 3) What made it engaging, 4) How I can apply this to my content",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: Lightbulb,
    title: "Content ideas",
    prompt: "I create content about [your niche]. Give me 10 viral content ideas based on current trends. Format: Title + Hook + Why it works",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: TrendingUp,
    title: "Improve my hook",
    prompt: "Here's my video/post hook: [paste your hook]. Make it 10x more attention-grabbing. Give me 5 variations.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Target,
    title: "Repurpose strategy",
    prompt: "I have this piece of content: [paste content]. Show me how to repurpose it into: 1) Twitter thread, 2) LinkedIn post, 3) Email newsletter, 4) Instagram carousel",
    color: "from-purple-500 to-pink-500"
  },
];

const formatMessage = (text: string) => {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
    
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const formatted = parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : part);
    
    if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1">{line.replace('- ', '• ')}</li>;
    if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 mb-1">{line}</li>;
    if (line.trim() === '') return <br key={i} />;
    
    return <p key={i} className="mb-2">{formatted}</p>;
  });
};

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
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
    <div className="min-h-screen bg-[#0A0A0A]">
      <AppNavbar />
      <main className="pt-16 flex flex-col h-screen">
        <div className="border-b border-white/[0.08] p-4 sm:p-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <Sparkles className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-[15px] sm:text-[17px] font-semibold text-white tracking-tight">AI Chat</h1>
              <p className="text-[12px] sm:text-[13px] text-white/40">Content strategy & ideas</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6 sm:mb-10 mt-4 sm:mt-8">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-blue-500/10 mx-auto mb-3 sm:mb-4">
                  <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-1.5 sm:mb-2 tracking-tight">How can I help?</h2>
                <p className="text-[13px] sm:text-[14px] text-white/40">Choose a prompt or ask anything</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                {CREATOR_PROMPTS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handlePromptClick(item.prompt)}
                    className="text-left rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-5 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.12] group"
                  >
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-500/10 mb-2 sm:mb-3 group-hover:bg-blue-500/15 transition-colors">
                      <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                    </div>
                    <h3 className="text-[13px] sm:text-[14px] font-medium text-white mb-1 sm:mb-1.5">{item.title}</h3>
                    <p className="text-[11px] sm:text-[12px] text-white/40 leading-relaxed line-clamp-2">{item.prompt}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-lg sm:rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 sm:p-5">
                <h3 className="text-[13px] sm:text-[14px] font-medium text-white mb-2 sm:mb-3">Tips</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[12px] sm:text-[13px] text-white/50">
                    <span className="text-white/30 mt-0.5">•</span>
                    <span>Paste YouTube transcripts and ask for content ideas</span>
                  </li>
                  <li className="flex items-start gap-2 text-[12px] sm:text-[13px] text-white/50">
                    <span className="text-white/30 mt-0.5">•</span>
                    <span>Share your draft and get feedback on hooks</span>
                  </li>
                  <li className="flex items-start gap-2 text-[12px] sm:text-[13px] text-white/50">
                    <span className="text-white/30 mt-0.5">•</span>
                    <span>Ask for repurposing strategies</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} max-w-3xl mx-auto w-full`}>
              <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-lg sm:rounded-xl p-3 sm:p-4 ${
                msg.role === "user" 
                  ? "bg-white text-black" 
                  : "bg-white/[0.04] text-white/90 border border-white/[0.08]"
              }`}>
                {msg.role === "user" ? (
                  <p className="text-[13px] sm:text-[14px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="text-[13px] sm:text-[14px] leading-relaxed">{formatMessage(msg.content)}</div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start max-w-3xl mx-auto w-full">
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-white/40" />
                  <span className="text-[12px] sm:text-[13px] text-white/40">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-white/[0.08] p-3 sm:p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-1.5 sm:gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about content strategy, ideas, hooks..."
                disabled={loading}
                className="flex-1 bg-white/[0.04] text-white rounded-lg p-2.5 sm:p-3 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 border border-white/[0.08] placeholder:text-white/30 text-[13px] sm:text-[14px]"
                rows={1}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="bg-white text-black hover:bg-white/90 h-9 w-9 sm:h-10 sm:w-10 rounded-lg p-0 flex-shrink-0"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </Button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-white/20 mt-1.5 sm:mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
