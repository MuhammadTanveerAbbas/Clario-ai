"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MktNav } from "@/components/marketing/MktNav";
import { MktFooter } from "@/components/marketing/MktFooter";

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
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

const FREE_FEATURES = [
  "100 AI requests/month",
  "AI Chat (Llama 3.1 8B)",
  "Text Summarizer (11 modes)",
  "YouTube URL → transcript",
  "1 Brand Voice",
  "Content Remix (3 formats)",
  "Email support",
];

const PRO_FEATURES = [
  "1,000 AI requests/month",
  "Everything in Free",
  "All 10 Remix formats",
  "Content Remix Studio",
  "3 Brand Voices",
  "Priority support",
  "Early access to new features",
];

const FAQ = [
  { q: "What counts as an AI request?", a: "Each summarization or chat message counts as one request. Remix Studio generates all formats in a single request  not 10 separate ones." },
  { q: "Can I upgrade or downgrade anytime?", a: "Yes. Upgrade instantly, downgrade at the end of your billing period. No contracts, no penalties." },
  { q: "What happens when I hit my request limit?", a: "You'll see a clear warning at 80% usage. Once the limit is reached, you can still view past outputs but won't be able to run new AI requests until you upgrade or your cycle resets." },
  { q: "Is there a free trial for Pro?", a: "The Free plan gives you 100 AI requests per month with no credit card required  a great way to try Clario before upgrading." },
  { q: "Do you offer refunds?", a: "Yes  if you're unsatisfied within 14 days of your first charge, contact us for a full refund, no questions asked." },
  { q: "What AI models power Clario?", a: "We use Groq's Llama 3.3 70B for summarization and Llama 3.1 8B for chat. These are state-of-the-art open models running on Groq's ultra-fast inference infrastructure." },
];

