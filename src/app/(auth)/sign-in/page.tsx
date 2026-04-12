"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";

const AUTH_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;min-height:100vh}
  @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}

  .auth-wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
  @media(max-width:820px){.auth-wrap{grid-template-columns:1fr}}
  .auth-left{background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 5%;min-height:100vh}
  @media(max-width:480px){.auth-left{padding:32px 4%}}
  .auth-right{background:#111110;border-left:1px solid #292524;padding:48px 40px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;overflow-y:auto}
  @media(max-width:820px){.auth-right{display:none}}
  .auth-card{width:100%;max-width:400px;animation:fu .5s ease both}
  .auth-logo{font-family:var(--serif);font-size:1.4rem;font-weight:300;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:8px;letter-spacing:-.02em;margin-bottom:40px}
  .auth-logo-mark{width:28px;height:28px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .auth-h1{font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--text);letter-spacing:-.03em;line-height:1.15;margin-bottom:6px}
  .auth-h1 em{font-style:italic;color:var(--accent)}
  .auth-sub{font-size:.85rem;color:var(--text3);margin-bottom:28px;line-height:1.5}
  .auth-form{display:flex;flex-direction:column;gap:14px}
  .field-group{display:flex;flex-direction:column;gap:5px}
  .field-label{font-size:.75rem;font-weight:600;color:var(--text2);letter-spacing:.02em}
  .field-input{
    background:var(--bg2);border:1px solid var(--border);border-radius:9px;
    padding:11px 14px;font-size:.88rem;color:var(--text);font-family:var(--sans);
    outline:none;transition:border-color .18s,box-shadow .18s;width:100%;
  }
  .field-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(249,115,22,.12)}
  .field-input::placeholder{color:var(--text3)}
  .field-input.error{border-color:var(--error)}
  .btn-primary{
    background:var(--accent);color:#fff;border:none;border-radius:9px;
    padding:12px;font-size:.88rem;font-weight:600;cursor:pointer;
    font-family:var(--sans);letter-spacing:-.01em;width:100%;
    display:flex;align-items:center;justify-content:center;gap:8px;
    transition:background .18s,transform .15s;
  }
  .btn-primary:hover:not(:disabled){background:#ea6c0a;transform:translateY(-1px)}
  .btn-primary:disabled{opacity:.6;cursor:not-allowed}
  .btn-google{
    background:var(--bg2);color:var(--text2);border:1px solid var(--border);
    border-radius:9px;padding:11px;font-size:.86rem;font-weight:500;cursor:pointer;
    font-family:var(--sans);width:100%;display:flex;align-items:center;
    justify-content:center;gap:9px;transition:all .18s;
  }
  .btn-google:hover{background:var(--bg3);border-color:var(--border2);color:var(--text)}
  .divider{display:flex;align-items:center;gap:12px;margin:4px 0}
  .divider-line{flex:1;height:1px;background:var(--border)}
  .divider-text{font-size:.72rem;color:var(--text3);white-space:nowrap}
  .auth-footer{text-align:center;margin-top:20px;font-size:.8rem;color:var(--text3)}
  .auth-footer a{color:var(--accent);text-decoration:none;font-weight:500}
  .auth-footer a:hover{text-decoration:underline}
  .global-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);border-radius:9px;padding:10px 13px;font-size:.8rem;color:var(--error);margin-bottom:4px}
  .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
  .forgot-link{font-size:.75rem;color:var(--text3);text-decoration:none;text-align:right;transition:color .15s}
  .forgot-link:hover{color:var(--accent)}
  .theme-toggle{position:fixed;top:14px;right:14px;z-index:100;width:34px;height:34px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);color:var(--text3);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s}
  .theme-toggle:hover{color:var(--text);border-color:var(--border2)}
