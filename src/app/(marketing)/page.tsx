"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

function TypingEffect() {
  const phrases = ["Twitter thread","LinkedIn post","email newsletter","YouTube description","podcast show notes","blog outline","Instagram caption"];
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const full = phrases[idx];
    if (!del && text.length < full.length) { const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 50); return () => clearTimeout(t); }
    if (!del && text.length === full.length) { const t = setTimeout(() => setDel(true), 2000); return () => clearTimeout(t); }
    if (del && text.length > 0) { const t = setTimeout(() => setText(text.slice(0, -1)), 25); return () => clearTimeout(t); }
    if (del && text.length === 0) { setDel(false); setIdx((idx + 1) % phrases.length); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, del, idx]);
  return <span>{text}<span style={{ color: "#f97316", animation: "blink .85s infinite" }}>|</span></span>;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let v = 0; const step = to / 80;
    const i = setInterval(() => { v = Math.min(v + step, to); setVal(Math.floor(v)); if (v >= to) clearInterval(i); }, 16);
    return () => clearInterval(i);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function HeroMockup() {
  const [tab, setTab] = useState(0);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let p = 0;
      const i = setInterval(() => { p += 2; setProg(Math.min(p, 100)); if (p >= 100) clearInterval(i); }, 14);
      return () => clearInterval(i);
    }, 700);
    return () => clearTimeout(t);
  }, []);
  const tabs = ["Summarizer","Remix","Chat","Brand Voice"];
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e7e5e4", boxShadow: "0 28px 72px rgba(0,0,0,.11)", overflow: "hidden", width: "100%", maxWidth: 600, fontFamily: "Geist, system-ui, sans-serif" }}>
      <div style={{ background: "#fafaf9", borderBottom: "1px solid #e7e5e4", padding: "10px 14px", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ display: "flex", gap: 5 }}>{["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}</div>
        <div style={{ flex: 1, background: "#eeede8", borderRadius: 5, padding: "3px 10px", fontSize: 11, color: "#a8a29e", textAlign: "center" }}>app.clario.ai/summarizer</div>
        <div style={{ width: 44 }} />
      </div>
      <div style={{ display: "flex", minHeight: 340 }}>
        <div style={{ width: 46, background: "#fafaf9", borderRight: "1px solid #f0efee", padding: "10px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          {[0,1,2,3].map(i => (
            <button key={i} onClick={() => setTab(i)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer", background: tab === i ? "#fff7ed" : "transparent", color: tab === i ? "#f97316" : "#a8a29e", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .18s" }}>
              {[
                <svg key="s" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                <svg key="r" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
                <svg key="c" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                <svg key="b" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
              ][i]}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 2, background: "#f2f1ef", borderRadius: 8, padding: 3 }}>
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{ flex: 1, padding: "4px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, background: tab === i ? "#fff" : "transparent", color: tab === i ? "#0c0a09" : "#a8a29e", boxShadow: tab === i ? "0 1px 4px rgba(0,0,0,.08)" : "none", transition: "all .18s", fontFamily: "Geist, system-ui, sans-serif" }}>{t}</button>
            ))}
          </div>
          {tab === 0 && <>
            <div style={{ background: "#fafaf9", border: "1px solid #e7e5e4", borderRadius: 9, padding: 11, fontSize: 10, color: "#78716c", lineHeight: 1.65 }}>
              <span style={{ color: "#a8a29e", fontSize: 9, display: "block", marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>YouTube URL or paste text</span>
              &ldquo;Just finished recording my deep dive on content strategy for creators. Covered ideation, distribution, monetization...&rdquo;
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["Executive Brief","Action Items","SWOT","ELI5","Brutal Roast"].map((m,i) => (
                <span key={m} style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: i===0?"#fff7ed":"#f5f5f4", color: i===0?"#f97316":"#78716c", border: i===0?"1px solid #fed7aa":"1px solid transparent", cursor: "pointer" }}>{m}</span>
              ))}
            </div>
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 9, padding: 11 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 7 }}>Executive Brief</div>
              <div style={{ fontSize: 10, color: "#44403c", lineHeight: 1.7 }}>A comprehensive content strategy framework covering ideation pipelines, multi-platform distribution, revenue diversification, and long-term audience trust-building.</div>
              <div style={{ marginTop: 9, height: 3, background: "#fed7aa", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${prog}%`, background: "#f97316", borderRadius: 100, transition: "width .08s linear" }} />
              </div>
            </div>
          </>}
          {tab === 1 && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[["#f97316","#fff7ed","Twitter Thread"],["#0ea5e9","#f0f9ff","LinkedIn Post"],["#8b5cf6","#faf5ff","Newsletter"],["#10b981","#f0fdf4","YT Description"],["#f43f5e","#fff1f2","Podcast Notes"],["#f59e0b","#fffbeb","Blog Outline"]].map(([c,bg,l]) => (
                <div key={l} style={{ padding: "8px 11px", borderRadius: 9, background: bg, display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: c }}>{l}</span>
                </div>
              ))}
            </div>
            <button style={{ background: "#0c0a09", color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Generate all 10 formats →</button>
          </>}
          {tab === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[{u:true,m:"What should my Q1 content strategy be?"},{u:false,m:"Based on your brand voice, I'd recommend anchoring on long-form YouTube, then repurposing each into a thread + newsletter weekly..."},{u:true,m:"Turn my last video into a Twitter thread"}].map((msg,i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.u?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth: "82%", padding: "8px 11px", borderRadius: msg.u?"12px 12px 2px 12px":"12px 12px 12px 2px", background: msg.u?"#0c0a09":"#f5f5f4", color: msg.u?"#fff":"#44403c", fontSize: 10, lineHeight: 1.6 }}>{msg.m}</div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ display: "flex", gap: 3 }}>{[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316", animation: `pulse 1.4s ${i*.2}s infinite` }} />)}</div>
                <span style={{ fontSize: 9, color: "#a8a29e" }}>Clario is writing...</span>
              </div>
            </div>
          )}
          {tab === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ background: "#fafaf9", border: "1px solid #e7e5e4", borderRadius: 9, padding: 11 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 9 }}>Your Brand Voice</div>
                {[["Conversational tone",87,"#f97316"],["Vocabulary richness",71,"#0ea5e9"],["Brand personality",94,"#10b981"]].map(([l,p,c]) => (
                  <div key={String(l)} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 9, color: "#78716c" }}>{String(l)}</span><span style={{ fontSize: 9, color: "#a8a29e" }}>{p}%</span></div>
                    <div style={{ height: 3, background: "#f0efee", borderRadius: 100, overflow: "hidden" }}><div style={{ height: "100%", width: `${p}%`, background: String(c), borderRadius: 100 }} /></div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 9 }}>✓ Brand voice active. Applied to all AI outputs.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonTable() {
  const { ref, inView } = useInView(0.1);
  const features = [
    { feature: "AI Text Summarizer", clario: true, jasper: true, copy: false, notion: false },
    { feature: "10 summary modes incl. Brutal Roast", clario: true, jasper: false, copy: false, notion: false },
    { feature: "YouTube URL → auto transcript", clario: true, jasper: false, copy: false, notion: false },
    { feature: "Content Remix Studio (10 formats)", clario: true, jasper: true, copy: true, notion: false },
    { feature: "Brand Voice Library", clario: true, jasper: true, copy: true, notion: false },
    { feature: "AI Chat with creator prompts", clario: true, jasper: false, copy: false, notion: true },
    { feature: "Free tier available", clario: true, jasper: false, copy: true, notion: true },
    { feature: "Starting price", clario: "$0", jasper: "$49/mo", copy: "$49/mo", notion: "$10/mo" },
  ];
  const tools = ["Clario","Jasper","Copy.ai","Notion AI"];
  const Check = ({ val }: { val: boolean | string }) => {
    if (typeof val === "string") return <span style={{ fontSize: ".78rem", fontWeight: 600, color: "#f97316" }}>{val}</span>;
    return val
      ? <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}><span style={{ color: "#15803d", fontSize: ".6rem", fontWeight: 800 }}>✓</span></div>
      : <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#f9fafb", border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}><span style={{ color: "#d1d5db", fontSize: ".65rem" }}>–</span></div>;
  };
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: "all .6s ease", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontFamily: "Geist, system-ui, sans-serif" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "12px 16px", fontSize: ".78rem", fontWeight: 600, color: "#78716c", borderBottom: "1.5px solid #e7e5e4", width: "36%" }}>Feature</th>
            {tools.map((t, i) => (
              <th key={t} style={{ textAlign: "center", padding: "12px 16px", fontSize: ".82rem", fontWeight: 700, color: i === 0 ? "#f97316" : "#44403c", borderBottom: `1.5px solid ${i===0?"#f97316":"#e7e5e4"}`, background: i===0?"#fff7ed":"transparent", borderRadius: i===0?"8px 8px 0 0":"0", position: "relative" }}>
                {i === 0 && <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#f97316", color: "#fff", fontSize: ".6rem", fontWeight: 700, padding: "2px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>YOU ARE HERE</span>}
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((row, ri) => (
            <tr key={row.feature} style={{ background: ri % 2 === 0 ? "#fafaf9" : "#fff" }}>
              <td style={{ padding: "11px 16px", fontSize: ".82rem", color: "#44403c", borderBottom: "1px solid #f5f5f4", fontWeight: 500 }}>{row.feature}</td>
              {[row.clario, row.jasper, row.copy, row.notion].map((v, ci) => (
                <td key={ci} style={{ textAlign: "center", padding: "11px 16px", borderBottom: "1px solid #f5f5f4", background: ci===0?"#fffbf7":"transparent" }}>
                  <Check val={v} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const remixFormats = [
    { icon: "𝕏", label: "Twitter Thread", preview: "🧵 I just analyzed 500 creator accounts.\n\nHere's the ONE system that separates 7-figure creators from everyone else:\n\n1/ They don't create MORE content.\n   They repurpose SMARTER.\n\n2/ One video → 10 formats → 10x the reach\n   Same effort. Exponential results." },
    { icon: "in", label: "LinkedIn Post", preview: "After 3 years building in public, here's what I wish someone told me:\n\nThe creators winning in 2025 aren't publishing the most.\nThey're publishing the smartest.\n\nOne anchor piece → repurposed everywhere → compounding reach with zero extra effort." },
    { icon: "✉", label: "Newsletter", preview: "Subject: The content OS that changed everything\n\nHey [First Name],\n\nI used to spend 20 hours/week creating content.\nNow I spend 4  and reach 10x more people.\n\nHere's the exact framework:" },
    { icon: "▶", label: "YT Description", preview: "In this video, I break down the complete repurposing system I use to turn ONE video into 10+ pieces across every platform.\n\n00:00 Intro\n02:14 The anchor content framework\n08:30 AI repurposing walkthrough\n\n🔗 Try Clario free → clario.ai" },
    { icon: "🎙", label: "Podcast Notes", preview: "Episode 47  The Content Repurposing OS\n\nTop Takeaways:\n→ Anchor content is your foundation\n→ AI handles the repurposing layer\n→ Distribution is the new creation\n\nResources: Clario (clario.ai), Notion, Descript" },
  ];
  const [remixActive, setRemixActive] = useState(0);
  const [remixFading, setRemixFading] = useState(false);
  const { ref: demoRef, inView: demoInView } = useInView(0.2);

  const handleRemix = (i: number) => {
    if (i === remixActive) return;
    setRemixFading(true);
    setTimeout(() => { setRemixActive(i); setRemixFading(false); }, 180);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=Geist:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--o:#f97316;--ol:#fff7ed;--om:#fed7aa;--bk:#0c0a09;--g7:#44403c;--g5:#78716c;--g4:#a8a29e;--g2:#e7e5e4;--g1:#f5f5f4;--g0:#fafaf9;--w:#fff;--serif:'Fraunces',Georgia,serif;--sans:'Geist',system-ui,sans-serif}
        html{scroll-behavior:smooth}
        body{font-family:var(--sans);background:var(--w);color:var(--bk);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        nav.ln{position:fixed;inset:0 0 auto;z-index:100;height:58px;padding:0 5%;display:flex;align-items:center;justify-content:space-between;transition:all .3s}
        nav.ln.up{background:rgba(255,255,255,.9);backdrop-filter:blur(18px);box-shadow:0 1px 0 var(--g2)}
        .logo-w{font-family:var(--serif);font-size:1.3rem;color:var(--bk);text-decoration:none;display:flex;align-items:center;gap:8px;font-weight:300;letter-spacing:-.02em}
        .lm{width:26px;height:26px;background:var(--o);border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .nl{display:flex;align-items:center;gap:24px;list-style:none}
        .nl a{font-size:.82rem;color:var(--g5);text-decoration:none;transition:color .18s;font-weight:400}
        .nl a:hover{color:var(--bk)}
        .np{display:flex;align-items:center;gap:9px}
        .btn-n{background:var(--bk);color:var(--w);padding:9px 20px;border-radius:9px;font-size:.82rem;font-weight:600;border:none;cursor:pointer;font-family:var(--sans);letter-spacing:-.01em;transition:all .2s}
        .btn-n:hover{background:var(--o);transform:translateY(-1px)}
        .nav-hamburger{display:none;background:none;border:none;cursor:pointer;padding:6px;color:var(--bk);flex-shrink:0}
        .mobile-nav{display:none;position:fixed;inset:0;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);z-index:200;flex-direction:column;align-items:center;justify-content:center;gap:28px}
        .mobile-nav.open{display:flex}
        .mobile-nav a{font-family:var(--serif);font-size:1.6rem;font-weight:300;color:var(--bk);text-decoration:none;letter-spacing:-.02em}
        .mobile-nav-close{position:absolute;top:18px;right:5%;background:none;border:none;cursor:pointer;color:var(--bk);padding:6px}
        .mobile-nav-cta{background:var(--bk);color:var(--w);padding:13px 36px;border-radius:10px;font-size:.9rem;font-weight:600;border:none;cursor:pointer;font-family:var(--sans);margin-top:8px;transition:background .2s}
        .mobile-nav-cta:hover{background:var(--o)}
        @media(max-width:680px){.nl{display:none}.np{display:none}.nav-hamburger{display:flex}}
        .hero{min-height:100vh;padding:96px 5% 72px;display:grid;grid-template-columns:1fr 1.1fr;gap:52px;align-items:center;max-width:1160px;margin:0 auto}
        @media(max-width:860px){.hero{grid-template-columns:1fr;text-align:center;padding-top:88px;gap:36px}}
        @media(max-width:480px){.hero{padding:80px 4% 48px;gap:28px}}
        .h-badge{display:inline-flex;align-items:center;gap:7px;background:var(--ol);border:1px solid var(--om);color:var(--o);font-size:.68rem;font-weight:600;padding:4px 11px;border-radius:100px;margin-bottom:18px;letter-spacing:.04em;animation:fu .6s ease both}
        .h-dot{width:6px;height:6px;background:var(--o);border-radius:50%;animation:pulse 1.5s infinite}
        .h-h1{font-family:var(--serif);font-size:clamp(2.4rem,4vw,3.8rem);line-height:1.06;letter-spacing:-.03em;font-weight:300;margin-bottom:9px;color:var(--bk);animation:fu .6s .1s ease both}
        .h-h1 em{font-style:italic;color:var(--o)}
        .h-h1 strong{font-weight:400}
        .h-typ{font-family:var(--serif);font-size:clamp(1.1rem,2.2vw,1.6rem);color:var(--g4);font-style:italic;font-weight:300;margin-bottom:20px;min-height:2.2rem;letter-spacing:-.02em;animation:fu .6s .15s ease both}
        .h-sub{font-size:.9rem;color:var(--g5);line-height:1.75;max-width:440px;margin-bottom:30px;animation:fu .6s .2s ease both}
        @media(max-width:860px){.h-sub{margin:0 auto 30px}}
        .h-ctas{display:flex;gap:11px;flex-wrap:wrap;margin-bottom:28px;animation:fu .6s .25s ease both}
        @media(max-width:860px){.h-ctas{justify-content:center}}
        .btn-p{background:var(--bk);color:var(--w);padding:12px 24px;border-radius:9px;font-size:.86rem;font-weight:600;border:none;cursor:pointer;font-family:var(--sans);letter-spacing:-.01em;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
        .btn-p:hover{background:var(--o);transform:translateY(-2px);box-shadow:0 8px 24px rgba(249,115,22,.28)}
        .btn-s{background:var(--w);color:var(--g7);padding:12px 20px;border-radius:9px;font-size:.86rem;font-weight:500;border:1.5px solid var(--g2);cursor:pointer;font-family:var(--sans);letter-spacing:-.01em;transition:all .2s}
        .btn-s:hover{border-color:var(--bk);color:var(--bk)}
        .h-soc{display:flex;align-items:center;gap:10px;animation:fu .6s .3s ease both}
        @media(max-width:860px){.h-soc{justify-content:center}}
        .avs{display:flex}
        .av{width:26px;height:26px;border-radius:50%;border:2px solid var(--w);font-size:.58rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin-left:-6px}
        .av:first-child{margin-left:0}
        .soc-t{font-size:.76rem;color:var(--g5)}
        .soc-t strong{color:var(--bk);font-weight:600}
        .stars-sm{color:var(--o);font-size:.65rem;letter-spacing:1px}
        .mq-w{overflow:hidden;padding:14px 0;border-top:1px solid var(--g2);border-bottom:1px solid var(--g2)}
        .mq-t{display:flex;animation:mq 28s linear infinite;white-space:nowrap}
        .mq-i{display:inline-flex;align-items:center;gap:9px;padding:0 24px;font-size:.72rem;font-weight:500;color:var(--g4);letter-spacing:.05em}
        .mq-d{width:4px;height:4px;border-radius:50%;background:var(--om);flex-shrink:0}
        .stats-g{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:var(--g2);border-radius:16px;overflow:hidden;max-width:860px;margin:0 auto}
        @media(max-width:560px){.stats-g{grid-template-columns:repeat(2,1fr)}}
        .stat-c{background:var(--w);padding:26px 20px;text-align:center}
        .stat-n{font-family:var(--serif);font-size:2.2rem;font-weight:300;letter-spacing:-.04em;line-height:1;color:var(--bk);margin-bottom:5px}
        .stat-n em{font-style:normal;color:var(--o)}
        .stat-l{font-size:.72rem;color:var(--g4);font-weight:400}
        .b-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
        @media(max-width:860px){.b-grid>*{grid-column:span 12!important}}
        .b-card{background:var(--w);border-radius:18px;border:1px solid var(--g2);overflow:hidden;transition:transform .25s,box-shadow .25s}
        .b-card:hover{transform:translateY(-4px);box-shadow:0 14px 44px rgba(0,0,0,.08)}
        .b-in{padding:26px}
        .b-tag{font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--o);margin-bottom:10px}
        .b-title{font-family:var(--serif);font-size:1.3rem;font-weight:300;letter-spacing:-.03em;line-height:1.2;color:var(--bk);margin-bottom:8px}
        .b-title em{font-style:italic;color:var(--o)}
        .b-desc{font-size:.82rem;color:var(--g5);line-height:1.7}
        .demo-box{border-radius:18px;border:1px solid var(--g2);background:var(--w);overflow:hidden;box-shadow:0 6px 36px rgba(0,0,0,.05);display:grid;grid-template-columns:280px 1fr}
        @media(max-width:760px){.demo-box{grid-template-columns:1fr}}
        .comp-wrap{overflow-x:auto;border-radius:18px;border:1px solid var(--g2);box-shadow:0 6px 24px rgba(0,0,0,.05)}
        .p-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:680px;margin:0 auto}
        @media(max-width:520px){.p-grid{grid-template-columns:1fr}}
        .p-card{border-radius:18px;padding:30px;border:1.5px solid var(--g2);background:var(--w);position:relative;transition:transform .25s,box-shadow .25s}
        .p-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.07)}
        .p-card.feat{background:var(--bk);border-color:var(--bk)}
        .p-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--o);color:#fff;font-size:.6rem;font-weight:700;padding:3px 12px;border-radius:100px;letter-spacing:.08em;white-space:nowrap}
        .p-plan{font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--g4);margin-bottom:10px}
        .p-price{font-family:var(--serif);font-size:2.8rem;font-weight:300;letter-spacing:-.05em;line-height:1;color:var(--bk);margin-bottom:5px}
        .p-price sub{font-size:.82rem;font-family:var(--sans);font-weight:400;color:var(--g5);letter-spacing:0;vertical-align:middle}
        .p-desc{font-size:.78rem;color:var(--g5);margin-bottom:18px;line-height:1.5}
        .p-div{border:none;border-top:1px solid var(--g2);margin-bottom:16px}
        .p-card.feat .p-plan,.p-card.feat .p-price,.p-card.feat .p-desc,.p-card.feat .p-item{color:#fff!important}
        .p-card.feat .p-div{border-color:rgba(255,255,255,.1)}
        .p-card.feat .p-price sub{color:rgba(255,255,255,.4)!important}
        .p-list{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
        .p-item{display:flex;align-items:flex-start;gap:8px;font-size:.8rem;color:var(--g7)}
        .p-ck{width:15px;height:15px;border-radius:50%;background:var(--ol);color:var(--o);font-size:.52rem;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;margin-top:1px}
        .p-card.feat .p-ck{background:rgba(249,115,22,.2)}
        .btn-pf{width:100%;padding:11px;border-radius:9px;font-size:.8rem;font-weight:600;font-family:var(--sans);background:transparent;color:var(--bk);border:1.5px solid var(--g2);cursor:pointer;transition:all .2s;letter-spacing:-.01em}
        .btn-pf:hover{background:var(--bk);color:var(--w);border-color:var(--bk)}
        .btn-pp{width:100%;padding:11px;border-radius:9px;font-size:.8rem;font-weight:600;font-family:var(--sans);background:var(--o);color:#fff;border:none;cursor:pointer;transition:all .2s;box-shadow:0 3px 14px rgba(249,115,22,.35);letter-spacing:-.01em}
        .btn-pp:hover{background:#ea6c0a;transform:translateY(-1px)}
        .finale{background:var(--bk);padding:80px 5%;text-align:center;position:relative;overflow:hidden}
        @media(max-width:480px){.finale{padding:48px 4%}}
        .f-glow{position:absolute;width:440px;height:440px;background:var(--o);border-radius:50%;filter:blur(110px);opacity:.08;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
        .f-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);background-size:36px 36px;pointer-events:none}
        footer.lf{border-top:1px solid var(--g2);padding:30px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        @media(max-width:480px){footer.lf{padding:20px 4%;flex-direction:column;align-items:flex-start}}
        .f-links{display:flex;gap:20px;list-style:none}
        .f-links a{font-size:.75rem;color:var(--g5);text-decoration:none;transition:color .15s}
        .f-links a:hover{color:var(--bk)}
        .f-copy{font-size:.7rem;color:var(--g4)}
        .sec{padding:80px 5%}
        @media(max-width:768px){.sec{padding:56px 4%}}
        @media(max-width:480px){.sec{padding:40px 4%}}
        .sec-w{max-width:1060px;margin:0 auto}
        .sec-h{text-align:center;margin-bottom:44px}
        .s-tag{font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--o);margin-bottom:10px}
        .s-title{font-family:var(--serif);font-size:clamp(1.8rem,3vw,2.6rem);font-weight:300;letter-spacing:-.03em;line-height:1.1;color:var(--bk);margin-bottom:8px}
        .s-title em{font-style:italic;color:var(--o)}
        .s-sub{font-size:.86rem;color:var(--g5);line-height:1.7;max-width:440px;margin:0 auto}
      `}</style>

      <nav className={`ln${scrolled ? " up" : ""}`}>
        <a href="/" className="logo-w">
          <div className="lm">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          Clario
        </a>
        <ul className="nl">
          <li><a href="/#features">Features</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/#compare">Compare</a></li>
        </ul>
        <div className="np">
          {user ? (
            <>
              <button className="btn-n" style={{ background: "transparent", color: "var(--g7)", border: "1.5px solid var(--g2)" }} onClick={() => window.location.href="/dashboard"}>
                Dashboard
              </button>
              <button className="btn-n" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <button className="btn-n" onClick={() => window.location.href="/sign-up"}>
              Get started free
            </button>
          )}
        </div>
        <button className="nav-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </nav>

      <div className={`mobile-nav${mobileOpen ? " open" : ""}`}>
        <button className="mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <a href="/#features" onClick={() => setMobileOpen(false)}>Features</a>
        <a href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
        <a href="/#compare" onClick={() => setMobileOpen(false)}>Compare</a>
        {user ? (
          <>
            <button className="mobile-nav-cta" style={{ background: "transparent", color: "var(--bk)", border: "1.5px solid var(--g2)" }} onClick={() => { window.location.href = "/dashboard"; setMobileOpen(false); }}>
              Dashboard
            </button>
            <button className="mobile-nav-cta" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
              Sign out
            </button>
          </>
        ) : (
          <button className="mobile-nav-cta" onClick={() => { window.location.href = "/sign-up"; setMobileOpen(false); }}>
            Get started free
          </button>
        )}
      </div>

      <section style={{ background: "var(--w)" }}>
        <div className="hero">
          <div>
            <div className="h-badge"><span className="h-dot" />Built for content creators</div>
            <h1 className="h-h1">Your content,<br /><em>repurposed</em> for<br /><strong>every platform.</strong></h1>
            <p className="h-typ">Turn any idea into a <TypingEffect /></p>
            <p className="h-sub">Clario is the AI toolkit built specifically for YouTubers, podcasters, and bloggers. Summarize, remix, and repurpose your content  in seconds, in your voice.</p>
            <div className="h-ctas">
              <button className="btn-p" onClick={() => window.location.href="/sign-up"}>
                Start for free <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button className="btn-s" onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}>Watch demo</button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", animation: "fu .9s .3s ease both" }}>
            <div style={{ animation: "float 5s ease-in-out infinite", width: "100%" }}><HeroMockup /></div>
          </div>
        </div>
      </section>

      <div className="mq-w">
        <div className="mq-t">
          {[...Array(2)].map((_, ri) =>
            ["Text Summarizer","Content Remix Studio","Brand Voice Library","AI Chat","YouTube → Summary","10 Summary Modes","Twitter Threads","LinkedIn Posts","Email Newsletters","Podcast Notes","Blog Outlines"].map((item, i) => (
              <span key={`${ri}-${i}`} className="mq-i"><span className="mq-d" />{item}</span>
            ))
          )}
        </div>
      </div>

      <section style={{ padding: "64px 5%" }}>
        <div className="stats-g">
          {[{n:10,s:"",l:"Summary modes"},{n:10,s:"",l:"Remix formats"},{n:100,s:"",l:"Free requests/month"},{n:4,s:"hrs",l:"Saved per week"}].map(s => (
            <div key={s.l} className="stat-c">
              <div className="stat-n"><Counter to={s.n} suffix={s.s} /></div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="sec" id="features">
        <div className="sec-w">
          <div style={{ marginBottom: 44 }}>
            <div className="s-tag">What Clario does</div>
            <h2 className="s-title" style={{ textAlign: "left", maxWidth: 460 }}>Four tools.<br /><em>One creative OS.</em></h2>
          </div>
          <div className="b-grid">
            {/* Summarizer */}
            <div className="b-card" style={{ gridColumn: "span 5" }}>
              <div className="b-in">
                <div className="b-tag">Text Summarizer</div>
                <h3 className="b-title">10 modes. Every<br /><em>format you need.</em></h3>
                <p className="b-desc" style={{ marginBottom: 20 }}>YouTube URL or paste text. Powered by Llama 3.3 70B.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[["Executive Brief","POPULAR"],["Action Items","POPULAR"],["SWOT Analysis","POPULAR"],["Meeting Minutes",""],["ELI5  Explain Like I'm 5",""],["Brutal Roast",""],["+ 4 more modes",""]].map(([m,badge]) => (
                    <div key={m} style={{ padding: "7px 11px", borderRadius: 8, background: badge?"var(--ol)":"var(--g0)", border: `1px solid ${badge?"var(--om)":"var(--g2)"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: ".76rem", fontWeight: badge?600:400, color: badge?"var(--o)":"var(--g7)" }}>{m}</span>
                      {badge && <span style={{ fontSize: ".58rem", color: "var(--o)", fontWeight: 700 }}>{badge}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Remix */}
            <div className="b-card" style={{ gridColumn: "span 7" }}>
              <div className="b-in">
                <div className="b-tag">Content Remix Studio</div>
                <h3 className="b-title">Paste once. Get<br /><em>10 formats instantly.</em></h3>
                <p className="b-desc" style={{ marginBottom: 20 }}>Twitter threads, LinkedIn posts, newsletters, and 7 more.</p>
              </div>
              <div style={{ padding: "0 26px 26px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["#f97316","#fff7ed","Twitter Thread"],["#0ea5e9","#f0f9ff","LinkedIn Post"],["#8b5cf6","#faf5ff","Email Newsletter"],["#10b981","#f0fdf4","YT Description"],["#f43f5e","#fff1f2","Podcast Notes"],["#f59e0b","#fffbeb","Blog Outline"],["#ec4899","#fdf2f8","Instagram Caption"],["#6366f1","#eef2ff","Short-form Script"]].map(([c,bg,l]) => (
                  <div key={l} style={{ padding: "9px 12px", borderRadius: 9, background: bg, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: ".76rem", fontWeight: 500, color: c }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Chat */}
            <div className="b-card" style={{ gridColumn: "span 6" }}>
              <div className="b-in">
                <div className="b-tag">AI Chat</div>
                <h3 className="b-title"><em>Creator-focused</em> AI<br />that remembers you.</h3>
                <p className="b-desc">Persistent history + creator prompt starters.</p>
              </div>
              <div style={{ background: "var(--g0)", borderTop: "1px solid var(--g2)", padding: "18px 26px", display: "flex", flexDirection: "column", gap: 9 }}>
                {[{u:true,m:"Rewrite my intro to be more punchy"},{u:false,m:"Here's a punchier version that hooks in the first sentence..."},{u:true,m:"Now turn it into a thread opener"}].map((msg,i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.u?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: msg.u?"13px 13px 2px 13px":"13px 13px 13px 2px", background: msg.u?"var(--bk)":"var(--w)", border: msg.u?"none":"1px solid var(--g2)", color: msg.u?"#fff":"var(--g7)", fontSize: ".8rem", lineHeight: 1.55 }}>{msg.m}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Brand Voice */}
            <div className="b-card" style={{ gridColumn: "span 6" }}>
              <div className="b-in">
                <div className="b-tag">Brand Voice Library</div>
                <h3 className="b-title">Every output sounds<br /><em>exactly like you.</em></h3>
                <p className="b-desc">Upload samples. AI learns your unique style.</p>
              </div>
              <div style={{ background: "var(--g0)", borderTop: "1px solid var(--g2)", padding: "18px 26px" }}>
                {[["Conversational tone",87,"#f97316"],["Vocabulary richness",71,"#0ea5e9"],["Brand personality",94,"#10b981"],["Sentence rhythm",78,"#8b5cf6"]].map(([l,p,c],i) => (
                  <div key={String(l)} style={{ marginBottom: i<3?10:0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: ".76rem", color: "var(--g7)", fontWeight: 500 }}>{String(l)}</span>
                      <span style={{ fontSize: ".76rem", color: "var(--g4)" }}>{p}%</span>
                    </div>
                    <div style={{ height: 4, background: "var(--g2)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p}%`, background: String(c), borderRadius: 100 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="demo" style={{ background: "var(--g0)", borderTop: "1px solid var(--g2)", borderBottom: "1px solid var(--g2)" }}>
        <div className="sec-w">
          <div className="sec-h">
            <div className="s-tag">Live demo</div>
            <h2 className="s-title">See the remix magic <em>happen.</em></h2>
            <p className="s-sub">Click any format. Watch your content transform.</p>
          </div>
          <div className="demo-box" ref={demoRef}>
            <div style={{ borderRight: "1px solid var(--g2)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "18px 18px 12px", borderBottom: "1px solid var(--g1)" }}>
                <p style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--g4)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Choose output format</p>
                {remixFormats.map((f, i) => (
                  <button key={f.label} onClick={() => handleRemix(i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: i===remixActive?"var(--ol)":"transparent", borderLeft: `2.5px solid ${i===remixActive?"var(--o)":"transparent"}`, marginBottom: 3, transition: "all .18s", fontFamily: "var(--sans)", textAlign: "left" }}>
                    <span style={{ fontSize: ".85rem", width: 18, textAlign: "center" }}>{f.icon}</span>
                    <span style={{ fontSize: ".76rem", fontWeight: i===remixActive?600:400, color: i===remixActive?"var(--o)":"var(--g7)" }}>{f.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ padding: 18, flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: ".68rem", fontWeight: 600, color: "var(--g7)" }}>Weekly usage</span>
                  <span style={{ fontSize: ".6rem", fontWeight: 700, background: "#dcfce7", color: "#15803d", padding: "2px 7px", borderRadius: 100 }}>+34%</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60, marginBottom: 9 }}>
                  {[42,68,55,89,74,96,83].map((v,i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                      <div style={{ flex: 1, background: "var(--g1)", borderRadius: 3, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", borderRadius: 3, background: i===5?"var(--o)":i===3?"#fb923c":"var(--om)", height: demoInView?`${v}%`:"0%", transition: `height .9s ${i*.08}s cubic-bezier(.34,1.56,.64,1)` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <svg viewBox="0 0 180 24" fill="none" style={{ width: "100%", height: 24, marginBottom: 5 }}>
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity=".2"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 18L26 14L52 16L78 5L104 10L130 2L156 7L180 4" stroke="#f97316" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0 18L26 14L52 16L78 5L104 10L130 2L156 7L180 4L180 24L0 24Z" fill="url(#sg)"/>
                </svg>
                <span style={{ fontSize: ".65rem", color: "var(--g4)" }}>1,247 requests this month</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--g1)", background: "var(--g0)", display: "flex", alignItems: "center", gap: 5 }}>
                {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                <span style={{ fontSize: ".66rem", color: "var(--g4)", marginLeft: 7 }}>{remixFormats[remixActive].label}.txt</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--o)", animation: "pulse 1.5s infinite" }} />
                  <span style={{ fontSize: ".6rem", color: "var(--o)", fontWeight: 700 }}>LIVE</span>
                </div>
              </div>
              <div style={{ padding: 22, flex: 1 }}>
                <pre style={{ fontFamily: "var(--sans)", fontSize: ".84rem", color: "var(--g7)", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 180, opacity: remixFading?0:1, transition: "opacity .18s" }}>{remixFormats[remixActive].preview}</pre>
                <div style={{ display: "flex", gap: 8, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--g1)" }}>
                  <button style={{ background: "var(--bk)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: ".74rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)" }}>Copy ↗</button>
                  <button style={{ background: "transparent", color: "var(--g5)", border: "1.5px solid var(--g2)", borderRadius: 8, padding: "7px 14px", fontSize: ".74rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--sans)" }}>Export .md</button>
                  <button style={{ background: "transparent", color: "var(--g5)", border: "1.5px solid var(--g2)", borderRadius: 8, padding: "7px 14px", fontSize: ".74rem", fontWeight: 500, cursor: "pointer", fontFamily: "var(--sans)" }}>Regenerate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="compare">
        <div className="sec-w">
          <div className="sec-h">
            <div className="s-tag">Why Clario</div>
            <h2 className="s-title">How we stack up <em>against the rest.</em></h2>
            <p className="s-sub">Every tool in one place  purpose-built for creators.</p>
          </div>
          <div className="comp-wrap"><ComparisonTable /></div>
        </div>
      </section>

      <section className="sec" id="pricing" style={{ background: "var(--g0)", borderTop: "1px solid var(--g2)" }}>
        <div className="sec-w">
          <div className="sec-h">
            <div className="s-tag">Pricing</div>
            <h2 className="s-title">Simple, <em>honest</em> pricing.</h2>
            <p className="s-sub">Start free. Upgrade when Clario has paid for itself  which will happen on day one.</p>
          </div>
          <div className="p-grid">
            <div className="p-card">
              <div className="p-plan">Free</div>
              <div className="p-price">$0<sub>/mo</sub></div>
              <p className="p-desc">Everything to get started. No card required.</p>
              <hr className="p-div" />
              <ul className="p-list">
                {["100 AI requests/month","Chat + Summarizer","10 summary modes","1 Brand Voice","3 Remix formats","Email support"].map(item => (
                  <li key={item} className="p-item"><span className="p-ck">✓</span>{item}</li>
                ))}
              </ul>
              <button className="btn-pf" onClick={() => window.location.href="/sign-up"}>Get started free</button>
            </div>
            <div className="p-card feat">
              <div className="p-badge">MOST POPULAR</div>
              <div className="p-plan">Pro</div>
              <div className="p-price">$19<sub>/mo</sub></div>
              <p className="p-desc">For creators who ship content every day.</p>
              <hr className="p-div" />
              <ul className="p-list">
                {["1,000 AI requests/month","All 10 Remix formats","Export to Notion / Google Docs","AI Image Prompt Generator","3 Brand Voices","Priority support","Early access to features"].map(item => (
                  <li key={item} className="p-item"><span className="p-ck">✓</span>{item}</li>
                ))}
              </ul>
              <button className="btn-pp" onClick={() => window.location.href="/sign-up?plan=pro"}>Upgrade to Pro →</button>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: ".76rem", color: "var(--g4)", marginTop: 22 }}>Each AI operation (summarization or chat message) counts as one request.</p>
        </div>
      </section>

      <div className="finale">
        <div className="f-glow" /><div className="f-grid" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: ".62rem", fontWeight: 700, color: "rgba(255,255,255,.28)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 18 }}>The last content tool you&apos;ll need</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4.5vw,3.6rem)", fontWeight: 300, color: "#fff", letterSpacing: "-.03em", lineHeight: 1.07, marginBottom: 18 }}>Your content,<br /><em style={{ color: "var(--o)" }}>multiplied.</em></h2>
          <p style={{ fontSize: ".88rem", color: "rgba(255,255,255,.38)", marginBottom: 36, maxWidth: 400, margin: "0 auto 36px", lineHeight: 1.75 }}>The AI toolkit built for YouTubers, podcasters, and bloggers.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-p" onClick={() => window.location.href="/sign-up"} style={{ fontSize: ".88rem", padding: "13px 26px" }}>
              Start for free  no card needed <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button onClick={() => window.location.href="/pricing"} style={{ background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.55)", padding: "13px 22px", borderRadius: 9, fontSize: ".88rem", fontWeight: 500, border: "1.5px solid rgba(255,255,255,.1)", cursor: "pointer", fontFamily: "var(--sans)", transition: "all .2s" }}>See pricing</button>
          </div>
        </div>
      </div>

      <footer className="lf">
        <a href="/" className="logo-w">
          <div className="lm" style={{ width: 22, height: 22, borderRadius: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          Clario
        </a>
        <ul className="f-links">
          <li><a href="#features">Features</a></li>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/privacy">Privacy</a></li>
          <li><a href="/terms">Terms</a></li>
          <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
        </ul>
        <p className="f-copy">© 2025 Clario · Built for creators.</p>
      </footer>
    </>
  );
}