const TABLE_ROWS: [string, string, string][] = [
  ["AI requests/month", "100", "1,000"],
  ["Text Summarizer", "✓", "✓"],
  ["Summary modes", "11", "11"],
  ["YouTube URL → transcript", "✓", "✓"],
  ["AI Chat", "✓", "✓"],
  ["Brand Voices", "1", "3"],
  ["Remix formats", "3", "All 10"],
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
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--o:#f97316;--ol:#fff7ed;--om:#fed7aa;--bk:#0c0a09;--g7:#44403c;--g5:#78716c;--g4:#a8a29e;--g2:#e7e5e4;--g1:#f5f5f4;--g0:#fafaf9;--w:#fff;--serif:var(--font-fraunces),Georgia,serif;--sans:var(--font-inter),system-ui,sans-serif}
        body{font-family:var(--sans);background:var(--w);color:var(--bk);-webkit-font-smoothing:antialiased}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .price-hero{padding:72px 5% 56px;text-align:center;background:var(--w)}
        @media(max-width:480px){.price-hero{padding:48px 5% 40px}}
        .price-h1{font-family:var(--serif);font-size:clamp(2.2rem,4vw,3.4rem);font-weight:300;letter-spacing:-.03em;line-height:1.1;color:var(--bk);margin-bottom:10px}
        .price-h1 em{font-style:italic;color:var(--o)}
        .price-sub{font-size:.9rem;color:var(--g5);max-width:440px;margin:0 auto 28px;line-height:1.7}
        .toggle-wrap{display:inline-flex;align-items:center;gap:10px;background:var(--g1);border-radius:100px;padding:4px 6px;margin-bottom:48px}
        .toggle-opt{font-size:.78rem;font-weight:500;padding:5px 14px;border-radius:100px;cursor:pointer;border:none;font-family:var(--sans);transition:all .18s}
        .toggle-opt.active{background:var(--bk);color:#fff}
        .toggle-opt.inactive{background:transparent;color:var(--g5)}
        .save-badge{font-size:.62rem;font-weight:700;background:var(--ol);color:var(--o);border:1px solid var(--om);padding:2px 8px;border-radius:100px;letter-spacing:.04em}
        .p-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:740px;margin:0 auto}
        @media(max-width:540px){.p-grid{grid-template-columns:1fr}}
        .p-card{border-radius:20px;padding:32px;border:1.5px solid var(--g2);background:var(--w);position:relative;transition:transform .25s,box-shadow .25s;animation:fu .5s ease both}
        .p-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.08)}
        .p-card.feat{background:var(--bk);border-color:var(--bk)}
        .p-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--o);color:#fff;font-size:.62rem;font-weight:700;padding:3px 13px;border-radius:100px;letter-spacing:.08em;white-space:nowrap}
        .p-name{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--g4);margin-bottom:12px}
        .p-price{font-family:var(--serif);font-size:3rem;font-weight:300;letter-spacing:-.05em;line-height:1;color:var(--bk);margin-bottom:5px}
        .p-price sub{font-size:.88rem;font-family:var(--sans);font-weight:400;color:var(--g5);vertical-align:middle;letter-spacing:0}
        .p-desc{font-size:.8rem;color:var(--g5);margin-bottom:20px;line-height:1.55}
        .p-div{border:none;border-top:1px solid var(--g2);margin-bottom:18px}
        .p-list{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:24px}
        .p-item{display:flex;align-items:flex-start;gap:8px;font-size:.8rem;color:var(--g7)}
        .p-ck{width:16px;height:16px;border-radius:50%;background:var(--ol);color:var(--o);font-size:.55rem;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;margin-top:1px}
        .feat .p-name,.feat .p-price,.feat .p-desc,.feat .p-item{color:#fff!important}
        .feat .p-div{border-color:rgba(255,255,255,.1)}
        .feat .p-price sub{color:rgba(255,255,255,.4)!important}
        .feat .p-ck{background:rgba(249,115,22,.2)}
        .btn-free{width:100%;padding:12px;border-radius:10px;font-size:.84rem;font-weight:600;font-family:var(--sans);background:transparent;color:var(--bk);border:1.5px solid var(--g2);cursor:pointer;transition:all .2s;letter-spacing:-.01em}
        .btn-free:hover{background:var(--bk);color:#fff;border-color:var(--bk)}
        .btn-pro{width:100%;padding:12px;border-radius:10px;font-size:.84rem;font-weight:600;font-family:var(--sans);background:var(--o);color:#fff;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(249,115,22,.35);letter-spacing:-.01em;display:flex;align-items:center;justify-content:center;gap:7px}
        .btn-pro:hover{background:#ea6c0a;transform:translateY(-1px)}
        .spinner-sm{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
        .feat-table-wrap{max-width:860px;margin:0 auto;overflow-x:auto}
        .feat-table{width:100%;border-collapse:separate;border-spacing:0;font-family:var(--sans)}
        .feat-table th{text-align:center;padding:12px 16px;font-size:.8rem;font-weight:700;border-bottom:1.5px solid var(--g2);color:var(--g7)}
        .feat-table th.feature-col{text-align:left;color:var(--g5);font-weight:500}
        .feat-table th.highlight{color:var(--o);border-bottom-color:var(--o);background:var(--ol);border-radius:8px 8px 0 0}
        .feat-table td{padding:11px 16px;border-bottom:1px solid var(--g1);font-size:.82rem;color:var(--g7)}
        .feat-table td.highlight{background:var(--ol)}
        .feat-table tr:last-child td{border-bottom:none}
        .feat-table tr:nth-child(even){background:var(--g0)}
        .feat-table tr:nth-child(even) td.highlight{background:#fef3e2}
        .faq-item{border-bottom:1px solid var(--g2);padding:16px 0}
        .faq-q{display:flex;align-items:center;justify-content:space-between;cursor:pointer;gap:16px}
        .faq-q-text{font-size:.9rem;font-weight:500;color:var(--bk)}
        .faq-chevron{color:var(--g4);transition:transform .2s;flex-shrink:0}
        .faq-a{font-size:.84rem;color:var(--g5);line-height:1.7;margin-top:10px;padding-right:24px}
      `}</style>

      <MktNav />

      {/* Hero */}
      <div className="price-hero">
        <div style={{ fontSize: ".68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--o)", marginBottom: 12 }}>Pricing</div>
        <h1 className="price-h1">Simple pricing for<br /><em>serious creators.</em></h1>
        <p className="price-sub">Start free. Upgrade when you&apos;re ready. No surprises, no hidden fees.</p>

        <div className="toggle-wrap">
          <button className={`toggle-opt${!annual ? " active" : " inactive"}`} onClick={() => setAnnual(false)}>Monthly</button>
          <button className={`toggle-opt${annual ? " active" : " inactive"}`} onClick={() => setAnnual(true)}>Annual</button>
          {annual && <span className="save-badge">SAVE 21%</span>}
        </div>

        <div className="p-grid">
          <div className="p-card">
            <div className="p-name">Free</div>
            <div className="p-price">$0<sub>/mo</sub></div>
            <p className="p-desc">Everything to start repurposing. No card required.</p>
            <hr className="p-div" />
            <ul className="p-list">{FREE_FEATURES.map(f => <li key={f} className="p-item"><span className="p-ck">✓</span>{f}</li>)}</ul>
            <button className="btn-free" onClick={() => handleUpgrade("free")} disabled={loadingPlan === "free"}>Get started free</button>
          </div>
          <div className="p-card feat">
            <div className="p-badge">MOST POPULAR</div>
            <div className="p-name">Pro</div>
            <div className="p-price">${proPrice}<sub>/mo</sub></div>
            {annual && (
              <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.45)", marginBottom: 10 }}>
                ${annualTotal}/yr &nbsp;·&nbsp; save $48 vs monthly
              </div>
            )}
            <p className="p-desc">For creators who ship content every single day.</p>
            <hr className="p-div" />
            <ul className="p-list">{PRO_FEATURES.map(f => <li key={f} className="p-item"><span className="p-ck">✓</span>{f}</li>)}</ul>
            <button className="btn-pro" onClick={() => handleUpgrade("pro")} disabled={loadingPlan === "pro"}>
              {loadingPlan === "pro" && <div className="spinner-sm" />}
              {loadingPlan === "pro" ? "Redirecting..." : "Upgrade to Pro →"}
            </button>
          </div>
        </div>
        <p style={{ fontSize: ".72rem", color: "var(--g4)", marginTop: 18 }}>No card required on Free · Cancel anytime · 14-day money-back guarantee</p>
      </div>

      {/* Feature comparison table */}
      <section style={{ padding: "72px 5%", background: "var(--g0)", borderTop: "1px solid var(--g2)" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: ".62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--o)", marginBottom: 10 }}>Compare plans</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 300, letterSpacing: "-.03em", color: "var(--bk)" }}>
            Everything you need <em style={{ fontStyle: "italic", color: "var(--o)" }}>in one place.</em>
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
                  <td style={{ fontWeight: 500 }}>{f}</td>
                  <td style={{ textAlign: "center", color: fr === "" ? "var(--g2)" : "var(--g7)" }}>{fr}</td>
                  <td className="highlight" style={{ textAlign: "center", color: pr === "" ? "var(--g2)" : "var(--o)", fontWeight: pr !== "" && pr !== "✓" ? 600 : 400 }}>{pr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "72px 5%" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: ".62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--o)", marginBottom: 10 }}>FAQ</div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 300, letterSpacing: "-.03em", color: "var(--bk)" }}>
              Common <em style={{ fontStyle: "italic", color: "var(--o)" }}>questions.</em>
            </h2>
          </div>
          {FAQ.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--bk)", padding: "64px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 400, height: 400, background: "#f97316", borderRadius: "50%", filter: "blur(100px)", opacity: .07, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 300, color: "#fff", letterSpacing: "-.03em", marginBottom: 16, position: "relative" }}>
          Start creating today. <em style={{ color: "var(--o)" }}>It&apos;s free.</em>
        </h2>
        <p style={{ fontSize: ".88rem", color: "rgba(255,255,255,.38)", marginBottom: 28, position: "relative" }}>No card required. 100 AI requests a month on us.</p>
        <button className="btn-pro" onClick={() => router.push("/sign-up")} style={{ display: "inline-flex", width: "auto", padding: "13px 28px", position: "relative", fontSize: ".9rem" }}>
          Get started free
        </button>
      </section>

      <MktFooter />
    </>
  );
}