`;

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AuthRightPanel({
  headline,
  sub,
  features,
}: {
  headline: string;
  sub: string;
  features: string[];
}) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 420,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          background: "#f97316",
          borderRadius: "50%",
          filter: "blur(100px)",
          opacity: 0.06,
          top: -100,
          right: -80,
          pointerEvents: "none",
        }}
      />

      {/* Headline */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: "clamp(1.7rem,2.8vw,2.3rem)",
            fontWeight: 300,
            color: "#fafaf9",
            letterSpacing: "-.03em",
            lineHeight: 1.15,
            marginBottom: 10,
          }}
        >
          {headline}
        </div>
        <p
          style={{
            fontSize: ".85rem",
            color: "#78716c",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {sub}
        </p>
      </div>

      {/* Feature list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 28,
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "11px 14px",
              background: "rgba(28,25,23,0.8)",
              borderRadius: 10,
              border: "1px solid #292524",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#1a0f07",
                border: "1px solid #431407",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <polyline
                  points="1.5,6 4.5,9 10.5,3"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{ fontSize: ".82rem", color: "#d6d3d1", lineHeight: 1.55 }}
            >
              {f}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {[
          { value: "11", label: "Summary modes" },
          { value: "10×", label: "Remix formats" },
          { value: "100%", label: "AI-powered" },
        ].map(({ value, label }) => (
          <div
            key={label}
            style={{
              background: "rgba(28,25,23,0.8)",
              border: "1px solid #292524",
              borderRadius: 10,
              padding: "14px 8px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: "1.35rem",
                fontWeight: 400,
                color: "#f97316",
                letterSpacing: "-.02em",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {value}
            </div>
            <div
              style={{ fontSize: ".65rem", color: "#78716c", lineHeight: 1.3 }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div
        style={{
          padding: "14px 16px",
          background: "rgba(28,25,23,0.8)",
          border: "1px solid #292524",
          borderRadius: 10,
          borderLeft: "3px solid #f97316",
        }}
      >
        <p
          style={{
            fontSize: ".78rem",
            color: "#a8a29e",
            lineHeight: 1.65,
            fontStyle: "italic",
            margin: "0 0 6px 0",
          }}
        >
          &ldquo;Built for creators who want to move fast &mdash; not spend
          hours reformatting the same content for every platform.&rdquo;
        </p>
        <p style={{ fontSize: ".7rem", color: "#57534e", margin: 0 }}>
          {" "}
          Muhammad Tanveer Abbas, Builder of Clario
        </p>
      </div>
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo =
    searchParams.get("redirectTo") ||
    searchParams.get("redirect") ||
    "/dashboard";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      });
    } catch {
      setError("Google sign in failed.");
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <div className="auth-wrap">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <div className="auth-left">
          <div className="auth-card">
            <Link href="/" className="auth-logo">
              <div className="auth-logo-mark">
                <svg
                  width="13"
                  height="13"
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
            <h1 className="auth-h1">
              Welcome
              <br />
              <em>back.</em>
            </h1>
            <p className="auth-sub">
              Sign in to your account to continue creating.
            </p>
            {error && <div className="global-error">{error}</div>}
            <button
              className="btn-google"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <div
                  className="spinner"
                  style={{ borderTopColor: "#78716c" }}
                />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or sign in with email</span>
              <div className="divider-line" />
            </div>
            <form className="auth-form" onSubmit={handleSignIn}>
              <div className="field-group">
                <label className="field-label">Email address</label>
                <input
                  className={`field-input${error ? " error" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div className="field-group">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label className="field-label">Password</label>
                  <Link href="/forgot-password" className="forgot-link">
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    className={`field-input${error ? " error" : ""}`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text3)",
                      padding: 0,
                    }}
                  >
                    {showPassword ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading && <div className="spinner" />}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <div className="auth-footer">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up">Create one free</Link>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <AuthRightPanel
            headline="Your content, multiplied."
            sub="Clario's AI toolkit helps creators save hours every week."
            features={[
              "Summarize any YouTube video in seconds",
              "Turn 1 post into 10 formats instantly",
              "Brand Voice that sounds exactly like you",
              "AI chat trained on creator workflows",
            ]}
          />
        </div>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100vh", background: "#0c0a09" }} />}
    >
      <SignInForm />
    </Suspense>
  );
}
