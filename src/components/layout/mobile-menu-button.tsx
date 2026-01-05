"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";

export function MobileMenuButton() {
  const { setMobileOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileOpen(true)}
      className="md:hidden fixed top-4 right-4 z-30 h-10 w-10 bg-gradient-to-br from-[#4169E1] to-[#6B8EFF] hover:from-[#6B8EFF] hover:to-[#4169E1] backdrop-blur-sm border border-white/20 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 rounded-xl"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
