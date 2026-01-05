"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, Copy, RefreshCw, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { checkUsageLimit } from "@/lib/usage-limits";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { collapsed } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "pro" | "premium">("free");
  const [chatUsage, setChatUsage] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in?redirect=/chat");
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadUserData = async () => {
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("subscription_tier")
        .eq("id", user?.id)
        .single();

      const tier = (userData?.subscription_tier || "free") as
        | "free"
        | "pro"
        | "premium";
      setUserTier(tier);

      // Get current month usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usageData } = await supabase
        .from("usage_stats")
        .select("chats_count")
        .eq("user_id", user?.id)
        .like("date", `${currentMonth}%`)
        .single();

      setChatUsage(usageData?.chats_count || 0);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Check usage limits
    const usageCheck = checkUsageLimit(userTier, "chats", chatUsage);
    if (!usageCheck.allowed) {
      toast({
        variant: "destructive",
        title: "Usage limit reached",
        description: `You've reached your ${userTier} tier limit. Please upgrade to continue.`,
      });
      router.push("/pricing");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I could not generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setChatUsage((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#4169E1]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <AppSidebar />
      <MobileMenuButton />
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-0 md:ml-[80px]" : "ml-0 md:ml-[256px]"
        } flex flex-col h-screen`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4169E1]/10 via-purple-500/5 to-pink-500/5 border-b border-[#4169E1]/20 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                AI Chat
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Powered by Clario Engine
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="px-2 md:px-3 py-1 bg-green-500/20 text-green-400 text-[10px] md:text-xs font-medium rounded-full border border-green-500/30">
                ⚡ Online
              </div>
              <div className="text-[10px] md:text-xs text-gray-400">
                {chatUsage} /{" "}
                {checkUsageLimit(userTier, "chats", chatUsage).limit ===
                Infinity
                  ? "∞"
                  : checkUsageLimit(userTier, "chats", chatUsage).limit}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 bg-gradient-to-b from-transparent to-gray-900/20">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#4169E1]/10 to-purple-500/10 border border-[#4169E1]/20">
                  <div className="relative mb-4 md:mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#4169E1] to-[#6B8EFF] rounded-full flex items-center justify-center mx-auto">
                      <Bot className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                    Ready to Chat!
                  </h3>
                  <p className="text-sm md:text-base text-gray-400 mb-4">
                    Ask me anything - I'm here to help with your questions.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Explain a concept",
                      "Write code",
                      "Brainstorm ideas",
                      "Solve problems",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="px-2 md:px-3 py-1 text-[10px] md:text-xs bg-white/10 text-gray-300 rounded-full hover:bg-white/20 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 md:gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="relative">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-[#4169E1]/30">
                      <AvatarFallback className="bg-gradient-to-br from-[#4169E1] to-[#6B8EFF] text-white">
                        <Bot className="h-4 w-4 md:h-5 md:w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-black" />
                  </div>
                )}
                <Card
                  className={`max-w-[85%] md:max-w-[75%] transition-all duration-200 hover:shadow-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#4169E1]/20 to-[#6B8EFF]/10 border-[#4169E1]/30"
                      : "bg-gradient-to-br from-white/5 to-white/10 border-white/10"
                  }`}
                >
                  <CardContent className="p-3 md:p-4">
                    {message.role === "assistant" ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <p className="text-white whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {message.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 border-t border-white/10">
                      <span className="text-[10px] md:text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 md:h-7 md:w-7 p-0 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-gray-600/30">
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
                      <User className="h-4 w-4 md:h-5 md:w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 justify-start"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#4169E1] text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[#4169E1]" />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-gradient-to-r from-black/50 via-gray-900/50 to-black/50 border-t border-white/10 p-3 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 md:gap-4 items-stretch">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="bg-white/5 border-white/20 text-white resize-none rounded-xl focus:ring-2 focus:ring-[#4169E1]/50 focus:border-[#4169E1]/50 transition-all text-sm min-h-[42px] max-h-[42px] py-2.5"
                  rows={1}
                  disabled={loading}
                />
                <div className="absolute bottom-2 right-2 text-[10px] text-gray-500">
                  {input.length}/2000
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-[#4169E1] to-[#6B8EFF] hover:from-[#4169E1]/90 hover:to-[#6B8EFF]/90 text-white border-0 w-[42px] rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0 p-0 self-stretch"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 md:mt-3 text-[10px] md:text-xs text-gray-400">
              <span className="hidden sm:inline">
                Press Shift + Enter for new line
              </span>
              <span
                className={`px-2 py-1 rounded-full ${
                  chatUsage >=
                    checkUsageLimit(userTier, "chats", chatUsage).limit &&
                  checkUsageLimit(userTier, "chats", chatUsage).limit !==
                    Infinity
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {chatUsage} /{" "}
                {checkUsageLimit(userTier, "chats", chatUsage).limit ===
                Infinity
                  ? "∞"
                  : checkUsageLimit(userTier, "chats", chatUsage).limit}{" "}
                messages
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
