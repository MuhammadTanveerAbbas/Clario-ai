"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const formatMessage = (text: string) => {
  return text
    .split('\n')
    .map((line, i) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
      }
      
      // Bold text
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const formatted = parts.map((part, j) => 
        j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : part
      );
      
      // Lists
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 mb-1">{line.replace('- ', '• ')}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 mb-1">{line}</li>;
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <br key={i} />;
      }
      
      return <p key={i} className="mb-2">{formatted}</p>;
    });
};

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { collapsed } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();
  const endRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/sign-in");
  }, [user, authLoading]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, conversationHistory: messages.slice(-10) }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      <AppSidebar />
      <MobileMenuButton />
      <main className={`flex-1 transition-all ${collapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"} flex flex-col h-screen`}>
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Chat</h1>
              <p className="text-xs text-gray-400">Powered by Clario</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Start a Conversation</h3>
                <p className="text-gray-400 text-sm">Type your message below</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${
                msg.role === "user" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
                  : "bg-gray-900 text-gray-100 border border-gray-800"
              }`}>
                {msg.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="text-sm leading-relaxed">{formatMessage(msg.content)}</div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="bg-gray-900 border-t border-gray-800 p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 bg-gray-800 text-white rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-12 w-12 rounded-xl p-0"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
