"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { cn } from "@/lib/utils";

export function AppAppShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  // Dashboard has its own built-in sidebar
  const isDashboard = pathname === "/dashboard";

  if (isDashboard) return <>{children}</>;

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
