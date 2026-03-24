"use client";
import Link from "next/link";
import { useState } from "react";

export function MktNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <style>{`
        .mkt-nav-links{display:flex;gap:20px;list-style:none;margin:0;padding:0}
        .mkt-nav-cta{background:#0c0a09;color:#fff;padding:8px 18px;border-radius:8px;font-size:.8rem;font-weight:600;border:none;cursor:pointer;font-family:'Geist',system-ui,sans-serif}
        .mkt-hamburger{display:none;background:none;border:none;cursor:pointer;padding:4px;color:#0c0a09}
        .mkt-mobile-nav{display:none;position:fixed;inset:0;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);z-index:200;flex-direction:column;align-items:center;justify-content:center;gap:24px}
        .mkt-mobile-nav.open{display:flex}
        .mkt-mobile-nav a{font-family:'Fraunces',Georgia,serif;font-size:1.5rem;font-weight:300;color:#0c0a09;text-decoration:none}
        @media(max-width:640px){.mkt-nav-links{display:none}.mkt-nav-cta{display:none}.mkt-hamburger{display:flex}}
      `}</style>
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
        <ul className="mkt-nav-links">
          <li><Link href="/#features" style={{ fontSize: ".8rem", color: "#78716c", textDecoration: "none" }}>Features</Link></li>
          <li><Link href="/pricing" style={{ fontSize: ".8rem", color: "#78716c", textDecoration: "none" }}>Pricing</Link></li>
          <li><Link href="/sign-in" style={{ fontSize: ".8rem", color: "#78716c", textDecoration: "none" }}>Sign in</Link></li>
        </ul>
        <button className="mkt-nav-cta" onClick={() => { window.location.href = "/sign-up"; }}>
          Get started free
        </button>
        <button className="mkt-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </nav>

      <div className={`mkt-mobile-nav${open ? " open" : ""}`}>
        <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 16, right: "5%", background: "none", border: "none", cursor: "pointer", color: "#0c0a09" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <Link href="/#features" onClick={() => setOpen(false)}>Features</Link>
        <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
        <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>
        <button onClick={() => { window.location.href = "/sign-up"; setOpen(false); }} style={{ background: "#0c0a09", color: "#fff", padding: "12px 32px", borderRadius: 9, fontSize: ".9rem", fontWeight: 600, border: "none", cursor: "pointer", marginTop: 8 }}>
          Get started free
        </button>
      </div>
    </>
  );
}
