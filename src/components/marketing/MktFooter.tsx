"use client";
import Link from "next/link";

export function MktFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #e7e5e4",
        padding: "32px 5%",
        fontFamily: "var(--font-inter),system-ui,sans-serif",
        background: "linear-gradient(to bottom, #fafaf9, #ffffff)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 40,
          marginBottom: 32,
        }}
      >
        {/* Brand */}
        <div>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-fraunces),Georgia,serif",
              fontSize: "1.2rem",
              color: "#0c0a09",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 300,
              letterSpacing: "-.02em",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            Clario
          </Link>
          <p
            style={{
              fontSize: ".8rem",
              color: "#78716c",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            AI-powered content platform for creators. Summarize, remix, and chat your way to better content.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4
            style={{
              fontSize: ".7rem",
              fontWeight: 600,
              color: "#0c0a09",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: 12,
            }}
          >
            Product
          </h4>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            <li>
              <Link
                href="/dashboard"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/summarizer"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                AI Summarizer
              </Link>
            </li>
            <li>
              <Link
                href="/chat"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                AI Chat
              </Link>
            </li>
            <li>
              <Link
                href="/remix"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                Content Remix
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4
            style={{
              fontSize: ".7rem",
              fontWeight: 600,
              color: "#0c0a09",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: 12,
            }}
          >
            Company
          </h4>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            <li>
              <Link
                href="/pricing"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                Pricing
              </Link>
            </li>
            <li>
              <a
                href="https://themvpguy.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                About
              </a>
            </li>
            <li>
              <a
                href="mailto:muhammadtanveerabbas@outlook.com"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4
            style={{
              fontSize: ".7rem",
              fontWeight: 600,
              color: "#0c0a09",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: 12,
            }}
          >
            Legal
          </h4>
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            <li>
              <Link
                href="/privacy"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/refund"
                style={{
                  fontSize: ".8rem",
                  color: "#78716c",
                  textDecoration: "none",
                }}
              >
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          paddingTop: 24,
          borderTop: "1px solid #e7e5e4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <p style={{ fontSize: ".75rem", color: "#a8a29e", margin: 0 }}>
          © {new Date().getFullYear()} Clario. Built by{" "}
          <a
            href="https://themvpguy.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#f97316", textDecoration: "none" }}
          >
            The MVP Guy
          </a>
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <a
            href="https://github.com/MuhammadTanveerAbbas/Clario-ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#78716c",
              fontSize: ".75rem",
              textDecoration: "none",
            }}
          >
            GitHub
          </a>
          <span style={{ color: "#d6d3d1" }}>·</span>
          <a
            href="https://x.com/themvpguy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#78716c",
              fontSize: ".75rem",
              textDecoration: "none",
            }}
          >
            Twitter
          </a>
          <span style={{ color: "#d6d3d1" }}>·</span>
          <a
            href="https://linkedin.com/in/muhammadtanveerabbas"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#78716c",
              fontSize: ".75rem",
              textDecoration: "none",
            }}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
