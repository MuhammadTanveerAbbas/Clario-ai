"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
  LogOut,
  X,
  Mic,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Summarizer", href: "/summarizer", icon: FileText },
  { name: "Remix Studio", href: "/remix", icon: Zap },
  { name: "Brand Voice", href: "/brand-voice", icon: Mic },
];

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();

  const userInitials =
    user?.user_metadata?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? "80px" : "256px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="fixed left-0 top-0 z-50 h-screen bg-[#0A0A0A] border-r border-white/[0.08] flex flex-col md:!translate-x-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="md:hidden absolute right-2 top-2 text-white/40 hover:text-white hover:bg-white/[0.04] z-10"
          >
            <X className="h-4 w-4" />
          </Button>
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

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block"
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between flex-1 min-w-0"
                      >
                        <span className="text-[13px] font-medium truncate">
                          {item.name}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/[0.08] space-y-1">
          {/* Upgrade */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2"
              >
                <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] transition-all duration-150">
                    <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                      <CreditCard className="h-3.5 w-3.5 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-white block">
                        Upgrade
                      </span>
                      <div className="text-[11px] text-white/40">Get more requests</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings */}
          <Link href="/settings" onClick={() => setMobileOpen(false)}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150",
                pathname === "/settings"
                  ? "bg-white/[0.08] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
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

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full text-white/40 hover:text-white hover:bg-white/[0.04] border border-white/[0.08] transition-all duration-150 rounded-lg h-9"
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
