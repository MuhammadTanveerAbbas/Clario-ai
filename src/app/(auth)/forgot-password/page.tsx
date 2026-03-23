"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&family=Geist:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0c0a09;--bg2:#111110;--border:#292524;
    --text:#fafaf9;--text2:#d6d3d1;--text3:#78716c;
    --accent:#f97316;--error:#f87171;--success:#4ade80;
    --serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif;
  }
  body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
  @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fp-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px 5%}
  .fp-card{width:100%;max-width:400px;animation:fu .5s ease both}
  .fp-logo{font-family:var(--serif);font-size:1.4rem;font-weight:300;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:8px;letter-spacing:-.02em;margin-bottom:40px}
  .fp-logo-mark{width:28px;height:28px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .fp-h1{font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--text);letter-spacing:-.03em;line-height:1.15;margin-bottom:6px}
  .fp-h1 em{font-style:italic;color:var(--accent)}
  .fp-sub{font-size:.85rem;color:var(--text3);margin-bottom:28px;line-height:1.5}
  .fp-form{display:flex;flex-direction:column;gap:14px}
  .fp-field{display:flex;flex-direction:column;gap:5px}
  .fp-label{font-size:.75rem;font-weight:600;color:var(--text2);letter-spacing:.02em}
  .fp-input{background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:11px 14px;font-size:.88rem;color:var(--text);font-family:var(--sans);outline:none;transition:border-color .18s,box-shadow .18s;width:100%}
  .fp-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(249,115,22,.12)}
  .fp-input::placeholder{color:var(--text3)}
  .fp-btn{background:var(--accent);color:#fff;border:none;border-radius:9px;padding:12px;font-size:.88rem;font-weight:600;cursor:pointer;font-family:var(--sans);width:100%;display:flex;align-items:center;justify-content:center;gap:8px;transition:background .18s}
  .fp-btn:hover:not(:disabled){background:#ea6c0a}
  .fp-btn:disabled{opacity:.6;cursor:not-allowed}
  .fp-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);border-radius:9px;padding:10px 13px;font-size:.8rem;color:var(--error);margin-bottom:4px}
  .fp-success-icon{width:52px;height:52px;border-radius:50%;background:rgba(74,222,128,.15);border:1px solid rgba(74,222,128,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
  .fp-sent-text{font-size:.85rem;color:var(--text3);line-height:1.65;margin-top:8px}
  .fp-footer{text-align:center;margin-top:20px;font-size:.8rem;color:var(--text3)}
  .fp-footer a{color:var(--accent);text-decoration:none;font-weight:500}
  .fp-footer a:hover{text-decoration:underline}
  .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
`;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` }
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="fp-wrap">
        <div className="fp-card">
          <Link href="/" className="fp-logo">
            <div className="fp-logo-mark">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            Clario
          </Link>

          {!sent ? (
            <>
              <h1 className="fp-h1">
                Reset your<br />
                <em>password.</em>
              </h1>
              <p className="fp-sub">Enter your email and we&apos;ll send a reset link.</p>
              {error && <div className="fp-error">{error}</div>}
              <form className="fp-form" onSubmit={handleSubmit}>
                <div className="fp-field">
                  <label className="fp-label">Email address</label>
                  <input
                    className="fp-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                <button className="fp-btn" type="submit" disabled={loading}>
                  {loading && <div className="spinner" />}
                  {loading ? "Sending..." : "Send reset link \u2192"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div className="fp-success-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="fp-h1" style={{ textAlign: "center" }}>
                Check your<br />
                <em>email.</em>
              </h1>
              <p className="fp-sent-text">
                We sent a reset link to{" "}
                <strong style={{ color: "#d6d3d1" }}>{email}</strong>.
                {" "}Check your inbox &mdash; it should arrive within 2 minutes.
              </p>
            </div>
          )}

          <div className="fp-footer">
            <Link href="/sign-in">&#8592; Back to sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
