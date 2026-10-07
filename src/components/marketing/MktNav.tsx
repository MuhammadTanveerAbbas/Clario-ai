"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#compare", label: "Compare" },
];

function ClarioLogo({ compact = false, onClick }: { compact?: boolean; onClick?: () => void }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 shrink-0 no-underline group"
      onClick={onClick}
    >
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 transition-all duration-300 group-hover:shadow-orange-500/40 group-hover:scale-[1.03]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span
            className="font-serif text-[1.35rem] font-light tracking-tight text-stone-900"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Clario
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-stone-400 mt-0.5">
            AI for creators
          </span>
        </div>
      )}
    </Link>
  );
}

export function MktNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/92 backdrop-blur-xl border-b border-stone-200/90 shadow-[0_4px_24px_-4px_rgba(28,25,23,0.08)]"
            : "bg-white/70 backdrop-blur-lg border-b border-transparent"
        }`}
      >
        <div className="h-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 opacity-90" />

        <nav className="relative mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <ClarioLogo />

          {/* Center nav underline tab style */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center list-none m-0 p-0">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = href === "/pricing" && pathname === "/pricing";
                return (
                  <li key={href} className="relative">
                    <Link
                      href={href}
                      className={`inline-flex items-center px-5 py-5 text-sm font-medium no-underline transition-colors duration-200 ${
                        isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-900"
                      }`}
                    >
                      {label}
                    </Link>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 px-3.5 py-2 rounded-lg hover:bg-stone-100 transition-colors no-underline"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg transition-colors cursor-pointer border-0"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 px-3.5 py-2 rounded-lg hover:bg-stone-100 transition-colors no-underline"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-stone-900 hover:bg-orange-600 px-4 py-2.5 rounded-lg transition-all no-underline shadow-sm shadow-stone-900/10 hover:shadow-orange-500/20"
                >
                  Get started
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors border border-stone-200/80 bg-white cursor-pointer hover:border-stone-300"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} strokeWidth={1.8} />
          </button>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[min(360px,92vw)] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.12)] flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header with gradient accent */}
          <div className="relative flex items-center justify-between px-5 h-[68px] border-b border-stone-100/80">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />
            <ClarioLogo compact onClick={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-9 h-9 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Welcome banner */}
          <div className="relative mx-4 mt-4 mb-2 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent" />
            <div className="relative px-4 py-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-600 mb-1">AI for creators</p>
                <p className="text-[13px] text-stone-500 leading-relaxed m-0">
                  Summarize videos, remix content, and chat with AI.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">Menu</p>
            <div className="flex flex-col gap-0.5">
              {NAV_LINKS.map(({ href, label }, i) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center gap-3.5 py-3.5 px-3 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-50 no-underline transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms",
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? "translateX(0)" : "translateX(12px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                  }}
                >
                  <span className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-orange-100 flex items-center justify-center text-stone-400 group-hover:text-orange-500 transition-colors shrink-0 text-xs font-sans font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[15px] font-light">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom CTA area */}
          <div className="p-4 border-t border-stone-100/80 bg-gradient-to-b from-white to-stone-50/80">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-stone-900 to-stone-800 py-3.5 rounded-xl hover:from-stone-800 hover:to-stone-700 no-underline transition-all shadow-lg shadow-stone-900/10"
                >
                  Go to Dashboard
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="w-full mt-2 text-[13px] font-medium text-stone-500 py-2.5 rounded-xl hover:text-stone-700 hover:bg-stone-100/80 cursor-pointer bg-transparent transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 rounded-xl hover:from-orange-600 hover:to-amber-600 no-underline transition-all shadow-lg shadow-orange-500/20"
                >
                  Get started free
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="w-full mt-2 inline-flex items-center justify-center text-[13px] font-semibold text-stone-600 py-2.5 rounded-xl hover:text-stone-900 hover:bg-stone-100/80 no-underline transition-colors"
                >
                  Already have an account? Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
