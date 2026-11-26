"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Account menu used in the app topbar.
 * Avatar button opens a small menu with the account summary, settings and sign out.
 */
export function TopbarUserMenu() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  };

  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || "User";
  const userInitials =
    name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";
  const userAvatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg px-1.5 transition-colors hover:bg-[var(--surface-2)]",
          open && "bg-[var(--surface-2)]"
        )}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt="" />
          <AvatarFallback className="bg-brand-strong text-[10.5px] font-semibold text-accent-ink">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[var(--ink-3)] transition-transform",
            open && "rotate-180"
          )}
          strokeWidth={1.8}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-medium)]"
            >
              <div className="flex items-center gap-3 border-b border-[var(--line)] px-3.5 py-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={userAvatar} alt="" />
                  <AvatarFallback className="bg-brand-strong text-[11px] font-semibold text-accent-ink">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
                    {name}
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] text-[var(--ink-3)]">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="p-1.5">
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--ink-2)] no-underline transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                >
                  <Settings className="h-4 w-4 text-[var(--ink-3)]" strokeWidth={1.8} />
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[var(--error)] transition-colors hover:bg-danger-wash"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.8} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
