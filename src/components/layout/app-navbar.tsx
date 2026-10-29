"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Zap,
  Mic,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const PAGE_META: Record<string, { label: string; icon: typeof LayoutDashboard }> = {
  "/dashboard":   { label: "Dashboard",    icon: LayoutDashboard },
  "/summarizer":  { label: "Summarizer",   icon: FileText },
  "/remix":       { label: "Remix Studio", icon: Zap },
  "/chat":        { label: "AI Chat",      icon: MessageSquare },
  "/brand-voice": { label: "Brand Voice",  icon: Mic },
  "/calendar":    { label: "Calendar",     icon: Calendar },
  "/settings":    { label: "Settings",     icon: Settings },
};

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  };

  const userInitials =
    user?.user_metadata?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || user?.email?.charAt(0).toUpperCase() || "U";

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const currentPage = Object.entries(PAGE_META).find(([href]) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href)
  );
  const PageIcon = currentPage?.[1].icon;
  const pageLabel = currentPage?.[1].label ?? "";

  return (
    <div
      className="sticky top-0 z-40 flex h-[52px] items-center gap-3 px-4 sm:px-5"
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid hsl(var(--border))",
      }}
    >


      {/* Page title — on mobile show brand logo+name; on md+ show page name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Mobile brand */}
        <div className="flex items-center gap-1.5 md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="Clario" width={20} height={20} className="shrink-0" />
          <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Clario
          </span>
        </div>
        {/* Desktop page label */}
        <div className="hidden md:flex items-center gap-2">
          {PageIcon && <PageIcon size={15} style={{ color: "hsl(var(--accent))", flexShrink: 0 }} />}
          <span className="text-[14px] font-semibold truncate" style={{ color: "var(--text)" }}>
            {pageLabel}
          </span>
        </div>
      </div>

      {/* Right: pfp dropdown only */}
      <div className="flex items-center gap-2">
        {/* Profile picture + dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              "flex items-center gap-1.5 h-8 px-1.5 rounded-xl transition-colors hover:bg-[var(--bg3)]",
              userMenuOpen && "bg-[var(--bg3)]"
            )}
            aria-label="Account menu"
            aria-expanded={userMenuOpen}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={userAvatar} alt="User avatar" />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-400 text-white text-[11px] font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <motion.svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              animate={{ rotate: userMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
              style={{ color: "var(--text3)" }}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, x: 8, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: "var(--sidebar)",
                    border: "1px solid var(--sidebar-b)",
                    boxShadow: "var(--shadow-medium)",
                  }}
                >
                  {/* User info */}
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: "1px solid var(--sidebar-b)" }}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={userAvatar} alt="User avatar" />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-400 text-white text-[11px] font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text)" }}>
                        {user?.user_metadata?.name || "User"}
                      </p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text3)" }}>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium rounded-xl transition-colors hover:bg-[var(--bg3)] no-underline"
                      style={{ color: "var(--text2)" }}
                    >
                      <Settings size={14} style={{ color: "var(--text3)" }} />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
