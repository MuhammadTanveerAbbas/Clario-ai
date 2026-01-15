"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Trash2, ArrowDown, Sparkles, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { checkUsageLimit } from "@/lib/usage-limits";
import { ChatMessage } from "@/components/chat-message";
import { TypingIndicator } from "@/components/typing-indicator";
import { AutoExpandTextarea } from "@/components/auto-expand-textarea";
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
  const [loading, setLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "pro" | "premium">("free");
  const [chatUsage, setChatUsage] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [allHistory, setAllHistory] = useState<Message[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in?redirect=/chat");
      return;
    }

    if (user) {
      loadUserData();
      loadChatHistory();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/chat/history");
      if (response.ok) {
        const data = await response.json();
        const historyMessages = data.messages.map(
          (msg: any, index: number) => ({
            id: msg.id || `history-${index}-${Date.now()}`,
            role: msg.message ? "user" : "assistant",
            content: msg.message || msg.response,
            timestamp: new Date(msg.created_at),
          })
        );
        setAllHistory(historyMessages);
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const response = await fetch("/api/chat/history", { method: "DELETE" });
      if (response.ok) {
        setMessages([]);
        setShowClearDialog(false);
        toast({
          title: "History Cleared",
          description: "All chat messages have been deleted.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear history.",
      });
    }
  };

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
      id: `user-${Date.now()}-${Math.random()}`,
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
        id: `assistant-${Date.now()}-${Math.random()}`,
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
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#4169E1]/10 via-purple-500/5 to-pink-500/5 border-b border-[#4169E1]/20 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4169E1] to-[#6B8EFF] rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-white">
                    AI Chat
                  </h1>
                  <p className="text-xs text-gray-400">
                    Powered by Clario Engine
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  disabled={allHistory.length === 0}
                  className="border-white/20 text-white hover:bg-white/10 h-10"
                >
                  <History className="h-4 w-4 mr-1" />
                  History ({allHistory.filter(m => m.role === 'user').length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearDialog(true)}
                  disabled={messages.length === 0}
                  className="border-white/20 text-white hover:bg-white/10 h-10 w-10 p-0"
                >
                  <Trash2 className="h-5 w-5 text-red-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-transparent to-gray-900/20"
        >
          <div className="max-w-[1400px] mx-auto">
            {messages.length === 0 && !loading && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#4169E1] to-[#6B8EFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Start a Conversation
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Type your message below to begin
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChatMessage message={message} onCopy={handleCopy} />
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* History Panel */}
          {showHistory && allHistory.length > 0 && (
            <div className="absolute top-16 right-4 w-80 max-h-96 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Chat History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              <div className="overflow-y-auto max-h-80 p-2">
                {allHistory.filter(m => m.role === 'user').map((msg, idx) => (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setMessages(allHistory.slice(0, allHistory.indexOf(msg) + 2));
                      setShowHistory(false);
                    }}
                    className="w-full text-left p-3 mb-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                  >
                    <p className="text-xs text-gray-400 mb-1">
                      {msg.timestamp.toLocaleDateString()} {msg.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-white truncate">{msg.content}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10"
            >
              <Button
                onClick={scrollToBottom}
                className="bg-[#4169E1] hover:bg-[#4169E1]/90 text-white rounded-full shadow-lg"
                size="sm"
              >
                <ArrowDown className="h-4 w-4 mr-1" />
                New messages
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-black via-gray-900/95 to-transparent border-t border-white/10 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <AutoExpandTextarea
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
                  maxRows={5}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-[#4169E1] to-[#6B8EFF] hover:from-[#4169E1]/90 hover:to-[#6B8EFF]/90 text-white h-14 w-14 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0 p-0"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Send className="h-6 w-6" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="hidden sm:inline">
                Press Enter to send, Shift + Enter for new line
              </span>
              <span className="sm:hidden">Enter to send</span>
              <span
                className={
                  chatUsage >= (userTier === "free" ? 100 : 1000)
                    ? "text-red-400"
                    : "text-gray-400"
                }
              >
                {chatUsage} / {userTier === "free" ? 100 : 1000} used
              </span>
            </div>
          </div>
        </div>

        {/* Clear History Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent className="bg-gray-900 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Clear Chat History?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This will permanently delete all your chat messages. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearHistory}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Clear History
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
