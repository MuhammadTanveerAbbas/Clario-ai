"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import {
  AudioWaveform,
  BrainCircuit,
  CalendarDays,
  Compass,
  FileText,
  History,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  ListTodo,
  MessageCircle,
  MessageSquarePlus,
  PanelLeft,
  PanelLeftClose,
  PenLine,
  Plus,
  RefreshCw,
  Repeat2,
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
      { name: "Remix Studio", href: "/remix", icon: Layers },
      { name: "Comment Generator", href: "/comments", icon: MessageSquarePlus },
      { name: "Repurpose", href: "/repurpose", icon: RefreshCw },
    ],
  },
  {
    label: "Assistant",
    items: [
      { name: "Chat", href: "/chat", icon: MessageCircle },
      { name: "Brand Voice", href: "/brand-voice", icon: AudioWaveform },
      { name: "AI Memory", href: "/ai-memory", icon: BrainCircuit },
    ],
  },
  {
    label: "Library",
    items: [
      { name: "History", href: "/history", icon: History },
      { name: "Templates", href: "/templates", icon: LayoutTemplate },
      { name: "Queue", href: "/queue", icon: ListTodo },
    ],
  },
  {
    label: "Toolkit",
    items: [
      { name: "Angle Finder", href: "/toolkit/angle-finder", icon: Compass },
      { name: "Bio Builder", href: "/toolkit/bio-builder", icon: PenLine },
      { name: "Hook Generator", href: "/toolkit/hook-generator", icon: Zap },
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
        "group flex items-center rounded-lg text-[13px] font-medium no-underline transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        collapsed ? "mx-auto h-9 w-9 justify-center" : "h-9 gap-2.5 px-3",
        active
          ? "bg-[var(--surface-2)] text-[var(--ink)]"
          : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]/60 hover:text-[var(--ink)]"
      )}
    >
      <Icon
        className={cn(
          "h-[17px] w-[17px] shrink-0 transition-colors",
          active
            ? "text-[var(--ink)]"
            : "text-[var(--ink-3)] group-hover:text-[var(--ink-2)]"
        )}
        strokeWidth={active ? 2 : 1.75}
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
          className="flex min-w-0 items-center gap-1.5 no-underline"
          aria-label="Clario dashboard"
        >
          <img
            src="/Clario.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 object-contain"
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

      <nav className="app-sidebar-nav min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-3.5">
        <div className="mb-4">
          <Link
            href="/summarizer"
            onClick={onNavigate}
            title={collapsed ? "New summary" : undefined}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg bg-brand-strong text-[13px] font-semibold text-accent-ink no-underline shadow-soft transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
              collapsed ? "mx-auto h-9 w-9" : "h-9 w-full px-3"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            {!collapsed ? <span>New summary</span> : null}
          </Link>
        </div>

        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex > 0 ? "mt-4" : undefined}>
            {!collapsed ? (
              <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]">
                {group.label}
              </p>
            ) : groupIndex > 0 ? (
              <div
                className="mx-auto mb-2.5 h-px w-6 rounded-full bg-[var(--sidebar-b)]"
                aria-hidden
              />
            ) : null}

            <div className="space-y-0.5">
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

      {showCollapse ? (
        <div className="shrink-0 border-t border-[var(--sidebar-b)] p-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center rounded-lg border border-transparent text-[13px] font-medium text-[var(--ink-3)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
              collapsed
                ? "mx-auto h-9 w-9 justify-center"
                : "h-9 w-full gap-2.5 px-2.5"
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
            )}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
        </div>
      ) : null}
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
          className="fixed inset-0 z-[60] bg-overlay md:hidden"
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
          "fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-[var(--sidebar-b)] bg-[var(--sidebar)] duration-200 ease-out md:flex",
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
