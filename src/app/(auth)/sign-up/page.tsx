"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const AUTH_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;min-height:100vh}
  @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}

  .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center}
  .auth-left{background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 5%;min-height:100vh;width:100%}
  @media(max-width:480px){.auth-left{padding:32px 4%}}
  .auth-card{width:100%;max-width:400px;animation:fu .5s ease both}
  .auth-logo{font-family:var(--serif);font-size:1.4rem;font-weight:300;color:var(--text);text-decoration:none;display:flex;align-items:center;gap:8px;letter-spacing:-.02em;margin-bottom:40px}
  .auth-logo-mark{width:28px;height:28px;background:hsl(var(--accent));border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .auth-h1{font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--text);letter-spacing:-.03em;line-height:1.15;margin-bottom:6px}
  .auth-h1 em{font-style:italic;color:hsl(var(--accent))}
  .auth-sub{font-size:.85rem;color:var(--text3);margin-bottom:28px;line-height:1.5}
  .auth-form{display:flex;flex-direction:column;gap:14px}
  .field-group{display:flex;flex-direction:column;gap:5px}
  .field-label{font-size:.75rem;font-weight:600;color:var(--text2);letter-spacing:.02em}
  .field-input{
    background:var(--bg2);border:1px solid hsl(var(--border));border-radius:9px;
    padding:11px 14px;font-size:.88rem;color:var(--text);font-family:var(--sans);
    outline:none;transition:border-color .18s,box-shadow .18s;width:100%;
  }
  .field-input:focus,.field-input:focus-visible{outline:none;outline-offset:0;box-shadow:none;border-color:rgba(23,20,18,.28)}
  .field-input::placeholder{color:var(--text3)}
  .btn-primary{
    background:hsl(var(--accent));color:var(--color-paper);border:none;border-radius:9px;
    padding:12px;font-size:.88rem;font-weight:600;cursor:pointer;
    font-family:var(--sans);letter-spacing:-.01em;width:100%;
    display:flex;align-items:center;justify-content:center;gap:8px;
    transition:background .18s,transform .15s;
  }
  .btn-primary:hover:not(:disabled){background:var(--color-accent-hover);transform:translateY(-1px)}
  .btn-primary:disabled{opacity:.6;cursor:not-allowed}
  .btn-google{
    background:var(--bg2);color:var(--text2);border:1px solid hsl(var(--border));
    border-radius:9px;padding:11px;font-size:.86rem;font-weight:500;cursor:pointer;
    font-family:var(--sans);width:100%;display:flex;align-items:center;
    justify-content:center;gap:9px;transition:background .18s ease,border-color .18s ease,color .18s ease;
  }
  .btn-google:hover{background:var(--bg3);border-color:var(--border2);color:var(--text)}
  .divider{display:flex;align-items:center;gap:12px;margin:4px 0}
  .divider-line{flex:1;height:1px;background:hsl(var(--border))}
  .divider-text{font-size:.72rem;color:var(--text3);white-space:nowrap}
  .auth-footer{text-align:center;margin-top:20px;font-size:.8rem;color:var(--text3)}
  .auth-footer a{color:hsl(var(--accent));text-decoration:none;font-weight:500}
  .auth-footer a:hover{text-decoration:underline}
  .global-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);border-radius:9px;padding:10px 13px;font-size:.8rem;color:var(--error);margin-bottom:4px}
  .global-success{background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);border-radius:9px;padding:10px 13px;font-size:.8rem;color:var(--success);margin-bottom:4px}
  .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:var(--color-paper);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
  .terms-row{display:flex;align-items:flex-start;gap:11px;margin-top:6px;cursor:pointer;user-select:none}
  .terms-box-wrap{position:relative;flex:0 0 auto;width:20px;height:20px;display:block}
  .terms-box{
    appearance:none;-webkit-appearance:none;position:absolute;inset:0;width:20px;height:20px;margin:0;
    border:1.5px solid hsl(var(--border2));border-radius:6px;background:var(--bg2);cursor:pointer;
    transition:background .15s,border-color .15s,box-shadow .15s;
  }
  .terms-box-wrap svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:0;transition:opacity .12s}
  .terms-box:hover{border-color:hsl(var(--accent))}
  .terms-box:checked{background:hsl(var(--accent));border-color:hsl(var(--accent))}
  .terms-box:focus-visible{outline:none;border-color:rgba(23,20,18,.28);box-shadow:none}
  .terms-box.error{border-color:var(--error);box-shadow:0 0 0 3px rgba(248,113,113,.15)}
  .terms-box:checked + svg{opacity:1}
  .terms-text{font-size:.78rem;color:var(--text3);line-height:20px;text-align:left;padding-top:0}
  .terms-text a{color:var(--text2);text-decoration:underline;text-underline-offset:2px;font-weight:500}
  .terms-text a:hover{color:hsl(var(--accent))}
  .pro-badge{display:flex;align-items:center;gap:7px;background:var(--accent-l);border:1px solid var(--accent-m);border-radius:8px;padding:7px 11px;margin-bottom:20px;font-size:.76rem;color:hsl(var(--accent));font-weight:600}
