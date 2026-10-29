"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/contexts/SidebarContext";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Icon3D_Dashboard,
  Icon3D_Summarizer,
  Icon3D_Remix,
  Icon3D_Chat,
  Icon3D_BrandVoice,
  Icon3D_Calendar,
} from "./nav-icons";

const navigationGroups = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", Icon3D: Icon3D_Dashboard },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Summarizer",   href: "/summarizer",  Icon3D: Icon3D_Summarizer },
      { name: "Remix Studio", href: "/remix",        Icon3D: Icon3D_Remix },
      { name: "Chat",         href: "/chat",         Icon3D: Icon3D_Chat },
      { name: "Brand Voice",  href: "/brand-voice",  Icon3D: Icon3D_BrandVoice },
    ],
  },
  {
    label: "Scheduling",
    items: [
      { name: "Calendar", href: "/calendar", Icon3D: Icon3D_Calendar },
    ],
  },
];

function SidebarNavItem({
  href,
  Icon3D,
  label,
  isActive,
  collapsed,
  onClick,
}: {
  href: string;
  Icon3D: (props: { p?: string }) => JSX.Element;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={href} className="block group" onClick={onClick}>
      <div
        className={cn(
          "relative flex items-center rounded-xl py-2 text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
          collapsed ? "justify-center w-full px-0" : "gap-3 px-3",
          isActive
            ? "text-white"
            : "text-[var(--text3)] hover:text-[var(--text2)] hover:bg-white/[0.05]"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(135deg, hsl(var(--accent) / 0.18), hsl(var(--accent) / 0.08))",
              border: "1px solid hsl(var(--accent) / 0.2)",
              zIndex: 0,
            }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
          />
        )}
        {/* 3D icon */}
        <span
          className={cn(
            "relative z-10 flex items-center justify-center h-8 w-8 shrink-0 rounded-xl transition-all duration-200",
            isActive ? "scale-[1.08]" : "group-hover:scale-105"
          )}
          style={
            isActive
              ? { filter: "drop-shadow(0 2px 8px rgba(249,115,22,0.5))" }
              : undefined
          }
        >
          <Icon3D />
        </span>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "truncate relative z-10 leading-none",
                isActive
                  ? "text-[var(--text)] font-semibold"
                  : "text-[var(--text3)]"
              )}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>


      </div>
    </Link>
  );
}

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? "72px" : "240px" }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen flex flex-col overflow-hidden transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-b)",
        }}
      >
        {/* Logo */}
        <div className="flex h-[60px] shrink-0 items-center px-4 border-b border-[var(--sidebar-b)]">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "hsl(var(--accent))" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "hsl(var(--accent))" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--text)" }}>
                  Clario
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav — grouped */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3 app-sidebar-nav">
          {navigationGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-4" : ""}>
              {/* Group label — hidden when collapsed */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] select-none"
                    style={{ color: "var(--text3)", opacity: 0.45 }}
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Collapsed: thin separator between groups */}
              {collapsed && gi > 0 && (
                <div className="mx-auto mb-3 h-px w-8 rounded-full" style={{ background: "var(--sidebar-b)" }} />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));
                  return (
                    <SidebarNavItem
                      key={item.name}
                      href={item.href}
                      Icon3D={item.Icon3D}
                      label={item.name}
                      isActive={isActive}
                      collapsed={collapsed}
                      onClick={closeMobile}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer — collapse toggle */}
        <div className="shrink-0 border-t border-[var(--sidebar-b)] px-3 pb-4 pt-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center rounded-xl py-2 text-[13px] font-medium transition-all duration-150 text-[var(--text3)] hover:text-[var(--text2)] hover:bg-white/[0.05]",
              collapsed ? "justify-center w-full px-0" : "gap-3 px-3 w-full"
            )}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
