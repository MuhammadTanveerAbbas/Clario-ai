"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Icon3D_Dashboard,
  Icon3D_Summarizer,
  Icon3D_Chat,
  Icon3D_Remix,
  Icon3D_BrandVoice,
  Icon3D_Calendar,
} from "./nav-icons";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard",   Icon3D: Icon3D_Dashboard },
  { name: "Summarizer", href: "/summarizer", Icon3D: Icon3D_Summarizer },
  { name: "Chat",       href: "/chat",        Icon3D: Icon3D_Chat },
  { name: "Remix",      href: "/remix",       Icon3D: Icon3D_Remix },
  { name: "Brand",      href: "/brand-voice", Icon3D: Icon3D_BrandVoice },
];

export function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-[60px] items-stretch"
      style={{
        background: "var(--sidebar)",
        borderTop: "1px solid var(--sidebar-b)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors no-underline select-none",
              isActive ? "text-[hsl(var(--accent))]" : "text-[var(--text3)]"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active indicator line at top */}
            {isActive && (
              <motion.div
                layoutId="mobile-active"
                className="absolute inset-x-3 top-0 h-[2px] rounded-b-full"
                style={{ background: "hsl(var(--accent))" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              />
            )}

            {/* 3D icon */}
            <span
              className={cn(
                "flex items-center justify-center rounded-xl px-3 py-1 transition-all duration-200",
                isActive ? "bg-[hsl(var(--accent)/0.1)] scale-110" : ""
              )}
              style={isActive ? { filter: "drop-shadow(0 2px 8px rgba(249,115,22,0.4))" } : undefined}
            >
              <item.Icon3D p="mb" />
            </span>

            {/* Label */}
            <span className="leading-none tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
