"use client";
import Link from "next/link";

export function MktNav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100, height: 56,
      padding: "0 5%", display: "flex", alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(255,255,255,.92)", backdropFilter: "blur(18px)",
      borderBottom: "1px solid #e7e5e4", fontFamily: "'Geist',system-ui,sans-serif",
    }}>
      <Link href="/" style={{
        fontFamily: "'Fraunces',Georgia,serif", fontSize: "1.2rem",
        color: "#0c0a09", textDecoration: "none", display: "flex",
        alignItems: "center", gap: 8, fontWeight: 300, letterSpacing: "-.02em",
      }}>
        <div style={{
          width: 24, height: 24, background: "#f97316", borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        Clario
      </Link>
      <ul style={{ display: "flex", gap: 20, listStyle: "none", margin: 0, padding: 0 }}>
        <li><Link href="/#features" style={{ fontSize: ".8rem", color: "#78716c", textDecoration: "none" }}>Features</Link></li>
        <li><Link href="/pricing" style={{ fontSize: ".8rem", color: "#78716c", textDecoration: "none" }}>Pricing</Link></li>
        <li><Link href="/sign-in" style={{ fontSize: ".8rem", color: "#78716c", textDecoration: "none" }}>Sign in</Link></li>
      </ul>
      <button
        onClick={() => { window.location.href = "/sign-up"; }}
        style={{
          background: "#0c0a09", color: "#fff", padding: "8px 18px",
          borderRadius: 8, fontSize: ".8rem", fontWeight: 600, border: "none",
          cursor: "pointer", fontFamily: "'Geist',system-ui,sans-serif",
        }}
      >
        Get started free
      </button>
    </nav>
  );
}
