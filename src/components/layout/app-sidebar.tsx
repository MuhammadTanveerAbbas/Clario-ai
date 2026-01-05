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
  PenTool,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
  LogOut,
  ClipboardList,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
  { name: "AI Chat", href: "/chat", icon: MessageSquare, badge: "Hot" },
  { name: "Summarizer", href: "/summarizer", icon: FileText, badge: null },
  { name: "Writing", href: "/writing", icon: PenTool, badge: "New" },
  {
    name: "Meeting Notes",
    href: "/meeting-notes",
    icon: ClipboardList,
    badge: "New",
  },
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
        className="fixed left-0 top-0 z-50 h-screen bg-gradient-to-b from-black via-gray-900 to-black backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl md:!translate-x-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:p-6 py-2 md:py-4 border-b border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="md:hidden absolute right-2 top-2 text-gray-400 hover:text-white z-10"
          >
            <X className="h-5 w-5" />
          </Button>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-[#4169E1] via-[#6B8EFF] to-[#8FA5FF] flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                </div>
                <div>
                  <span className="text-white font-bold text-lg md:text-xl tracking-tight">
                    Clario
                  </span>
                  <div className="text-xs text-gray-400 font-medium">
                    AI Productivity
                  </div>
                </div>
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
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4169E1] via-[#6B8EFF] to-[#8FA5FF] flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 md:p-4 md:overflow-hidden overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={index > 0 ? "block mt-4" : "block"}
              >
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-300 group overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-[#4169E1]/30 via-[#6B8EFF]/20 to-[#8FA5FF]/10 text-white border border-[#4169E1]/40 shadow-lg shadow-[#4169E1]/20"
                      : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 border border-transparent hover:border-white/10"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBackground"
                      className="absolute inset-0 bg-gradient-to-r from-[#4169E1]/10 to-transparent"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 md:h-5 md:w-5 flex-shrink-0 transition-all duration-300 relative z-10",
                      isActive
                        ? "text-[#4169E1] drop-shadow-sm"
                        : "group-hover:text-white group-hover:scale-110"
                    )}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between flex-1 min-w-0 relative z-10"
                      >
                        <span className="text-xs md:text-sm font-medium truncate">
                          {item.name}
                        </span>
                        {item.badge && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-2"
                          >
                            <Badge
                              className={cn(
                                "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 font-semibold shadow-sm",
                                item.badge === "Hot"
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-0"
                                  : item.badge === "New"
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#4169E1] via-[#6B8EFF] to-[#8FA5FF] rounded-r-full shadow-lg"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 md:p-4 border-t border-white/10 space-y-2">
          {/* Quick Actions */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mb-3"
              >
                <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500/20 via-orange-500/15 to-red-500/10 border border-yellow-500/30 text-yellow-300 hover:from-yellow-500/30 hover:to-orange-500/20 transition-all duration-300 shadow-lg hover:shadow-yellow-500/20"
                  >
                    <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                    <div>
                      <span className="text-xs md:text-sm font-semibold text-white">
                        Upgrade Plan
                      </span>
                      <div className="text-[10px] md:text-xs text-yellow-300/80">
                        Get more requests
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings */}
          <Link href="/settings" onClick={() => setMobileOpen(false)}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg transition-colors",
                pathname === "/settings"
                  ? "bg-[#4169E1]/20 text-white border border-[#4169E1]/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Settings
                className={cn(
                  "h-4 w-4 md:h-5 md:w-5 flex-shrink-0",
                  pathname === "/settings" && "text-[#4169E1]"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs md:text-sm font-medium"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 rounded-xl shadow-sm hover:shadow-lg"
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
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
