"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import {
  Brain,
  CalendarDays,
  FileText,
  Flame,
  History,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  MessageCircle,
  MessageSquareText,
  Mic2,
  PanelLeftClose,
  PanelLeft,
  PenLine,
  Plus,
  Repeat2,
  Settings,
  Sparkles,
  Wand2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Create",
    items: [
      { name: "Summarizer", href: "/summarizer", icon: FileText },
      { name: "Remix Studio", href: "/remix", icon: Zap },
      { name: "Comment Generator", href: "/comments", icon: MessageSquareText },
      { name: "Repurpose", href: "/repurpose", icon: Wand2 },
    ],
  },
  {
    label: "Assistant",
    items: [
      { name: "Chat", href: "/chat", icon: MessageCircle },
      { name: "Brand Voice", href: "/brand-voice", icon: Mic2 },
      { name: "AI Memory", href: "/ai-memory", icon: Brain },
    ],
  },
  {
    label: "Library",
    items: [
      { name: "History", href: "/history", icon: History },
      { name: "Templates", href: "/templates", icon: LayoutTemplate },
      { name: "Queue", href: "/queue", icon: ListChecks },
    ],
  },
  {
    label: "Toolkit",
    items: [
      { name: "Angle Finder", href: "/toolkit/angle-finder", icon: Sparkles },
      { name: "Bio Builder", href: "/toolkit/bio-builder", icon: PenLine },
      { name: "Hook Generator", href: "/toolkit/hook-generator", icon: Flame },
      { name: "Repurposer", href: "/toolkit/repurposer", icon: Repeat2 },
    ],
  },
];



function isItemActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.name : undefined}
      className={cn(
        "group flex items-center rounded-lg border text-[13px] font-medium no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
        collapsed ? "mx-auto h-10 w-10 justify-center" : "h-10 gap-3 px-3",
        active
          ? "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_2px_rgba(23,20,18,0.04)]"
          : "border-transparent text-[var(--ink-2)] hover:border-[var(--sidebar-b)] hover:bg-[var(--surface-2)]/70 hover:text-[var(--ink)]"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active
            ? "text-[var(--brand)]"
            : "text-[var(--ink-3)] group-hover:text-[var(--ink-2)]"
        )}
        strokeWidth={active ? 2.1 : 1.8}
        aria-hidden
      />
      {!collapsed ? (
        <span className={cn("truncate leading-5", active && "font-semibold")}>
          {item.name}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  pathname,
  onNavigate,
  onToggleCollapse,
  showCollapse,
  showClose,
  onClose,
}: {
  collapsed: boolean;
  pathname: string | null;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  showCollapse?: boolean;
  showClose?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "flex h-[60px] shrink-0 items-center border-b border-[var(--sidebar-b)]",
          collapsed ? "justify-center px-3" : "justify-between px-4"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5 no-underline"
          aria-label="Clario dashboard"
        >
          <img
            src="/favicon.svg"
            alt=""
            width={26}
            height={26}
            className="h-[26px] w-[26px] shrink-0 rounded-md"
          />
          {!collapsed ? (
            <span className="block font-serif text-[18px] font-medium leading-none tracking-[-0.02em] text-[var(--ink)]">
              Clario
            </span>
          ) : null}
        </Link>

        {showClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--ink-3)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)] md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="app-sidebar-nav min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-4">
        <div className="mb-4">
          <Link
            href="/summarizer"
            onClick={onNavigate}
            title={collapsed ? "New summary" : undefined}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[var(--brand-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
              collapsed ? "mx-auto h-10 w-10" : "h-10 w-full px-3"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            {!collapsed ? <span>New summary</span> : null}
          </Link>
        </div>
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex > 0 ? "mt-5" : undefined}>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.04em] text-[var(--ink-2)]">
                {group.label}
              </p>
            ) : groupIndex > 0 ? (
              <div
                className="mx-auto mb-3 h-px w-6 rounded-full bg-[var(--sidebar-b)]"
                aria-hidden
              />
            ) : null}

            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isItemActive(pathname, item.href)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[var(--sidebar-b)] p-3">
        <NavLink
          item={{ name: "Settings", href: "/settings", icon: Settings }}
          active={isItemActive(pathname, "/settings")}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

        {showCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "mt-1 flex items-center rounded-lg border border-transparent text-[13px] font-medium text-[var(--ink-3)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
              collapsed
                ? "mx-auto h-10 w-10 justify-center"
                : "h-10 w-full gap-3 px-3"
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
            ) : (
              <PanelLeftClose className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
            )}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
        ) : null}
      </div>
    </>
  );
}

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[60] bg-[rgba(23,20,18,0.45)] md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}
      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex w-[280px] flex-col border-r border-[var(--sidebar-b)] bg-[var(--sidebar)] transition-transform duration-200 ease-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          collapsed={false}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
          showClose
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-[var(--sidebar-b)] bg-[var(--sidebar)] transition-[width] duration-200 ease-out md:flex",
          collapsed ? "md:w-[76px]" : "md:w-[264px]"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          showCollapse
        />
      </aside>
    </>
  );
}
