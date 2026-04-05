"use client";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/sign-in", label: "Sign in" },
];

export function MktNav() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className="sticky top-0 z-50 h-14 flex items-center justify-between gap-2 px-[5%] bg-white/90 backdrop-blur-lg border-b border-stone-200"
      style={{ fontFamily: "'Geist',system-ui,sans-serif" }}>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0 no-underline"
        style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "1.2rem", color: "#0c0a09", fontWeight: 300, letterSpacing: "-.02em" }}>
        <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "#f97316" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        Clario
      </Link>

      {/* Nav links  always visible on all screen sizes */}
      <ul className="flex items-center gap-1 list-none m-0 p-0">
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link href={href}
              className="text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap no-underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right side: theme toggle + CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleTheme}
          title={isDark ? "Light mode" : "Dark mode"}
          className="w-8 h-8 rounded-lg border border-stone-200 bg-stone-50 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors flex items-center justify-center cursor-pointer"
        >
          {isDark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
        <button
          onClick={() => { window.location.href = "/sign-up"; }}
          className="bg-stone-900 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:opacity-85 transition-opacity whitespace-nowrap cursor-pointer border-0"
          style={{ fontFamily: "'Geist',system-ui,sans-serif" }}>
          Get started free
        </button>
      </div>
    </nav>
  );
}
