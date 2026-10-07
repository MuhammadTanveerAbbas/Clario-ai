"use client";

const LEGAL_STYLES = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--o:#f97316;--ol:#fff7ed;--bk:#0c0a09;--g7:#44403c;--g5:#78716c;--g4:#a8a29e;--g2:#e7e5e4;--w:#fff;--serif:var(--font-fraunces),Georgia,serif;--sans:var(--font-inter),system-ui,sans-serif}
  body{font-family:var(--sans);background:var(--w);color:var(--bk);-webkit-font-smoothing:antialiased}
  .legal-wrap{max-width:740px;margin:0 auto;padding:64px 5% 80px}
  @media(max-width:480px){.legal-wrap{padding:40px 5% 60px}}
  .legal-h1{font-family:var(--serif);font-size:clamp(2rem,3.5vw,3rem);font-weight:300;letter-spacing:-.03em;color:var(--bk);margin-bottom:8px}
  .legal-h1 em{font-style:italic;color:var(--o)}
  .legal-meta{font-size:.78rem;color:var(--g4);margin-bottom:40px}
  .legal-section{margin-bottom:36px}
  .legal-h2{font-family:var(--serif);font-size:1.3rem;font-weight:300;letter-spacing:-.02em;color:var(--bk);margin-bottom:10px}
  .legal-p{font-size:.88rem;color:var(--g7);line-height:1.8;margin-bottom:10px}
  .legal-a{color:var(--o);text-decoration:none}
  .legal-a:hover{text-decoration:underline}
`;

export default function RefundPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LEGAL_STYLES }} />
      <div className="legal-wrap">
        <h1 className="legal-h1">Refund <em>Policy.</em></h1>
        <p className="legal-meta">Last updated: October 8, 2025 · Applies to all Pro plan purchases.</p>

        <div className="legal-section">
          <h2 className="legal-h2">1. Money-Back Guarantee</h2>
          <p className="legal-p">
            We offer a <strong>14-day money-back guarantee</strong> on all Pro plan ($19/month) purchases.
            If you&apos;re not satisfied with Clario for any reason, we&apos;ll refund your payment in full.
          </p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">2. Eligibility</h2>
          <p className="legal-p"><strong>2.1 Refund Window:</strong> Refund requests must be submitted within 14 days of the original purchase date.</p>
          <p className="legal-p"><strong>2.2 First Purchase Only:</strong> The 14-day guarantee applies to your first Pro plan ($19/month) purchase. Subsequent renewals are not eligible for refunds but can be cancelled to prevent future charges.</p>
          <p className="legal-p"><strong>2.3 Free Plan:</strong> The free plan (100 requests/month) has no charges and therefore no refunds apply.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">3. How to Request a Refund</h2>
          <p className="legal-p"><strong>3.1 Contact Support:</strong> Email <a href="mailto:support@clario.ai" className="legal-a">support@clario.ai</a> with your request and reason for refund.</p>
          <p className="legal-p"><strong>3.2 Provide Details:</strong> Include your account email and order/transaction ID.</p>
          <p className="legal-p"><strong>3.3 Processing Time:</strong> Refunds are processed within 5–10 business days after approval.</p>
          <p className="legal-p"><strong>3.4 Refund Method:</strong> Refunds are issued to the original payment method used for purchase via Stripe.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">4. Cancellation Policy</h2>
          <p className="legal-p"><strong>4.1 Cancel Anytime:</strong> You can cancel your Pro subscription ($19/month) anytime without penalty.</p>
          <p className="legal-p"><strong>4.2 Access Until End of Billing Period:</strong> You&apos;ll retain access to Pro features (1,000 requests/month) until the end of your current billing period.</p>
          <p className="legal-p"><strong>4.3 Automatic Downgrade:</strong> After cancellation, your account automatically reverts to the free plan (100 requests/month).</p>
          <p className="legal-p"><strong>4.4 Data Retention:</strong> All your data (summaries, chat history, and brand voices) remain intact after downgrade.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">5. Non-Refundable Situations</h2>
          <p className="legal-p"><strong>5.1 Outside 14-Day Window:</strong> Refund requests submitted after 14 days are not eligible.</p>
          <p className="legal-p"><strong>5.2 Subscription Renewals:</strong> Automatic renewal charges cannot be refunded. Cancel before renewal to prevent charges.</p>
          <p className="legal-p"><strong>5.3 Abuse or Violation:</strong> Accounts violating our Terms of Service are not eligible for refunds.</p>
          <p className="legal-p"><strong>5.4 Multiple Refund Requests:</strong> Repeated refund requests may result in account suspension.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">6. Billing Issues</h2>
          <p className="legal-p"><strong>6.1 Duplicate Charges:</strong> If you&apos;re charged twice, contact support immediately with proof. We&apos;ll investigate and refund duplicate charges.</p>
          <p className="legal-p"><strong>6.2 Unauthorized Charges:</strong> Report unauthorized charges within 14 days. We&apos;ll investigate and process refunds if applicable.</p>
          <p className="legal-p"><strong>6.3 Payment Failures:</strong> If a payment fails, you won&apos;t be charged. Retry payment or contact support for assistance.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">7. Chargeback Policy</h2>
          <p className="legal-p"><strong>7.1 Contact First:</strong> If you initiate a chargeback instead of requesting a refund through our process, your account may be suspended. We encourage you to contact support first.</p>
          <p className="legal-p"><strong>7.2 Chargeback Fees:</strong> Chargebacks incur fees from payment processors. These fees may be charged to you if the chargeback is found to be unjustified.</p>
          <p className="legal-p"><strong>7.3 Dispute Resolution:</strong> Stripe handles all chargeback disputes in accordance with card network rules.</p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">8. Contact Us</h2>
          <p className="legal-p"><strong>Service Provider:</strong> Muhammad Tanveer Abbas</p>
          <p className="legal-p">For refund requests or billing questions: <a href="mailto:support@clario.ai" className="legal-a">support@clario.ai</a> (response within 24 hours).</p>
          <p className="legal-p"><strong>Payment Processor:</strong> Stripe <a href="https://support.stripe.com" className="legal-a" target="_blank" rel="noopener noreferrer">support.stripe.com</a></p>
        </div>

        <div className="legal-section">
          <h2 className="legal-h2">9. Policy Changes</h2>
          <p className="legal-p">We may update this policy. Changes take effect immediately upon posting. Continued use of the service constitutes acceptance of updated terms.</p>
        </div>
      </div>
    </>
  );
}
