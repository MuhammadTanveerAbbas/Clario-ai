"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { cn } from "@/lib/utils";

export function AppAppShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <AppSidebar />
      <div
        className={cn(
          "min-h-screen w-full transition-[padding] duration-300 ease-in-out",
          collapsed ? "md:pl-20" : "md:pl-64",
        )}
      >
        {children}
      </div>
    </>
  );
}
