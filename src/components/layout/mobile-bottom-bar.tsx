"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Summarize", href: "/summarizer", icon: FileText },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Remix", href: "/remix", icon: Zap },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
];

export function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-[64px] items-stretch border-t border-[var(--line)] bg-[var(--surface)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(`${item.href}/`));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium no-underline transition-colors",
              isActive
                ? "text-[var(--brand)]"
                : "text-[var(--ink-3)] hover:text-[var(--ink-2)]"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive ? (
              <span
                className="absolute inset-x-5 top-0 h-[2px] rounded-b-full bg-[var(--brand)]"
                aria-hidden
              />
            ) : null}
            <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2 : 1.8} />
            <span className="leading-none">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
