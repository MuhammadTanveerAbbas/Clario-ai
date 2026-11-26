"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <div className="faq-q" onClick={() => setOpen(o => !o)}>
        <span className="faq-q-text">{q}</span>
        <svg
          className="faq-chevron"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
         aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

const FREE_FEATURES = [
  "100 AI requests/month",
  "Chat + Summarizer",
  "10 summary modes",
  "1 Brand Voice",
  "3 Remix formats",
  "Email support",
];

const PRO_FEATURES = [
  "1,000 AI requests/month",
  "All 10 Remix formats",
  "Export to Notion / Google Docs",
  "AI Image Prompt Generator",
  "3 Brand Voices",
  "Priority support",
];

const FAQ = [
  { q: "What counts as a request?", a: "Each summarization or chat message counts as one request. Remix Studio generates all formats in a single request  not 10 separate ones." },
  { q: "Can I change plans?", a: "Yes. Upgrade instantly, downgrade at the end of your billing period. No contracts, no penalties." },
  { q: "What happens at the limit?", a: "You'll see a clear warning at 80% usage. Once the limit is reached, you can still view past outputs but won't be able to run new AI requests until you upgrade or your cycle resets." },
  { q: "When does Free open?", a: "The Free plan is coming soon with 100 AI requests per month and no credit card required. We will email you the moment it opens." },
  { q: "What is the refund window?", a: "Yes  if you're unsatisfied within 14 days of your first charge, contact us for a full refund, no questions asked." },
  { q: "Which models does Clario use?", a: "We use Groq's Llama 3.3 70B for summarization and Llama 3.1 8B for chat. These are state-of-the-art open models running on Groq's ultra-fast inference infrastructure." },
];

const TABLE_ROWS: [string, string, string][] = [
  ["AI requests/month", "100", "1,000"],
  ["Chat + Summarizer", "✓", "✓"],
  ["Summary modes", "10", "10"],
  ["Brand Voices", "1", "3"],
  ["Remix formats", "3", "All 10"],
  ["Export to Notion / Google Docs", "", "✓"],
  ["AI Image Prompt Generator", "", "✓"],
  ["Priority support", "", "✓"],
  ["Early access to features", "", "✓"],
];

