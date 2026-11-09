"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppNavbar } from "@/components/layout/app-navbar";
import { cn } from "@/lib/utils";

export function AppAppShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <AppSidebar />

      <div
        className={cn(
          "min-h-screen w-full transition-[padding] duration-200 ease-out",
          collapsed ? "md:pl-[76px]" : "md:pl-[264px]"
        )}
      >
        <AppNavbar />
        <main id="main" className="min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </div>
    </>
  );
}
