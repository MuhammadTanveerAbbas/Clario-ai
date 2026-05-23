"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Zap,
  Mic,
  Menu,
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

  const userAvatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-[#4169E1]/5"
            : "bg-black/50 backdrop-blur-md border-b border-white/[0.05]",
        )}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/favicon.svg"
                  alt="Clario Logo"
                  width={32}
                  height={32}
                  className="transition-transform"
                />
              </motion.div>
              <span className="text-white font-bold text-xl tracking-tight hidden sm:block">
                Clario
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200 relative group",
                        isActive
                          ? "text-white"
                          : "text-white/50 hover:text-white hover:bg-white/[0.05]",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-gradient-to-br from-[#4169E1]/20 to-[#4169E1]/10 rounded-xl border border-[#4169E1]/50 shadow-lg shadow-[#4169E1]/20"
                          transition={{
                            type: "spring",
                            bounce: 0.15,
                            duration: 0.5,
                          }}
                        />
                      )}
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5 relative z-10 transition-transform group-hover:scale-110",
                          isActive ? "text-[#4169E1]" : "",
                        )}
                      />
                      <span className="text-sm font-semibold relative z-10">
                        {item.name}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Link href="/settings" className="hidden md:block">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-white/50 hover:text-white hover:bg-white/[0.05] h-9 w-9 rounded-xl transition-all",
                      pathname === "/settings" &&
                        "text-[#4169E1] bg-[#4169E1]/15 ring-1 ring-[#4169E1]/30",
                    )}
                  >
                    <Settings className="h-4.5 w-4.5" />
                  </Button>
                </motion.div>
              </Link>

              <div className="hidden md:block relative">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 h-9 px-2 hover:bg-white/[0.05] rounded-full transition-all"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-[#4169E1]/30 transition-all hover:ring-[#4169E1]/50">
                      <AvatarImage src={userAvatar} alt="User" />
                      <AvatarFallback className="bg-gradient-to-br from-[#4169E1] to-[#4169E1]/80 text-white text-xs font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      animate={{ rotate: userMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                    </motion.div>
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-black/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-white/[0.08] bg-gradient-to-br from-[#4169E1]/10 to-transparent">
                          <p className="text-sm font-semibold text-white truncate">
                            {user?.user_metadata?.name || "User"}
                          </p>
                          <p className="text-xs text-white/50 truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white/70 hover:text-white hover:bg-white/[0.05] h-9 w-9 rounded-xl"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4169E1]/30 to-transparent" />
        <motion.div
          className="absolute bottom-0 left-0 w-40 h-[2px] bg-gradient-to-r from-[#4169E1]/0 via-[#4169E1]/80 to-[#4169E1]/0 blur-md"
          animate={{
            x: [0, 1400, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-black/95 backdrop-blur-xl border-l border-white/[0.1] z-50 md:hidden overflow-y-auto shadow-2xl"
            >
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-white/[0.08]">
                <Avatar className="h-12 w-12 ring-2 ring-[#4169E1]/30">
                  <AvatarImage src={userAvatar} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-[#4169E1] to-[#4169E1]/80 text-white font-bold text-base">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.user_metadata?.name || "User"}
                  </p>
                  <p className="text-xs text-white/50 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all",
                          isActive
                            ? "bg-gradient-to-r from-[#4169E1]/20 to-[#4169E1]/10 text-white border border-[#4169E1]/30"
                            : "text-white/60 hover:text-white hover:bg-white/[0.05]",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isActive && "text-[#4169E1]",
                          )}
                        />
                        <span className="text-base font-semibold">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <Link href="/settings" onClick={() => setMobileOpen(false)}>
                <div
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all",
                    pathname === "/settings"
                      ? "bg-gradient-to-r from-[#4169E1]/20 to-[#4169E1]/10 text-white border border-[#4169E1]/30"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]",
                  )}
                >
                  <Settings
                    className={cn(
                      "h-5 w-5",
                      pathname === "/settings" && "text-[#4169E1]",
                    )}
                  />
                  <span className="text-base font-semibold">Settings</span>
                </div>
              </Link>

              <div className="pt-4 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-base font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