export default function PricingPage() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const proPrice = annual ? 15 : 19;
  const annualTotal = proPrice * 12;

  const handleUpgrade = async (plan: "free" | "pro") => {
    setLoadingPlan(plan);
    if (plan === "free") { router.push("/sign-up"); return; }
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro", billing: annual ? "annual" : "monthly" }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else router.push("/sign-up?plan=pro");
    } catch {
      router.push("/sign-up?plan=pro");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <style>{`
        /* Hallmark · genre: editorial · hero: Poster (/pricing) */
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--o:var(--color-accent);--ol:var(--brand-soft);--om:#fed7aa;--bk:var(--color-ink);--g7:#44403c;--g5:var(--color-muted);--g4:var(--color-ink-2);--g2:#e7e5e4;--g1:#f5f5f4;--g0:var(--color-code-panel);--w:var(--color-paper);--serif:var(--font-fraunces),Georgia,serif;--sans:var(--font-inter),system-ui,sans-serif}
        body{font-family:var(--sans);background:var(--w);color:var(--bk);-webkit-font-smoothing:antialiased}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .price-hero{padding:32px 5% 24px;text-align:center;background:var(--w)}
        @media(max-width:480px){.price-hero{padding:32px 5% 24px}}
        .price-h1{font-family:var(--serif);font-size:clamp(2.2rem,4vw,3.4rem);font-weight:300;letter-spacing:-.03em;line-height:1.1;color:var(--bk);margin-bottom:10px}
        .price-h1 em{font-style:italic;color:var(--o)}
        .price-sub{font-size:.9rem;color:var(--g5);max-width:440px;margin:0 auto 28px;line-height:1.7}
        .toggle-wrap{display:inline-flex;align-items:center;gap:10px;background:var(--g1);border-radius:100px;padding:4px 6px;margin-bottom:24px}
        .toggle-opt{min-height:44px;font-size:.8125rem;font-weight:600;padding:8px 16px;border-radius:100px;cursor:pointer;border:none;font-family:var(--sans);transition:background .18s ease,color .18s ease}
        .toggle-opt.active{background:var(--bk);color:var(--color-paper)}
        .toggle-opt.inactive{background:transparent;color:var(--g5)}
        .save-badge{font-size:.75rem;font-weight:600;background:var(--ol);color:var(--o);border:1px solid var(--om);padding:2px 8px;border-radius:100px;letter-spacing:.04em}
        .p-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:760px;margin:0 auto;align-items:stretch}
        @media(max-width:540px){.p-grid{grid-template-columns:1fr}}
        .p-card{border-radius:16px;padding:24px;border:1.5px solid var(--g2);background:var(--w);position:relative;display:flex;flex-direction:column;transition:transform .25s,box-shadow .25s;animation:fu .5s ease both}
        .p-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.08)}
        .p-card.feat{background:var(--bk);border-color:var(--bk)}
        .p-card.soon{background:var(--g0);border-style:dashed}
        .p-card.soon:hover{transform:none;box-shadow:none}
        .p-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--o);color:var(--color-paper);font-size:.75rem;font-weight:600;padding:3px 13px;border-radius:100px;letter-spacing:.08em;white-space:nowrap}
        .p-name{font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--g4);margin-bottom:12px}
        .p-price{font-family:var(--serif);font-size:2.6rem;font-weight:300;letter-spacing:-.05em;line-height:1;color:var(--bk);margin-bottom:8px}
        .p-price sub{font-size:.88rem;font-family:var(--sans);font-weight:400;color:var(--g5);vertical-align:middle;letter-spacing:0;margin-left:2px}
        .p-desc{font-size:.82rem;color:var(--g5);margin-bottom:20px;line-height:1.55;min-height:2.4em}
        .p-div{border:none;border-top:1px solid var(--g2);margin-bottom:18px}
        .p-list{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
        .p-item{display:flex;align-items:flex-start;gap:9px;font-size:.8rem;line-height:1.45;color:var(--g7)}
        .p-ck{width:16px;height:16px;border-radius:50%;background:var(--ol);color:var(--o);font-size:.55rem;display:flex;align-items:center;justify-content:center;font-weight:600;flex-shrink:0;margin-top:1px}
        .feat .p-name{color:var(--color-rule)}
        .feat .p-price,.feat .p-desc,.feat .p-item{color:var(--color-paper)}
        .feat .p-div{border-color:rgba(255,255,255,.1)}
        .feat .p-price sub{color:var(--color-rule)}
        .feat .p-ck{background:rgba(249,115,22,.2)}
        .p-soon{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--w);color:var(--g5);border:1px solid var(--g2);font-size:.75rem;font-weight:600;padding:3px 12px;border-radius:100px;letter-spacing:.1em;white-space:nowrap}
        .p-live{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;background:var(--color-success);border:1px solid var(--color-success);color:var(--color-paper);font-size:.75rem;font-weight:600;padding:5px 10px;border-radius:100px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
        .p-live-dot{width:6px;height:6px;border-radius:50%;background:var(--color-paper)}
        .p-soon-note{font-size:.75rem;font-weight:600;color:var(--g5);margin-bottom:4px}
        .p-soon-sub{font-size:.75rem;color:var(--g4);margin-bottom:18px;line-height:1.55}
        .p-list+.p-soon-note{margin-top:auto}
        .btn-free{width:100%;padding:12px;border-radius:10px;font-size:.84rem;font-weight:600;font-family:var(--sans);background:transparent;color:var(--bk);border:1.5px solid var(--g2);cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease;letter-spacing:-.01em;margin-top:auto}
        .btn-free:disabled{color:var(--g4);border-color:var(--g2);cursor:not-allowed;background:var(--w)}
        .btn-free:hover:not(:disabled){background:var(--bk);color:var(--color-paper);border-color:var(--bk)}
        .btn-pro{width:100%;padding:12px;border-radius:10px;font-size:.84rem;font-weight:600;font-family:var(--sans);background:var(--o);color:var(--color-paper);border:none;cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease;letter-spacing:-.01em;display:flex;align-items:center;justify-content:center;gap:7px;margin-top:auto}
        .btn-pro:hover{background:var(--color-accent-hover);transform:translateY(-1px)}
        .spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:var(--color-paper);border-radius:50%;animation:spin .7s linear infinite}
        .feat-table-wrap{max-width:860px;margin:0 auto;overflow-x:auto}
        .feat-table{width:100%;border-collapse:separate;border-spacing:0;font-family:var(--sans)}
        .feat-table th{text-align:center;padding:12px 16px;font-size:.8rem;font-weight:600;border-bottom:1.5px solid var(--g2);color:var(--g7)}
        .feat-table th.feature-col{text-align:left;color:var(--g5);font-weight:600}
        .feat-table th.highlight{color:var(--o);border-bottom-color:var(--o);background:var(--ol);border-radius:8px 8px 0 0}
        .feat-table td{padding:11px 16px;border-bottom:1px solid var(--g1);font-size:.82rem;color:var(--g7)}
        .feat-table td.highlight{background:var(--ol)}
        .feat-table tr:last-child td{border-bottom:none}
        .feat-table tr:nth-child(even){background:var(--g0)}
        .feat-table tr:nth-child(even) td.highlight{background:#fef3e2}
        .faq-item{border-bottom:1px solid var(--g2);padding:16px 0}
        .faq-q{display:flex;align-items:center;justify-content:space-between;cursor:pointer;gap:16px}
        .faq-q-text{font-size:.9rem;font-weight:600;color:var(--bk)}
        .faq-chevron{color:var(--g4);transition:transform .2s;flex-shrink:0}
        .faq-a{font-size:.84rem;color:var(--g5);line-height:1.7;margin-top:10px;padding-right:24px}
        .price-hero + section,section + section{margin-top:120px}
      `}</style>

      {/* Hero */}
      <div className="price-hero">
        <h1 className="price-h1">Simple, honest<br /><span>pricing.</span></h1>
        <p className="price-sub">Free opens soon. Pro is live today.</p>

        <div className="toggle-wrap">
          <button className={`toggle-opt${!annual ? " active" : " inactive"}`} onClick={() => setAnnual(false)}>Monthly</button>
          <button className={`toggle-opt${annual ? " active" : " inactive"}`} onClick={() => setAnnual(true)}>Annual</button>
          {annual && <span className="save-badge">SAVE 21%</span>}
        </div>

        <div className="p-grid">
          <div className="p-card soon">
            <div className="p-soon">COMING SOON</div>
            <div className="p-name">Free</div>
            <div className="p-price">$0<sub>/mo</sub></div>
            <p className="p-desc">Everything to get started.</p>
            <hr className="p-div" />
            <ul className="p-list">{FREE_FEATURES.map(f => <li key={f} className="p-item"><span className="p-ck">✓</span>{f}</li>)}</ul>
            <p className="p-soon-sub">We will email you at launch.</p>
            <button className="btn-free" disabled>Available soon</button>
          </div>
          <div className="p-card feat">
            <div className="p-badge">MOST POPULAR</div>
            <div className="p-live"><span className="p-live-dot" />Live now</div>
            <div className="p-name">Pro</div>
            <div className="p-price">${proPrice}<sub>/mo</sub></div>
            {annual && (
              <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.45)", marginBottom: 10 }}>
                ${annualTotal}/yr &nbsp;·&nbsp; save $48 vs monthly
              </div>
            )}
            <p className="p-desc">For daily content work.</p>
            <hr className="p-div" />
            <ul className="p-list">{PRO_FEATURES.map(f => <li key={f} className="p-item"><span className="p-ck">✓</span>{f}</li>)}</ul>
            <button className="btn-pro" onClick={() => handleUpgrade("pro")} disabled={loadingPlan === "pro"}>
              {loadingPlan === "pro" && <div className="spinner-sm" />}
              {loadingPlan === "pro" ? "Redirecting..." : "Upgrade to Pro"}
              {loadingPlan !== "pro" && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <p style={{ fontSize: ".75rem", color: "var(--g4)", marginTop: 18 }}>Billed monthly, cancel any time</p>
      </div>

      {/* Feature comparison table */}
      <section style={{ padding: "120px 5%", background: "var(--g0)", borderTop: "1px solid var(--g2)" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: ".75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--o)", marginBottom: 10 }}>Compare plans</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.25rem,3.6vw,3.25rem)", fontWeight: 300, letterSpacing: "-.03em", color: "var(--bk)" }}>
            Everything you need <span style={{ color: "var(--o)" }}>in one place.</span>
          </h2>
        </div>
        <div className="feat-table-wrap">
          <table className="feat-table">
            <thead>
              <tr>
                <th className="feature-col" style={{ width: "44%" }}>Feature</th>
                <th>Free</th>
                <th className="highlight">Pro</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map(([f, fr, pr]) => (
                <tr key={f}>
                  <td style={{ fontWeight: 600 }}>{f}</td>
                  <td style={{ textAlign: "center", color: fr === "" ? "var(--g2)" : "var(--g7)" }}>{fr}</td>
                  <td className="highlight" style={{ textAlign: "center", color: pr === "" ? "var(--g2)" : "var(--o)", fontWeight: pr !== "" && pr !== "✓" ? 600 : 400 }}>{pr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "120px 5%" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.25rem,3.6vw,3.25rem)", fontWeight: 300, letterSpacing: "-.03em", color: "var(--bk)" }}>
              Common <span style={{ color: "var(--o)" }}>questions.</span>
            </h2>
          </div>
          {FAQ.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--bk)", padding: "80px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "var(--color-paper)", letterSpacing: "-.03em", marginBottom: 16, position: "relative" }}>
          Start with <span style={{ color: "var(--o)" }}>Pro.</span>
        </h2>
        <p style={{ fontSize: ".88rem", color: "var(--color-rule)", marginBottom: 28, position: "relative" }}>Pro is live. Free opens soon.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 960, margin: "0 auto", position: "relative" }}>
          <div style={{ padding: "12px 16px", border: "1px solid var(--color-rule)", borderRadius: 8, fontSize: ".8125rem", color: "var(--color-rule)" }}>Monthly or annual</div>
          <div style={{ padding: "12px 16px", border: "1px solid var(--color-rule)", borderRadius: 8, fontSize: ".8125rem", color: "var(--color-rule)" }}>Cancel any time</div>
          <div style={{ padding: "12px 16px", border: "1px solid var(--color-rule)", borderRadius: 8, fontSize: ".8125rem", color: "var(--color-rule)" }}>Free opens soon</div>
        </div>

      </section>
    </>
  );
}
