"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Conversation {
  id: string;
  firstMessage: string;
  messageCount: number;
  lastUpdated: Date;
}

export default function ChatHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { collapsed } = useSidebar();
  const router = useRouter();
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/sign-in?redirect=/chat/history");
      return;
    }

    if (user) {
      loadConversations();
    }
  }, [user, authLoading]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const grouped = data?.reduce((acc: any, msg: any) => {
        const convId = msg.conversation_id;
        if (!acc[convId]) {
          acc[convId] = {
            id: convId,
            firstMessage: msg.message,
            messageCount: 0,
            lastUpdated: new Date(msg.created_at),
          };
        }
        acc[convId].messageCount++;
        return acc;
      }, {});

      setConversations(Object.values(grouped || {}));
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", conversationId);
      setConversations(conversations.filter((c) => c.id !== conversationId));
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  if (authLoading || loading) {
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
        } p-4 md:p-8`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Chat History</h1>
            <p className="text-gray-400">View and manage your past conversations</p>
          </div>

          {conversations.length === 0 ? (
            <Card className="bg-white/5 border-white/10 p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No conversations yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv, idx) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => router.push(`/chat?conversation=${conv.id}`)}
                        className="flex-1 text-left"
                      >
                        <p className="text-white font-medium truncate mb-1">
                          {conv.firstMessage}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{conv.messageCount} messages</span>
                          <span>•</span>
                          <span>{conv.lastUpdated.toLocaleDateString()}</span>
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteConversation(conv.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
