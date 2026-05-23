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
  PanelLeftClose,
  PanelLeft,
  Mic,
  Zap,
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
        style={{
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-b)",
        }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen flex flex-col overflow-hidden transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-6 py-5 w-full"
          style={{ borderBottom: "1px solid var(--sidebar-b)" }}
        >
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
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: "hsl(var(--accent))" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span
                  className="font-semibold text-[15px] tracking-tight"
                  style={{ color: "var(--text)" }}
                >
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
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: "hsl(var(--accent))" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
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
                  className={`flex items-center gap-3 py-2 rounded-lg transition-all duration-150 ${collapsed ? "justify-center px-0" : "px-3"}`}
                  style={{
                    background: isActive ? "var(--accent-l)" : "transparent",
                    color: isActive ? "hsl(var(--accent))" : "var(--text3)",
                    border: isActive
                      ? "1px solid var(--accent-m)"
                      : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "var(--bg3)";
                      (e.currentTarget as HTMLDivElement).style.color =
                        "var(--text2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLDivElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLDivElement).style.color =
                        "var(--text3)";
                    }
                  }}
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

        {/* Bottom */}
        <div
          className="p-3 space-y-1"
          style={{ borderTop: "1px solid var(--sidebar-b)" }}
        >
          {!isPro && !collapsed && (
            <Link
              href="/pricing"
              onClick={closeMobile}
              className="mb-2 block rounded-lg px-3 py-2.5 text-center text-[13px] font-semibold text-white shadow-sm hover:opacity-95"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--accent)), #f59e0b)",
              }}
            >
              Upgrade to Pro
            </Link>
          )}

          <Link href="/settings" onClick={closeMobile}>
            <div
              className={`flex items-center gap-3 py-2 rounded-lg transition-all duration-150 ${collapsed ? "justify-center px-0" : "px-3"}`}
              style={{
                background:
                  pathname === "/settings" ||
                  pathname?.startsWith("/settings/")
                    ? "var(--accent-l)"
                    : "transparent",
                color:
                  pathname === "/settings" ||
                  pathname?.startsWith("/settings/")
                    ? "hsl(var(--accent))"
                    : "var(--text3)",
              }}
              onMouseEnter={(e) => {
                const isSettingsActive =
                  pathname === "/settings" ||
                  pathname?.startsWith("/settings/");
                if (!isSettingsActive) {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "var(--bg3)";
                  (e.currentTarget as HTMLDivElement).style.color =
                    "var(--text2)";
                }
              }}
              onMouseLeave={(e) => {
                const isSettingsActive =
                  pathname === "/settings" ||
                  pathname?.startsWith("/settings/");
                if (!isSettingsActive) {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLDivElement).style.color =
                    "var(--text3)";
                }
              }}
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

          <button
            className={`block w-full flex items-center gap-3 py-2 rounded-lg transition-all duration-150 ${collapsed ? "justify-center px-0" : "px-3"}`}
            style={{ color: "var(--text3)", background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--bg3)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)";
            }}
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
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center rounded-lg h-9 transition-all duration-150 text-[13px] ${collapsed ? "justify-center px-0" : "gap-3 px-3"}`}
            style={{
              color: "var(--text3)",
              background: "transparent",
              border: "1px solid var(--sidebar-b)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--bg3)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)";
            }}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
