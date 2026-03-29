"use client";

import { MktNav } from "@/components/marketing/MktNav";
import { MktFooter } from "@/components/marketing/MktFooter";

export default function PrivacyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Geist:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--o:#f97316;--ol:#fff7ed;--bk:#0c0a09;--g7:#44403c;--g5:#78716c;--g4:#a8a29e;--g2:#e7e5e4;--w:#fff;--serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif}
        body{font-family:var(--sans);background:var(--w);color:var(--bk);-webkit-font-smoothing:antialiased}
        .legal-wrap{max-width:740px;margin:0 auto;padding:64px 5% 80px}
        @media(max-width:480px){.legal-wrap{padding:40px 5% 60px}}
        .legal-h1{font-family:var(--serif);font-size:clamp(2rem,3.5vw,3rem);font-weight:300;letter-spacing:-.03em;color:var(--bk);margin-bottom:8px}
        .legal-h1 em{font-style:italic;color:var(--o)}
        .legal-meta{font-size:.78rem;color:var(--g4);margin-bottom:40px}
        .legal-section{margin-bottom:36px}
        .legal-h2{font-family:var(--serif);font-size:1.3rem;font-weight:300;letter-spacing:-.02em;color:var(--bk);margin-bottom:10px}
        .legal-p{font-size:.88rem;color:var(--g7);line-height:1.8;margin-bottom:10px}
        .legal-ul{padding-left:18px;margin-bottom:10px}
        .legal-ul li{font-size:.88rem;color:var(--g7);line-height:1.8;margin-bottom:5px}
        .legal-a{color:var(--o);text-decoration:none}
        .legal-a:hover{text-decoration:underline}
      ` }} />
      <MktNav />
      <div className="legal-wrap">
        <h1 className="legal-h1">Privacy <em>Policy.</em></h1>
        <p className="legal-meta">Last updated: March 23, 2025 · Clario is operated by Clario AI Ltd.</p>

        <div className="legal-section">
          <h2 className="legal-h2">1. Information We Collect</h2>
          <p className="legal-p">We collect information you provide when creating an account, using our AI features, and managing your subscription. This includes:</p>
          <ul className="legal-ul">
            <li><strong>Account information:</strong> Name, email address, and password (hashed).</li>
            <li><strong>Content you submit:</strong> Text, YouTube URLs, and writing samples. Not used to train AI models.</li>
            <li><strong>Usage data:</strong> Features used, request counts, and timestamps.</li>
            <li><strong>Payment information:</strong> Processed entirely by Stripe. We never store card numbers.</li>
            <li><strong>Device and browser information:</strong> IP address, browser type, OS for security purposes.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">2. How We Use Your Information</h2>
          <p className="legal-p">We use your information to:</p>
          <ul className="legal-ul">
            <li>Provide, maintain, and improve Clario</li>
            <li>Process your AI requests via Groq infrastructure</li>
            <li>Send transactional emails (confirmation, password reset, billing)</li>
            <li>Monitor for abuse, fraud, and security threats</li>
            <li>Analyze aggregate usage patterns to improve the product</li>
          </ul>
          <p className="legal-p">We do <strong>not</strong> sell your personal data. We do not use your content to train AI models.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">3. Data Storage and Security</h2>
          <p className="legal-p">Your data is stored in Supabase (PostgreSQL) on AWS infrastructure. We implement:</p>
          <ul className="legal-ul">
            <li>Row Level Security (RLS)  your data is isolated at the database level</li>
            <li>PKCE authentication flow for OAuth</li>
            <li>TLS 1.3 encryption in transit</li>
            <li>AES-256 encryption at rest</li>
            <li>Automatic backups with 30-day retention</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">4. Third-Party Services</h2>
          <p className="legal-p">Clario uses the following third-party services:</p>
          <ul className="legal-ul">
            <li><strong>Groq:</strong> AI inference. Content not stored or used for training. (<a href="https://groq.com/privacy" className="legal-a">groq.com/privacy</a>)</li>
            <li><strong>Supabase:</strong> Database and authentication. (<a href="https://supabase.com/privacy" className="legal-a">supabase.com/privacy</a>)</li>
            <li><strong>Stripe:</strong> Payment processing. (<a href="https://stripe.com/privacy" className="legal-a">stripe.com/privacy</a>)</li>
            <li><strong>PostHog:</strong> Product analytics (anonymized). (<a href="https://posthog.com/privacy" className="legal-a">posthog.com/privacy</a>)</li>
            <li><strong>Sentry:</strong> Error monitoring. (<a href="https://sentry.io/privacy" className="legal-a">sentry.io/privacy</a>)</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">5. Your Rights</h2>
          <p className="legal-p">Depending on your location, you may have the right to access, correct, delete, or export your data, and opt out of non-essential analytics.</p>
          <p className="legal-p">To exercise any of these rights, email <a href="mailto:privacy@clario.ai" className="legal-a">privacy@clario.ai</a>. We respond within 30 days.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">6. Data Retention</h2>
          <p className="legal-p">We retain your account data while your account is active. Upon deletion, personal data is removed within 30 days except where required by law.</p>
          <p className="legal-p">AI request logs (without content) are retained for 12 months for analytics and billing verification.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">7. Cookies</h2>
          <p className="legal-p">We use only essential cookies: a Supabase session cookie and a theme preference cookie. We do not use advertising cookies.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">8. Contact</h2>
          <p className="legal-p">Questions? Email <a href="mailto:privacy@clario.ai" className="legal-a">privacy@clario.ai</a> or write to: Clario AI Ltd., [Address on file].</p>
        </div>
      </div>
      <MktFooter />
    </>
  );
}
