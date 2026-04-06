"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function MktNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

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
        {!user && (
          <li>
            <Link href="/sign-in"
              className="text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap no-underline">
              Sign in
            </Link>
          </li>
        )}
      </ul>

      {/* Right side: CTA or Sign out */}
      <div className="flex items-center gap-2 shrink-0">
        {user ? (
          <button
            onClick={handleSignOut}
            className="bg-stone-900 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:opacity-85 transition-opacity whitespace-nowrap cursor-pointer border-0"
            style={{ fontFamily: "'Geist',system-ui,sans-serif" }}>
            Sign out
          </button>
        ) : (
          <button
            onClick={() => { window.location.href = "/sign-up"; }}
            className="bg-stone-900 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:opacity-85 transition-opacity whitespace-nowrap cursor-pointer border-0"
            style={{ fontFamily: "'Geist',system-ui,sans-serif" }}>
            Get started free
          </button>
        )}
      </div>
    </nav>
  );
}
