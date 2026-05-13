"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Mic,
  Zap,
  X,
  Calendar,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Summarizer", href: "/summarizer", icon: FileText },
  { name: "Remix Studio", href: "/remix", icon: Zap },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Brand Voice", href: "/brand-voice", icon: Mic },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const supabase = createClient();
  const [tier, setTier] = useState<"free" | "pro" | "enterprise">("free");

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const t = data?.subscription_tier;
        if (t === "pro" || t === "enterprise" || t === "free") setTier(t);
      });
  }, [user?.id, supabase]);

  const isPro = tier === "pro" || tier === "enterprise";

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? "80px" : "256px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-[#0A0A0A] border-r border-white/[0.08] flex flex-col overflow-hidden transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] w-full">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5"
              >
                <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-black" />
                </div>
                <span className="text-white font-semibold text-[15px] tracking-tight">
                  Clario
                </span>
              </motion.div>
            )}
            {collapsed && (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center w-full"
              >
                <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-black" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="app-sidebar-nav flex-1 p-3 overflow-y-auto space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname?.startsWith(item.href + "/"));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="block"
                onClick={closeMobile}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[13px] font-medium truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.08] space-y-1">
          {!isPro && !collapsed && (
            <Link
              href="/pricing"
              onClick={closeMobile}
              className="mb-2 block rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2.5 text-center text-[13px] font-semibold text-white shadow-sm hover:opacity-95"
            >
              Upgrade to Pro
            </Link>
          )}

          <Link href="/settings" onClick={closeMobile}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                pathname === "/settings" ||
                  pathname?.startsWith("/settings/")
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]",
              )}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[13px] font-medium"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg font-normal"
            onClick={async () => {
              await signOut();
              router.push("/sign-in");
            }}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-[13px] font-medium"
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-white/40 hover:text-white hover:bg-white/[0.04] border border-white/[0.08] transition-all duration-150 rounded-lg h-9"
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </motion.div>
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
