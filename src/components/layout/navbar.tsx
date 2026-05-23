"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, StickyNote, X, User, LogOut, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-[#4169E1]/5"
            : "bg-black/50 backdrop-blur-sm border-b border-white/5"
        )}
      >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <StickyNote className="h-7 w-7 text-[#4169E1]" />
          </motion.div>
          <span className="font-bold text-white text-xl tracking-tight">
            Clario
          </span>
        </Link>

        <nav className="hidden items-center space-x-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link key={label} href={href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {label}
              </motion.div>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative hidden md:block">
              <Button
                variant="ghost"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-9 px-2 hover:bg-white/5 rounded-full"
              >
                <Avatar className="h-8 w-8 ring-2 ring-[#4169E1]/20">
                  <AvatarFallback className="bg-[#4169E1] text-white text-sm font-semibold">
                    {user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>

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
                      className="absolute right-0 mt-2 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            router.push("/dashboard");
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            router.push("/settings");
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                          <SettingsIcon className="h-4 w-4" />
                          Settings
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
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
          ) : (
            <>
              <Link href="/sign-in" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/5 font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-[#4169E1] hover:bg-[#4169E1]/90 text-white font-semibold shadow-lg shadow-[#4169E1]/20 px-5 h-10">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white/70 hover:text-white hover:bg-white/5 h-9 w-9"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4169E1]/30 to-transparent" />
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-black border-l border-white/10 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                    <StickyNote className="h-6 w-6 text-[#4169E1]" />
                    <span className="font-bold text-white text-lg">Clario</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {user && (
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <Avatar className="h-10 w-10 ring-2 ring-[#4169E1]/30">
                      <AvatarFallback className="bg-[#4169E1] text-white font-semibold">
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                <nav className="space-y-2">
                  {navLinks.map(({ href, label }) => (
                    <Link key={label} href={href} onClick={() => setIsMenuOpen(false)}>
                      <div className="px-4 py-3 text-base font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        {label}
                      </div>
                    </Link>
                  ))}
                </nav>

                {user ? (
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        router.push("/dashboard");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-base font-medium">Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <SettingsIcon className="h-5 w-5" />
                      <span className="text-base font-medium">Settings</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-base font-medium">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-[#4169E1] hover:bg-[#4169E1]/90 text-white shadow-lg shadow-[#4169E1]/20">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
