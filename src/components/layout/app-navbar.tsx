"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { TopbarUserMenu } from "@/components/layout/topbar-user-menu";
import {
  Brain,
  CalendarDays,
  FileText,
  Flame,
  History,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  Menu,
  MessageCircle,
  MessageSquareText,
  Mic2,
  PenLine,
  Repeat2,
  Settings,
  Sparkles,
  Wand2,
  Zap,
  type LucideIcon,
} from "lucide-react";

const PAGE_META: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/summarizer", label: "Summarizer", icon: FileText },
  { href: "/remix", label: "Remix Studio", icon: Zap },
  { href: "/comments", label: "Comment Generator", icon: MessageSquareText },
  { href: "/repurpose", label: "Repurpose", icon: Wand2 },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/brand-voice", label: "Brand Voice", icon: Mic2 },
  { href: "/ai-memory", label: "AI Memory", icon: Brain },
  { href: "/history", label: "History", icon: History },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/queue", label: "Queue", icon: ListChecks },
  { href: "/toolkit/angle-finder", label: "Angle Finder", icon: Sparkles },
  { href: "/toolkit/bio-builder", label: "Bio Builder", icon: PenLine },
  { href: "/toolkit/hook-generator", label: "Hook Generator", icon: Flame },
  { href: "/toolkit/repurposer", label: "Repurposer", icon: Repeat2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function findPageMeta(pathname: string | null) {
  if (!pathname) return null;
  return (
    PAGE_META.filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    ).sort((a, b) => b.href.length - a.href.length)[0] ?? null
  );
}

export function AppNavbar() {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebar();
  const page = findPageMeta(pathname);
  const PageIcon = page?.icon;

  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-[var(--line)] bg-[var(--bg)] px-4 sm:px-6">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--ink)] md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="hidden items-center gap-1.5 text-[12px] font-medium text-[var(--ink-3)] sm:flex">
          <img
            src="/favicon.svg"
            alt=""
            width={14}
            height={14}
            className="h-3.5 w-3.5 shrink-0 rounded-[3px]"
          />
          Clario
          <span aria-hidden className="text-[var(--line-strong)]">
            /
          </span>
        </span>
        {PageIcon ? (
          <PageIcon
            className="h-[15px] w-[15px] shrink-0 text-[var(--brand)]"
            strokeWidth={1.8}
          />
        ) : null}
        <span className="truncate text-[13px] font-semibold text-[var(--ink)]">
          {page?.label ?? "Workspace"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <TopbarUserMenu />
      </div>
    </header>
  );
}
