"use client";
import Link from "next/link";

export function MktFooter() {
  return (
    <footer style={{
      borderTop: "1px solid #e7e5e4", padding: "28px 5%",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 12, fontFamily: "'Geist',system-ui,sans-serif",
    }}>
      <Link href="/" style={{
        fontFamily: "'Fraunces',Georgia,serif", fontSize: "1.1rem",
        color: "#0c0a09", textDecoration: "none", display: "flex",
        alignItems: "center", gap: 8, fontWeight: 300, letterSpacing: "-.02em",
      }}>
        <div style={{
          width: 20, height: 20, background: "#f97316", borderRadius: 5,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        Clario
      </Link>
      <ul style={{ display: "flex", gap: 18, listStyle: "none", margin: 0, padding: 0 }}>
        <li><Link href="/pricing" style={{ fontSize: ".74rem", color: "#78716c", textDecoration: "none" }}>Pricing</Link></li>
        <li><Link href="/privacy" style={{ fontSize: ".74rem", color: "#78716c", textDecoration: "none" }}>Privacy</Link></li>
        <li><Link href="/terms" style={{ fontSize: ".74rem", color: "#78716c", textDecoration: "none" }}>Terms</Link></li>
      </ul>
      <p style={{ fontSize: ".7rem", color: "#a8a29e", margin: 0 }}>© 2025 Clario · Built for creators.</p>
    </footer>
  );
}
