"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";

export function MobileMenuButton() {
  const { setMobileOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileOpen(true)}
      className="md:hidden fixed top-1/2 -translate-y-1/2 left-0 z-30 h-12 w-6 bg-gradient-to-r from-[#4169E1]/90 to-[#6B8EFF]/90 hover:from-[#6B8EFF] hover:to-[#4169E1] backdrop-blur-md border-r border-t border-b border-white/20 text-white shadow-lg transition-all duration-200 rounded-r-lg rounded-l-none"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}
