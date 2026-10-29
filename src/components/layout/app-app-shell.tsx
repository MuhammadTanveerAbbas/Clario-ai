"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { cn } from "@/lib/utils";

export function AppAppShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <>
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main content area */}
      <div
        className={cn(
          "min-h-screen w-full transition-[padding] duration-250 ease-smooth",
          collapsed ? "md:pl-[72px]" : "md:pl-[240px]",
          // On mobile: pad bottom so content is never hidden behind the 60px nav bar.
          // On desktop: no bottom padding needed.
          "pb-[72px] md:pb-0"
        )}
      >
        {children}
      </div>

      {/* Mobile bottom nav — only on mobile */}
      <div className="md:hidden">
        <MobileBottomBar />
      </div>
    </>
  );
}
