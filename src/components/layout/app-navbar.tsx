"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Zap,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Summarizer", href: "/summarizer", icon: FileText },
  { name: "Remix Studio", href: "/remix", icon: Zap },
  { name: "Brand Voice", href: "/brand-voice", icon: Mic },
];

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const userInitials =
    user?.user_metadata?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.08]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <Image 
                src="/favicon.svg" 
                alt="Clario Logo" 
                width={32} 
                height={32}
                className="group-hover:scale-105 transition-transform"
              />
              <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
                Clario
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 relative",
                        isActive
                          ? "text-white"
                          : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-[#4169E1]/20 rounded-lg border border-[#4169E1]/40"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <Icon className={cn("h-4 w-4 relative z-10", isActive ? "text-[#4169E1]" : "")} />
                      <span className="text-sm font-medium relative z-10">
                        {item.name}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/pricing" className="hidden lg:block">
                <Button
                  size="sm"
                  className="bg-[#4169E1] text-white hover:bg-[#3159D1] font-medium shadow-lg shadow-[#4169E1]/30 h-9 px-4"
                >
                  <CreditCard className="h-3.5 w-3.5 mr-2" />
                  Upgrade
                </Button>
              </Link>

              <Link href="/settings" className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-white/50 hover:text-white hover:bg-white/[0.04] h-9 w-9",
                    pathname === "/settings" && "text-[#4169E1] bg-[#4169E1]/10"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>

              <div className="hidden md:block relative">
                <Button
                  variant="ghost"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 h-9 px-2 hover:bg-white/[0.04]"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={userAvatar} alt="User" />
                    <AvatarFallback className="bg-[#4169E1] text-white text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                </Button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/[0.08]">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.user_metadata?.name || "User"}
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-white/50 hover:text-white hover:bg-white/[0.04] h-9 w-9"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-600 to-transparent opacity-50"></div>
        <motion.div 
          className="absolute bottom-0 left-0 w-32 h-[2px] bg-gradient-to-r from-[#4169E1]/0 via-[#4169E1] to-[#4169E1]/0 blur-sm"
          animate={{
            x: [0, window.innerWidth - 128, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-[280px] bg-black border-l border-white/[0.08] z-50 md:hidden overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-white/[0.08]">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userAvatar} alt="User" />
                  <AvatarFallback className="bg-[#4169E1] text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.name || "User"}
                  </p>
                  <p className="text-xs text-white/40 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href || pathname?.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                          isActive
                            ? "bg-[#4169E1]/10 text-white"
                            : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", isActive && "text-[#4169E1]")} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <Link href="/settings" onClick={() => setMobileOpen(false)}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    pathname === "/settings"
                      ? "bg-[#4169E1]/10 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Settings className={cn("h-5 w-5", pathname === "/settings" && "text-[#4169E1]")} />
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </Link>

              <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#4169E1] text-white hover:bg-[#3159D1] transition-all">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-sm font-medium">Upgrade to Pro</span>
                </div>
              </Link>

              <button
                onClick={() => {
                  handleSignOut();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] transition-all w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