`;

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const plan = searchParams.get("plan");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setAgreedError(true);
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.user && !data.session) {
        setSuccess("Check your email to confirm your account!");
      } else {
        if (plan === "pro") router.push("/pricing");
        else router.push("/dashboard");
        router.refresh();
      }
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
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch {
      setError("Google sign up failed.");
      setGoogleLoading(false);
    }
  };

  const strengthColors = [
    "#292524",
    "var(--color-danger)",
    "#f59e0b",
    "#84cc16",
    "var(--color-success)",
  ];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <div className="auth-wrap">
        <div className="auth-left">
          <div className="auth-card">
            <Link href="/" className="auth-logo">
              <img
                src="/Clario.png"
                alt=""
                width={26}
                height={26}
                className="h-[26px] w-[26px] rounded-md object-cover"
              />
              Clario
            </Link>
            {plan === "pro" && (
              <div className="pro-badge">
                You&apos;re signing up for Pro $19/mo after free trial
              </div>
            )}
            <h1 className="auth-h1">
              Start creating
              <br />
              <span>for free.</span>
            </h1>
            <p className="auth-sub">Cancel during the trial and you pay nothing</p>
            {error && <div className="global-error">{error}</div>}
            {success && <div className="global-success">{success}</div>}
            <button
              className="btn-google"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <div
                  className="spinner"
                  style={{ borderTopColor: "var(--color-muted)" }}
                />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or sign up with email</span>
              <div className="divider-line" />
            </div>
            <form className="auth-form" onSubmit={handleSignUp}>
              <div className="field-group">
                <label className="field-label">Full name</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <div className="field-group">
                <label className="field-label">Email address</label>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="field-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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
                       aria-hidden="true">
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
                       aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {password.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      marginTop: 6,
                      alignItems: "center",
                    }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 100,
                          background:
                            i <= passwordStrength
                              ? strengthColors[passwordStrength]
                              : "hsl(var(--border))",
                          transition: "background .2s",
                        }}
                      />
                    ))}
                    <span
                      style={{
                        fontSize: ".68rem",
                        color: strengthColors[passwordStrength],
                        marginLeft: 6,
                        fontWeight: 600,
                      }}
                    >
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                )}
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading && <div className="spinner" />}
                {loading ? "Creating account..." : "Create free account"}
              </button>
              <label className="terms-row" htmlFor="terms-agree">
                <span className="terms-box-wrap">
                  <input
                    id="terms-agree"
                    type="checkbox"
                    className={`terms-box${agreedError ? " error" : ""}`}
                    checked={agreed}
                    aria-invalid={agreedError}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (e.target.checked) {
                        setAgreedError(false);
                        setError("");
                      }
                    }}
                  />
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <polyline
                      points="1.5,6.2 4.5,9.2 10.5,2.8"
                      stroke="var(--color-paper)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="terms-text">
                  I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </span>
              </label>
            </form>
            <div className="auth-footer">
              Already have an account? <Link href="/sign-in">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: "100vh", background: "var(--color-ink)" }} />}
    >
      <SignUpForm />
    </Suspense>
  );
}
