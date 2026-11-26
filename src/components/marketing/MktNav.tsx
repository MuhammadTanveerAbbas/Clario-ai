"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

const NAV_LINKS: { href: string; label: string }[] = [];

function ClarioLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1.5 shrink-0 no-underline"
    >
      <Image
        src="/Clario.png"
        alt="Clario"
        width={24}
        height={24}
        className="h-6 w-6 shrink-0 object-contain"
      />
      <span
        className="font-serif text-[1.15rem] font-medium leading-none tracking-[-0.02em] text-ink"
        style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
      >
        Clario
      </span>
    </Link>
  );
}

export function MktNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "bg-paper border-b border-rule "
            : "bg-paper border-b border-transparent"
        }`}
      >
        <nav className="relative mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-4 px-2 sm:px-4 lg:px-8">
          <ClarioLogo />

          {/* Links and actions sit together on the right, logo stays left */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-1 lg:gap-2">
            <ul className="flex items-center list-none m-0 p-0 mr-1 lg:mr-3">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = href === "/pricing" && pathname === "/pricing";
                return (
                  <li key={`${href}-${label}`} className="relative">
                    <Link
                      href={href}
                      className={`group relative inline-flex items-center px-3 py-2 text-sm font-normal no-underline transition-colors duration-200 lg:px-4 ${
                        isActive ? "text-ink" : "text-body-muted hover:text-ink"
                      }`}
                    >
                      {label}
                      <span className={`pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-brand-strong transition-transform duration-200 origin-left lg:left-4 lg:right-4 ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center h-10 px-4 text-sm font-normal text-body-muted hover:text-ink rounded-lg hover:bg-paper-2 transition-colors no-underline"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-semibold text-accent-ink bg-brand-strong hover:bg-accent-hover h-10 px-4 rounded-lg transition-colors cursor-pointer border-0 shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-up"
                  className="inline-flex items-center h-10 px-5 text-sm font-semibold text-accent-ink bg-brand-strong hover:bg-accent-hover rounded-lg transition-colors duration-200 no-underline shadow-soft active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
                >
                  Get started
                </Link>
              )}
            </div>
          </div>

          {/* Small screens: logo plus the primary action */}
          <div className="flex items-center gap-2 md:hidden">
            {!user && (
              <Link
                href="/sign-up"
                className="inline-flex items-center whitespace-nowrap h-9 px-3.5 text-[13px] font-semibold text-accent-ink bg-brand-strong rounded-lg no-underline shadow-soft active:scale-[.98] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong"
              >
                Get started
              </Link>
            )}
          </div>
        </nav>


      </header>
    </>
  );
}
