"use client";

import { MktNav } from "@/components/marketing/MktNav";
import { MktFooter } from "@/components/marketing/MktFooter";

export default function TermsPage() {
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
        <h1 className="legal-h1">Terms of <em>Service.</em></h1>
        <p className="legal-meta">Last updated: March 23, 2025 · These terms govern your use of Clario.</p>

        <div className="legal-section">
          <h2 className="legal-h2">1. Acceptance of Terms</h2>
          <p className="legal-p">By creating a Clario account or using any Clario service, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use Clario.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">2. Your Account</h2>
          <p className="legal-p">You must provide accurate information when creating your account. You are responsible for maintaining the security of your password and all activity under your account. Notify us immediately at <a href="mailto:security@clario.ai" className="legal-a">security@clario.ai</a> if you suspect unauthorized access.</p>
          <p className="legal-p">You must be at least 16 years old to use Clario.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">3. Acceptable Use</h2>
          <p className="legal-p">You agree not to use Clario to:</p>
          <ul className="legal-ul">
            <li>Generate content that violates any applicable law or regulation</li>
            <li>Create spam, misinformation, or deceptive content at scale</li>
            <li>Reverse engineer, resell, or sublicense Clario&apos;s AI capabilities</li>
            <li>Attempt to circumvent usage limits or access controls</li>
            <li>Upload content you don&apos;t have rights to (e.g., copyrighted YouTube transcripts you haven&apos;t licensed)</li>
            <li>Use Clario for any purpose that violates Groq&apos;s or Anthropic&apos;s usage policies</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">4. Your Content</h2>
          <p className="legal-p">You retain ownership of all content you submit to Clario. By submitting content, you grant us a limited license to process it to deliver the service.</p>
          <p className="legal-p">We do not claim ownership of your content, and your content is not used to train AI models.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">5. AI-Generated Output</h2>
          <p className="legal-p">AI outputs from Clario are generated automatically and may not always be accurate. You are responsible for reviewing AI-generated content before publishing or distributing it. Clario is not liable for errors, inaccuracies, or harms arising from AI-generated content.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">6. Subscription and Billing</h2>
          <p className="legal-p">Free accounts are subject to usage limits as described on the pricing page. Pro subscriptions are billed monthly or annually via Stripe. Prices may change with 30 days&apos; notice.</p>
          <p className="legal-p">You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period  you retain Pro access until then.</p>
          <p className="legal-p">We offer a 14-day money-back guarantee on your first Pro payment. Contact <a href="mailto:support@clario.ai" className="legal-a">support@clario.ai</a>.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">7. Intellectual Property</h2>
          <p className="legal-p">Clario&apos;s software, design, branding, and documentation are owned by Clario AI Ltd. and protected by copyright and trademark law. The Clario name and logo may not be used without written permission.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">8. Disclaimers and Limitation of Liability</h2>
          <p className="legal-p">Clario is provided &quot;as is.&quot; We do not guarantee 100% uptime or error-free operation. To the maximum extent permitted by law, Clario&apos;s total liability to you for any claim is limited to the amount you paid us in the 3 months preceding the claim.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">9. Termination</h2>
          <p className="legal-p">We may suspend or terminate your account if you violate these terms. You may delete your account at any time from Settings. Upon termination, your right to use Clario ceases immediately.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">10. Changes to These Terms</h2>
          <p className="legal-p">We may update these terms. We&apos;ll notify you by email at least 14 days before material changes take effect. Continued use after the effective date constitutes acceptance.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">11. Contact</h2>
          <p className="legal-p">Questions about these terms? Email <a href="mailto:legal@clario.ai" className="legal-a">legal@clario.ai</a>.</p>
        </div>
      </div>
      <MktFooter />
    </>
  );
}
