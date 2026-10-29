"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Reusable pfp avatar + dropdown for use in per-page topbars.
 * Shows user avatar; clicking opens a menu with Settings link and Sign out button.
 */
export function TopbarUserMenu() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  };

  const userInitials =
    user?.user_metadata?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  const userAvatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="relative" style={{ marginLeft: "auto" }}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 h-8 px-1.5 rounded-xl transition-colors hover:bg-[var(--bg3)]",
          open && "bg-[var(--bg3)]"
        )}
        aria-label="Account menu"
        aria-expanded={open}
        style={{ cursor: "pointer", border: "none", background: open ? "var(--bg3)" : "transparent" }}
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt="User avatar" />
          <AvatarFallback
            className="text-white text-[11px] font-bold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
          >
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <motion.svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
          style={{ color: "var(--text3)" }}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl z-50 overflow-hidden"
              style={{
                background: "var(--sidebar)",
                border: "1px solid var(--sidebar-b)",
                boxShadow: "var(--shadow-medium)",
              }}
            >
              {/* User info */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: "1px solid var(--sidebar-b)" }}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={userAvatar} alt="User avatar" />
                  <AvatarFallback
                    className="text-white text-[11px] font-bold"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
                  >
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p
                    className="text-[13px] font-semibold truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {user?.user_metadata?.name || "User"}
                  </p>
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: "var(--text3)" }}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium rounded-xl transition-colors hover:bg-[var(--bg3)] no-underline"
                  style={{ color: "var(--text2)" }}
                >
                  <Settings size={14} style={{ color: "var(--text3)" }} />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  style={{ border: "none", cursor: "pointer", background: "transparent" }}
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
