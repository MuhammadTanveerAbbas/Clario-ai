"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FileText, ListChecks, LayoutGrid, Plus } from "lucide-react";

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
    if (del && text.length === 0) { const t = setTimeout(() => { setDel(false); setIdx((idx + 1) % phrases.length); }, 0); return () => clearTimeout(t); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, del, idx]);
  return <span>{text}<span style={{ color: "#f97316", animation: "blink .85s infinite" }}>|</span></span>;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { setInView(e.isIntersecting); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const HM_TABS = [
  { id: "sum", label: "Summarizer", hint: "Long content into a short brief", icon: "doc" },
  { id: "remix", label: "Remix", hint: "One idea into ten formats", icon: "remix" },
  { id: "chat", label: "Chat", hint: "Ask about your content", icon: "chat" },
  { id: "voice", label: "Brand voice", hint: "Tone that stays consistent", icon: "heart" },
];

const HM_FORMATS = [
  { name: "Twitter thread", meta: "312 words", color: "#000000", icon: "x" },
  { name: "LinkedIn post", meta: "168 words", color: "#0A66C2", icon: "linkedin" },
  { name: "Email newsletter", meta: "640 words", color: "#EA4335", icon: "email" },
  { name: "YT description", meta: "9 chapters", color: "#FF0000", icon: "youtube" },
  { name: "Podcast notes", meta: "5 takeaways", color: "#1DB954", icon: "spotify" },
  { name: "Blog outline", meta: "6 sections", color: "#111111", icon: "medium" },
  { name: "Instagram caption", meta: "1,940 chars", color: "#E4405F", icon: "instagram" },
  { name: "Short-form script", meta: "45 seconds", color: "#FF0000", icon: "shorts" },
];

const HM_PREVIEWS = [
  "I analyzed 500 creator accounts to find what separates the ones who grow from the ones who stall. They do not create more content, they repurpose smarter. One anchor piece becomes ten posts.",
  "After three years of publishing every day, here is what I wish someone had told me in month one. Volume is not the lever, distribution is.",
  "Subject: the content system that replaced my 20 hour week. I used to spend twenty hours a week on content. Now I spend four and reach more people.",
  "00:00 Intro, 02:14 the anchor content framework, 08:30 repurposing walkthrough, 19:02 distribution over creation.",
  "Episode 47, the content repurposing system. Anchor content is the foundation, AI handles the repurposing layer, distribution is the new creation.",
  "1. Why most creators stall on one platform. 2. The anchor piece framework. 3. Mapping one idea to ten formats.",
  "One video. Ten posts. Zero extra filming. That is the whole system. Save this for your next content planning day.",
  "Hook: I analyzed 500 creators. Beat: only 3 percent publish the same idea in more than one format. Close: that is the trick.",
];

function BrandIcon({ name, size = 13 }: { name: string; size?: number }) {
  const p: Record<string, string> = {
    x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
    linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    email: "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z",
    youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    shorts: "m18.931 9.99-1.441-.601 1.717-.913a4.48 4.48 0 0 0 1.874-6.078 4.506 4.506 0 0 0-6.09-1.874L4.792 5.929a4.504 4.504 0 0 0-2.402 4.193 4.521 4.521 0 0 0 2.666 3.904c.036.012 1.442.6 1.442.6l-1.706.901a4.51 4.51 0 0 0-2.369 3.967A4.528 4.528 0 0 0 6.93 24c.725 0 1.437-.174 2.08-.508l10.21-5.406a4.494 4.494 0 0 0 2.39-4.192 4.525 4.525 0 0 0-2.678-3.904ZM9.597 15.19V8.824l6.007 3.184z",
    instagram: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
    spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.28c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.84-.12-.96-.54-.12-.42.12-.84.54-.96 4.56-1.02 8.52-.6 11.64 1.32.36.18.48.66.24 1.08zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.18-1.02-.12-1.2-.6-.18-.48.12-1.02.6-1.2 4.56-1.44 9.96-.72 13.56 1.56.42.24.6.84.24 1.32zm.12-3.36C15.24 8.4 8.82 8.16 5.1 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.32-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.54-1.02.72-1.56.42z",
    medium: "M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0-3.54-1.02-6.42-2.28-6.42-1.26 0-2.28 2.88-2.28 6.42s1.02 6.42 2.28 6.42c1.26 0 2.28-2.88 2.28-6.42zM24 12c0-2.7-.36-4.86-1.08-5.04-.72-.18-2.16 1.8-2.16 5.04s1.44 5.22 2.16 5.04C23.64 16.86 24 14.7 24 12z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d={p[name] ?? p.x} />
    </svg>
  );
}

const HM_PROMPTS = [
  "Give me 5 thread hooks",
  "What should my Q1 content be?",
  "Turn my last video into a thread",
];

const HM_REPLIES: Record<string, string> = {
  "Give me 5 thread hooks": "1. I analyzed 500 creator accounts.\n2. Nobody wants more content.\n3. Distribution beats volume.\n4. Your best idea is 3 weeks old.\n5. Stop filming, start repurposing.",
  "What should my Q1 content be?": "Anchor on long form YouTube, then repurpose each video into a thread plus a newsletter. Two anchor pieces a month are enough to fill every channel.",
  "Turn my last video into a thread": "Drafting a 7 post thread now. Hook taken from your first 30 seconds, body split into your three main sections, close with a single question.",
};

const HM_VOICE = [
  { label: "Conversational tone", value: 87, color: "#f97316" },
  { label: "Vocabulary", value: 71, color: "#0284c7" },
  { label: "Brand personality", value: 94, color: "#059669" },
];

function HmIcon({ name, size = 15 }: { name: string; size?: number }) {
  const p: Record<string, React.ReactNode> = {
    doc: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
    remix: <><path d="M20.5 12.5a8.5 8.5 0 11-2.6-6.1" /><path d="M21.5 3.5v5h-5" /></>,
    chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 000-7.8z" />,
    thread: <path d="M21 11.5a8.4 8.4 0 01-9 8.4 8.9 8.9 0 01-4-.9L3 20.5l1.6-4.6A8.4 8.4 0 013.5 11 8.4 8.4 0 0112 3a8.4 8.4 0 019 8.5z" />,
    in: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7.5 10v7M7.5 7.3v.1M11.5 17v-4a2.5 2.5 0 015 0v4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5l8.5 6 8.5-6" /></>,
    play: <><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="M10.5 9.5l5 2.5-5 2.5z" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" /></>,
    camera: <><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8.5 7l1.4-2.4h4.2L15.5 7" /><circle cx="12" cy="13.5" r="3.4" /></>,
    send: <><path d="M21.5 3.5L2.8 10.2l7.4 2.6 2.6 7.4z" /><path d="M21.5 3.5l-11.3 9.3" /></>,
    bolt: <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {p[name] ?? p.doc}
    </svg>
  );
}

function HeroMockup() {
  const [tab, setTab] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState(0);
  const [prog, setProg] = useState(0);
  const [format, setFormat] = useState(0);
  const [prompt, setPrompt] = useState<{ q: string; a: string | null }[]>([]);
  const [voice, setVoice] = useState(true);
  const { ref, inView } = useInView(0.25);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = rowsRef.current;
    if (!box) return;
    const active = box.querySelector<HTMLElement>('[aria-checked="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [format, tab]);

  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!inView || paused || reduceMotion) return;
    const t = setInterval(() => setTab((i) => (i + 1) % HM_TABS.length), 5200);
    return () => clearInterval(t);
  }, [inView, paused, reduceMotion]);

  // Resume auto-play whenever the mockup scrolls back into view
  useEffect(() => {
    if (inView) { const t = setTimeout(() => setPaused(false), 0); return () => clearTimeout(t); }
  }, [inView]);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const t = setTimeout(() => {
      setProg(0);
      let p = 0;
      const i = setInterval(() => {
        p += 4;
        setProg(Math.min(p, 100));
        if (p >= 100) clearInterval(i);
      }, 16);
      return () => clearInterval(i);
    }, 350);
    return () => clearTimeout(t);
  }, [tab, inView, reduceMotion]);

  const ask = useCallback((q: string, manual = true) => {
    if (manual) setPaused(true);
    setPrompt((prev) => [...prev, { q, a: null }]);
    setTimeout(() => {
      const answer = HM_REPLIES[q] ?? "Noted. I will keep that in mind for the next draft.";
      setPrompt((prev) => prev.map((m, i) => (i === prev.length - 1 && !m.a ? { ...m, a: answer } : m)));
    }, 850);
  }, []);

  useEffect(() => {
    if (!inView || tab !== 2) return;
    const q = HM_PROMPTS[0];
    const t = setTimeout(() => {
      setPrompt([{ q, a: null }]);
      setTimeout(() => {
        const answer = HM_REPLIES[q];
        setPrompt((prev) => prev.map((m, i) => (i === 0 && !m.a ? { ...m, a: answer } : m)));
      }, 900);
    }, 1600);
    return () => clearTimeout(t);
  }, [tab, inView]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (tab + 1) % HM_TABS.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (tab - 1 + HM_TABS.length) % HM_TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = HM_TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setPaused(true);
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      ref={ref}
      className={`hm${inView ? " hm-on" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false); }}
    >
      <div className="hm-bar">
        <span className="hm-dots" aria-hidden="true">
          <i style={{ background: "#ff5f57" }} /><i style={{ background: "#ffbd2e" }} /><i style={{ background: "#28c840" }} />
        </span>
        <span className="hm-url">app.clario.ai/{HM_TABS[tab].id === "voice" ? "settings" : HM_TABS[tab].id}</span>
      </div>

      <div className="hm-main">
        <div className="hm-tabs" role="tablist" aria-label="Clario tools" onKeyDown={onKeyDown}>
          {HM_TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => { tabRefs.current[i] = el; }}
              role="tab"
              id={`hm-tab-${i}`}
              aria-selected={i === tab}
              aria-controls={`hm-panel-${i}`}
              aria-label={t.label}
              tabIndex={i === tab ? 0 : -1}
              className={`hm-tab${i === tab ? " is-active" : ""}`}
              onClick={() => { setPaused(true); setTab(i); }}
            >
              <HmIcon name={t.icon} />
            </button>
          ))}
        </div>

        <div className="hm-body">
          <div className="hm-head">
            <span className="hm-head-ic"><HmIcon name={HM_TABS[tab].icon} size={13} /></span>
            <span className="hm-head-t">{HM_TABS[tab].label}</span>
            <span className="hm-head-h">{HM_TABS[tab].hint}</span>
          </div>

          {tab === 0 && (
            <div className="hm-panel" role="tabpanel" id="hm-panel-0" aria-labelledby="hm-tab-0">
              <div className="hm-card">
                <p className="hm-eyebrow">YouTube URL or paste text</p>
                <p className="hm-input">Just finished recording my deep dive on content strategy for creators. Covered ideation, distribution, monetization...</p>
              </div>
              <div className="hm-chips" role="group" aria-label="Summary style">
                {["Executive Brief", "Action Items", "SWOT", "ELI5", "Brutal Roast"].map((m, i) => (
                  <button
                    key={m}
                    className={`hm-chip${i === mode ? " is-active" : ""}`}
                    aria-pressed={i === mode}
                    onClick={() => { setPaused(true); setMode(i); }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="hm-card hm-out">
                <div className="hm-out-top">
                  <p className="hm-eyebrow hm-eyebrow-o">{["Executive Brief", "Action Items", "SWOT", "ELI5", "Brutal Roast"][mode]}</p>
                  <p className="hm-count">{prog >= 100 ? "Done" : `${prog}%`}</p>
                </div>
                <p className="hm-out-text">
                  A content strategy framework covering ideation pipelines, multi platform distribution, revenue diversification, and the slow work of earning audience trust.
                </p>
                <div className="hm-bar-track"><i style={{ width: `${prog}%` }} /></div>
                <p className="hm-note" style={{ marginTop: 8 }}><HmIcon name="bolt" size={12} /> Saved to your workspace, ready to export</p>
                <div className="hm-stats">
                  {[
                    { k: "Words in", v: "4,812" },
                    { k: "Words out", v: "196" },
                    { k: "Read time", v: "1 min" },
                  ].map((s) => (
                    <div key={s.k} className="hm-stat">
                      <span className="hm-stat-k">{s.k}</span>
                      <span className="hm-stat-v">{s.v}</span>
                    </div>
                  ))}
                </div>
                <div className="hm-keys">
                  {["ideation", "distribution", "monetization", "audience trust"].map((k) => (
                    <span key={k} className="hm-key">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="hm-panel" role="tabpanel" id="hm-panel-1" aria-labelledby="hm-tab-1">
              <div className="hm-rows-wrap">
                <div
                  className="hm-rows"
                  role="radiogroup"
                  aria-label="Output formats"
                  ref={rowsRef}
                  onKeyDown={(e) => {
                    let n = -1;
                    if (e.key === "ArrowDown") n = (format + 1) % HM_FORMATS.length;
                    else if (e.key === "ArrowUp") n = (format - 1 + HM_FORMATS.length) % HM_FORMATS.length;
                    else if (e.key === "Home") n = 0;
                    else if (e.key === "End") n = HM_FORMATS.length - 1;
                    if (n < 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setPaused(true);
                    setFormat(n);
                  }}
                >
                  {HM_FORMATS.map((f, i) => (
                    <button
                      key={f.name}
                      role="radio"
                      aria-checked={i === format}
                      tabIndex={i === format ? 0 : -1}
                      className={`hm-row${i === format ? " is-active" : ""}`}
                      onClick={() => { setPaused(true); setFormat(i); }}
                    >
                      <span className="hm-row-ic" style={{ ["--c" as string]: f.color }}><BrandIcon name={f.icon} /></span>
                      <span className="hm-row-n">{f.name}</span>
                      <span className="hm-row-m">{f.meta}</span>
                    </button>
                  ))}
                </div>
                <span className="hm-rows-fade" aria-hidden="true" />
              </div>
              <p className="hm-note"><HmIcon name="bolt" size={12} /> 2 more formats ready, including quote cards and an email teaser</p>
              <div className="hm-preview" key={format}>
                <p className="hm-eyebrow">{HM_FORMATS[format].name} preview</p>
                <p className="hm-preview-text">{HM_PREVIEWS[format]}</p>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className="hm-panel" role="tabpanel" id="hm-panel-2" aria-labelledby="hm-tab-2">
              <div className="hm-chat">
                <div className="hm-msg is-user"><p className="hm-bubble">What should my Q1 content strategy be?</p></div>
                <div className="hm-msg"><p className="hm-bubble is-ai">Anchor on long form YouTube, then repurpose each video into a thread and a newsletter. Two anchor pieces a month are enough to fill every channel.</p></div>
                {prompt.map((m, i) => (
                  <div key={i}>
                    <div className="hm-msg is-user"><p className="hm-bubble">{m.q}</p></div>
                    {m.a ? (
                      <div className="hm-msg"><p className="hm-bubble is-ai">{m.a}</p></div>
                    ) : (
                      <div className="hm-msg"><p className="hm-typing" aria-label="Clario is writing"><i /><i /><i /> Clario is writing</p></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="hm-chips hm-chips-b">
                {HM_PROMPTS.map((q) => (
                  <button key={q} className="hm-chip" onClick={() => ask(q)}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {tab === 3 && (
            <div className="hm-panel" role="tabpanel" id="hm-panel-3" aria-labelledby="hm-tab-3">
              <div className="hm-card">
                <p className="hm-eyebrow">Your brand voice</p>
                {HM_VOICE.map((v) => (
                  <div key={v.label} className="hm-meter">
                    <div className="hm-meter-top">
                      <span className="hm-meter-l">{v.label}</span>
                      <span className="hm-meter-v">{v.value}%</span>
                    </div>
                    <div className="hm-meter-track"><i style={{ width: `${voice ? v.value : 0}%`, background: v.color }} /></div>
                  </div>
                ))}
              </div>
              <button
                className={`hm-toggle${voice ? " is-on" : ""}`}
                role="switch"
                aria-checked={voice}
                onClick={() => { setPaused(true); setVoice((v) => !v); }}
              >
                <span className="hm-toggle-dot" />
                <span className="hm-toggle-tx">{voice ? "Brand voice is on for every output" : "Brand voice is off, using default tone"}</span>
              </button>
              <p className="hm-note">Learned from the pieces you have already published</p>
              <div className="hm-card">
                <p className="hm-eyebrow">Where it shows up</p>
                <div className="hm-uses">
                  {["Thread hooks", "Newsletter openers", "Video titles", "Show notes", "Blog intros"].map((u) => (
                    <span key={u} className="hm-key" style={{ color: "var(--g5)", background: "var(--w)", borderColor: "var(--g2)" }}>{u}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hm-foot">
        <span>1 video in</span>
        <span className="hm-foot-line" aria-hidden="true" />
        <span><b>10 posts</b> out</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
const remixFormats = [
    { icon: "x", color: "#000000", label: "Twitter Thread", meta: "312 words, 7 posts", preview: "I analyzed 500 creator accounts to find the one system that separates them from everyone else.\n\n1. They do not create more content. They repurpose smarter.\n2. One video becomes 10 formats.\n3. Distribution beats volume, every single week.\n\nSame effort. Compounding reach." },
    { icon: "linkedin", color: "#0A66C2", label: "LinkedIn Post", meta: "168 words", preview: "After three years of building in public, here is what I wish someone told me in month one.\n\nThe creators winning this year are not publishing the most. They are publishing the smartest.\n\nOne anchor piece, repurposed everywhere, zero extra effort." },
    { icon: "email", color: "#EA4335", label: "Email Newsletter", meta: "640 words", preview: "Subject: the content system that gave me back 20 hours a week\n\nHey there,\n\nI used to spend 20 hours a week on content. Now I spend 4 and reach more people.\n\nHere is the exact framework, step by step." },
    { icon: "youtube", color: "#FF0000", label: "YT Description", meta: "9 chapters", preview: "In this video I break down the repurposing system that turns one long video into ten pieces across every platform.\n\n00:00 Intro\n02:14 The anchor content framework\n08:30 AI repurposing walkthrough\n19:02 Distribution over creation\n\nRead more at clario.ai" },
    { icon: "spotify", color: "#1DB954", label: "Podcast Notes", meta: "5 takeaways", preview: "Episode 47, the content repurposing system.\n\nTop takeaways:\nAnchor content is your foundation.\nAI handles the repurposing layer.\nDistribution is the new creation.\n\nLinks: clario.ai, Notion, Descript" },
    { icon: "instagram", color: "#E4405F", label: "Instagram Caption", meta: "1,940 characters", preview: "One video. Ten posts. Zero extra filming.\n\nThat is the whole system.\n\nMost creators do not have a content problem. They have a distribution problem.\n\nSave this for your next planning day." },
  ];
  const [remixActive, setRemixActive] = useState(0);
  const [remixFading, setRemixFading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { ref: demoRef, inView: demoInView } = useInView(0.2);

  const handleRemix = (i: number) => {
    if (i === remixActive) return;
    setRemixFading(true);
    setTimeout(() => { setRemixActive(i); setRemixFading(false); }, 180);
  };

  return (
    <>
      <div className="pg">
      <style>{`
        .pg *,.pg *::before,.pg *::after{box-sizing:border-box;margin:0;padding:0}
        :root{--o:#f97316;--ol:#fff7ed;--om:#fed7aa;--bk:#0c0a09;--g7:#44403c;--g5:#78716c;--g4:#a8a29e;--g2:#e7e5e4;--g1:#f5f5f4;--g0:#fafaf9;--w:#fff;--serif:var(--font-fraunces),Georgia,serif;--sans:var(--font-inter),system-ui,sans-serif}
        html{scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none}
        html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}
        body{font-family:var(--sans);background:var(--w);color:var(--bk);-webkit-font-smoothing:antialiased}
        .pg{overflow-x:clip}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hero-section{background:var(--w)}
        .hero{min-height:calc(100vh - 64px);padding:56px 5% 72px;display:flex;flex-direction:column;align-items:center;gap:44px;max-width:1080px;margin:0 auto;position:relative;z-index:1}
        .hero-copy{width:100%;max-width:660px;display:flex;flex-direction:column;align-items:center;text-align:center}
        .hero-visual{width:100%;justify-content:center}
        @media(max-width:860px){.hero{padding-top:44px;gap:34px}}
        @media(max-width:480px){.hero{padding:24px 2% 48px;gap:28px}}
        @media(max-width:360px){.hero{padding:20px 0 40px}}
        .h-badge{display:inline-flex;align-items:center;gap:8px;position:relative;background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 60%,#fed7aa 100%);border:1px solid #fdba74;color:#c2410c;font-size:.7rem;font-weight:700;padding:6px 16px 6px 10px;border-radius:100px;margin-bottom:22px;letter-spacing:.06em;text-transform:uppercase;animation:fu .6s ease both;box-shadow:0 2px 12px -4px rgba(249,115,22,.35),0 1px 0 0 rgba(255,255,255,.8) inset,0 -1px 0 0 rgba(249,115,22,.15) inset;overflow:hidden}
        .h-badge-icon{display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#fff 0%,#ffedd5 100%);border:1px solid #fdba74;box-shadow:0 2px 6px -2px rgba(249,115,22,.4),0 1px 2px rgba(0,0,0,.06);flex-shrink:0;position:relative;z-index:1}
        .h-badge-text{position:relative;z-index:1}
        .h-badge-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(255,255,255,.5) 0%,transparent 70%);pointer-events:none}
        .h-h1{font-family:var(--serif);font-size:clamp(2rem,5vw,3.6rem);line-height:1.04;letter-spacing:-.035em;font-weight:300;margin-bottom:12px;color:var(--bk);animation:fu .6s .1s ease both}
        .h-h1 em{font-style:italic;color:var(--o)}
        .h-h1 strong{font-weight:400}
        .h-typ{font-family:var(--serif);font-size:clamp(1rem,2.2vw,1.6rem);color:var(--g5);font-style:italic;font-weight:300;margin-bottom:20px;min-height:2.2rem;letter-spacing:-.02em;animation:fu .6s .15s ease both}
        .h-sub{font-size:1.05rem;color:var(--g5);line-height:1.75;max-width:560px;margin-bottom:30px;animation:fu .6s .2s ease both}
        .h-sub{max-width:520px;margin:0 auto 30px}
        .h-ctas{display:flex;gap:11px;flex-wrap:wrap;margin-bottom:28px;animation:fu .6s .25s ease both}
        .h-ctas{justify-content:center}
        .btn-p{position:relative;background:var(--o);color:#fff;min-height:50px;padding:0 26px;border-radius:11px;font-size:.9rem;font-weight:600;border:none;cursor:pointer;font-family:var(--sans);letter-spacing:-.01em;transition:transform .2s ease,background .2s ease,box-shadow .2s ease;display:inline-flex;align-items:center;gap:9px;box-shadow:0 12px 26px -12px rgba(249,115,22,.75)}
        .btn-p:hover{background:#ea6c0a;transform:translateY(-2px);box-shadow:0 16px 32px -12px rgba(249,115,22,.85)}
        .btn-p:active{transform:translateY(0)}
        .btn-p:focus-visible{outline:2px solid var(--o);outline-offset:3px}
        .btn-p svg{transition:transform .2s ease}
        .btn-p:hover svg{transform:translateX(3px)}
        @media(max-width:420px){.h-ctas{justify-content:center}.btn-p{width:100%;justify-content:center}}

        .b-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px}
        @media(max-width:860px){.b-grid>*{grid-column:span 12!important}}
        .b-card{background:var(--w);border-radius:18px;border:1px solid var(--g2);overflow:hidden;transition:transform .25s,box-shadow .25s;display:flex;flex-direction:column}
        .b-card:hover{transform:translateY(-4px);box-shadow:0 14px 44px rgba(0,0,0,.08)}
        .b-in{padding:28px}
        .b-tag{font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#c2410c;margin-bottom:10px}
        .b-title{font-family:var(--serif);font-size:1.42rem;font-weight:300;letter-spacing:-.03em;line-height:1.2;color:var(--bk);margin-bottom:8px}
        .b-title em{font-style:italic;color:var(--o)}
        .b-desc{font-size:.88rem;color:var(--g5);line-height:1.7}
        .b-formats{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:0 28px 28px;flex:1;grid-auto-rows:1fr}
        @media(max-width:520px){.b-formats{grid-auto-rows:auto}}
        .b-modes{display:flex;flex-direction:column;gap:6px;margin-top:auto}
        .b-mode{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:10px;background:var(--g0);border:1px solid var(--g2);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
        .b-mode.is-hot{background:var(--ol);border-color:var(--om)}
        .b-mode-ic{display:flex;width:28px;height:28px;border-radius:9px;background:var(--w);border:1px solid var(--g2);color:var(--g7);align-items:center;justify-content:center;flex-shrink:0}
        .b-mode.is-hot .b-mode-ic{border-color:var(--om);color:var(--o)}
        .b-mode-n{flex:1;font-size:.85rem;font-weight:500;color:var(--g7);letter-spacing:-.01em}
        .b-mode.is-hot .b-mode-n{font-weight:600;color:var(--bk)}
        .b-mode-b{font-size:.6rem;font-weight:700;letter-spacing:.06em;color:var(--o)}
        .b-mode.is-more{background:transparent;border-style:dashed}
        .b-mode.is-more .b-mode-n{color:var(--g5)}
        @media(max-width:520px){.b-formats{grid-template-columns:1fr}}
        .b-format{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:10px;background:var(--g0);border:1px solid var(--g2);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
        .b-format:hover{transform:translateY(-2px);border-color:var(--om);box-shadow:0 8px 18px -12px rgba(28,25,23,.35)}
        .b-format-ic{display:flex;width:24px;height:24px;border-radius:7px;background:var(--w);border:1px solid var(--g2);color:var(--c);align-items:center;justify-content:center;flex-shrink:0}
        .b-format-n{font-size:.85rem;font-weight:600;color:var(--g7);letter-spacing:-.01em}
        .b-format:hover .b-format-n{color:var(--bk)}
        .demo-box{border-radius:18px;border:1px solid var(--g2);background:var(--w);overflow:hidden;box-shadow:0 6px 36px rgba(0,0,0,.05);display:grid;grid-template-columns:290px 1fr}
        @media(max-width:760px){.demo-box{grid-template-columns:1fr}}
        .dm-side{display:flex;flex-direction:column;border-right:1px solid var(--g2)}
        @media(max-width:760px){.dm-side{border-right:none;border-bottom:1px solid var(--g2)}}
        .dm-side-in{padding:18px 18px 14px;border-bottom:1px solid var(--g1)}
        .dm-cap{font-size:.67rem;font-weight:700;color:var(--g4);text-transform:uppercase;letter-spacing:.09em;margin-bottom:11px}
        .dm-list{display:flex;flex-direction:column;gap:3px}
        @media(max-width:760px){.dm-list{max-height:260px;overflow-y:auto}}
        .dm-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 11px;border-radius:10px;border:1px solid transparent;background:transparent;cursor:pointer;font-family:var(--sans);transition:background .18s ease,border-color .18s ease,transform .18s ease}
        .dm-item:hover{background:var(--g0)}
        .dm-item:focus-visible{outline:2px solid var(--o);outline-offset:2px}
        .dm-item.is-active{background:var(--ol);border-color:var(--om);transform:translateX(2px)}
        .dm-item-ic{display:flex;width:26px;height:26px;border-radius:8px;background:var(--w);border:1px solid var(--g2);color:var(--c);align-items:center;justify-content:center;flex-shrink:0}
        .dm-item-tx{display:block;min-width:0}
        .dm-item-n{display:block;font-size:.83rem;font-weight:600;color:var(--g7);letter-spacing:-.01em}
        .dm-item.is-active .dm-item-n{color:var(--o)}
        .dm-item-m{display:block;font-size:.66rem;color:var(--g4);margin-top:1px}
        .dm-usage{padding:18px;flex:1}
        @media(max-width:760px){.dm-usage{display:none}}
        .dm-usage-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;font-size:.75rem;font-weight:600;color:var(--g7)}
        .dm-chip-up{font-size:.64rem;font-weight:700;background:#dcfce7;color:#15803d;padding:3px 8px;border-radius:100px}
        .dm-bars{display:flex;align-items:flex-end;gap:5px;height:62px;margin-bottom:10px}
        .dm-bar{flex:1;height:100%;background:var(--g1);border-radius:4px;overflow:hidden;display:flex;align-items:flex-end}
        .dm-bar span{display:block;width:100%;border-radius:4px;background:var(--om)}
        .dm-bar span.is-mid{background:#fb923c}
        .dm-bar span.is-peak{background:var(--o)}
        .dm-spark{display:block;width:100%;height:24px;margin-bottom:6px}
        .dm-usage-note{font-size:.7rem;color:var(--g4)}
        .dm-main{display:flex;flex-direction:column}
        .dm-bar-top{display:flex;align-items:center;gap:9px;padding:11px 18px;border-bottom:1px solid var(--g1);background:var(--g0)}
        .dm-dots{display:flex;gap:5px}
        .dm-dots i{width:9px;height:9px;border-radius:50%;background:var(--g2);display:block}
        .dm-dots i:nth-child(1){background:#ff5f57}
        .dm-dots i:nth-child(2){background:#ffbd2e}
        .dm-dots i:nth-child(3){background:#28c840}
        .dm-file{font-size:.72rem;color:var(--g5)}
        .dm-live{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:.64rem;font-weight:700;letter-spacing:.06em;color:var(--o);text-transform:uppercase}
        .dm-live i{width:5px;height:5px;border-radius:50%;background:var(--o);animation:pulse 1.5s infinite}
        .dm-src{display:flex;align-items:center;gap:10px;padding:12px 22px;border-bottom:1px solid var(--g1);background:var(--ol)}
        .dm-src-l{font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--o);background:var(--w);border:1px solid var(--om);border-radius:100px;padding:3px 9px;flex-shrink:0}
        .dm-src-t{font-size:.78rem;color:var(--g7);min-width:0}
        .dm-body{padding:22px;flex:1}
        .dm-out{font-family:var(--sans);font-size:.88rem;color:var(--g7);line-height:1.8;white-space:pre-wrap;word-break:break-word;min-height:190px;transition:opacity .18s ease}
        .dm-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:16px 22px;border-top:1px solid var(--g1)}
        .dm-btn{padding:0 16px;min-height:40px;border-radius:11px;border:1px solid var(--g2);background:var(--w);color:var(--g7);font-size:.78rem;font-weight:600;font-family:var(--sans);cursor:pointer;transition:border-color .18s ease,color .18s ease,transform .18s ease,background .18s ease}
        .dm-btn:hover{border-color:var(--bk);color:var(--bk);transform:translateY(-1px)}
        .dm-btn-p{background:var(--o);border-color:var(--o);color:#fff;box-shadow:0 6px 16px -8px rgba(249,115,22,.8)}
        .dm-btn-p:hover{background:#ea6c0a;border-color:#ea6c0a;color:#fff}
        .dm-btn:focus-visible{outline:2px solid var(--o);outline-offset:2px}
        .dm-meta{margin-left:auto;font-size:.72rem;color:var(--g4)}
        @media(max-width:420px){.dm-meta{margin-left:0;width:100%}}

        .p-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:680px;margin:0 auto}
        @media(max-width:520px){.p-grid{grid-template-columns:1fr}}
        .p-card{border-radius:18px;padding:30px;border:1.5px solid var(--g2);background:var(--w);position:relative;transition:transform .25s,box-shadow .25s}
        .p-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.07)}
        .p-card.feat{background:var(--w);border-color:var(--o);box-shadow:0 14px 40px -18px rgba(249,115,22,.45)}
        .p-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--o);color:#fff;font-size:.6rem;font-weight:700;padding:3px 12px;border-radius:100px;letter-spacing:.08em;white-space:nowrap}
        .p-plan{font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--g4);margin-bottom:10px}
        .p-price{font-family:var(--serif);font-size:2.8rem;font-weight:300;letter-spacing:-.05em;line-height:1;color:var(--bk);margin-bottom:5px}
        .p-price sub{font-size:.82rem;font-family:var(--sans);font-weight:400;color:var(--g5);letter-spacing:0;vertical-align:middle}
        .p-desc{font-size:.78rem;color:var(--g5);margin-bottom:18px;line-height:1.5}
        .p-div{border:none;border-top:1px solid var(--g2);margin-bottom:16px}
        .p-card.feat .p-plan{color:var(--o)}
        .p-soon{display:inline-block;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--g5);background:var(--g1);border:1px solid var(--g2);border-radius:100px;padding:4px 11px;margin-top:12px}
        .p-live{display:inline-block;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#15803d;background:#dcfce7;border:1px solid #bbf7d0;border-radius:100px;padding:4px 11px;margin-top:12px}
        .p-foot{font-size:.72rem;color:var(--g4);text-align:center;margin-top:11px}
        .p-foot-o{color:var(--g4)}
        .p-note{text-align:center;font-size:.8rem;color:var(--g4);margin-top:22px}
        .p-list{list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:22px}
        .p-item{display:flex;align-items:flex-start;gap:8px;font-size:.8rem;color:var(--g7)}
        .p-ck{width:15px;height:15px;border-radius:50%;background:var(--ol);color:var(--o);font-size:.52rem;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;margin-top:1px}
        .p-card.feat .p-ck{background:var(--om)}
        .btn-pf{width:100%;min-height:46px;border-radius:11px;font-size:.8rem;font-weight:600;font-family:var(--sans);background:transparent;color:var(--bk);border:1.5px solid var(--g2);cursor:pointer;transition:all .2s;letter-spacing:-.01em}
        .btn-pf:not(:disabled):hover{background:var(--bk);color:var(--w);border-color:var(--bk)}
        .btn-pf:disabled{background:var(--g1);color:var(--g4);border-style:dashed;cursor:not-allowed}
        .btn-pp{width:100%;min-height:46px;border-radius:11px;font-size:.8rem;font-weight:600;font-family:var(--sans);background:var(--o);color:#fff;border:none;cursor:pointer;transition:all .2s;box-shadow:0 3px 14px rgba(249,115,22,.35);letter-spacing:-.01em}
        .btn-pp:hover{background:#ea6c0a;transform:translateY(-1px)}
        .finale{background:var(--g0);border-top:1px solid var(--g2);padding:96px 5%;text-align:center;position:relative;overflow:hidden}
        @media(max-width:480px){.finale{padding:60px 2%}}
        @media(max-width:360px){.finale{padding:48px 0}}
        .fin-in{position:relative;z-index:1;max-width:760px;margin:0 auto}
        .fin-tag{display:inline-flex;align-items:center;gap:8px;font-size:.66rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--g4);margin-bottom:22px}
        .fin-tag i{width:6px;height:6px;border-radius:50%;background:var(--o);animation:pulse 1.8s infinite}
        .fin-h{font-family:var(--serif);font-size:clamp(2.1rem,4.6vw,3.5rem);font-weight:300;color:var(--bk);letter-spacing:-.03em;line-height:1.06;margin-bottom:20px}
        .fin-h em{font-style:italic;color:var(--o);font-weight:300}
        .fin-sub{font-size:.95rem;color:var(--g5);line-height:1.75;max-width:520px;margin:0 auto 36px}
        .fin-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:16px}
        .fin-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:50px;padding:0 26px;border-radius:11px;font-size:.92rem;font-weight:600;font-family:var(--sans);cursor:pointer;background:var(--w);color:var(--g7);border:1px solid var(--g2);transition:background .2s ease,color .2s ease,border-color .2s ease,transform .2s ease}
        .fin-btn:hover{background:var(--ol);color:var(--bk);border-color:var(--om);transform:translateY(-2px)}
        .fin-btn-p{background:var(--o);border-color:var(--o);color:#fff;box-shadow:0 14px 30px -14px rgba(249,115,22,.85)}
        .fin-btn-p:hover{background:#ea6c0a;border-color:#ea6c0a;color:#fff}
        .fin-btn:focus-visible{outline:2px solid var(--o);outline-offset:3px}
        .fin-btn-p svg{transition:transform .2s ease}
        .fin-btn-p:hover svg{transform:translateX(3px)}
        .fin-note{font-size:.8rem;color:var(--g4);margin-bottom:44px}
        .fin-trust{list-style:none;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:720px;margin:0 auto}
        .fin-trust li{display:flex;align-items:center;justify-content:center;gap:9px;min-height:52px;padding:12px 16px;border-radius:12px;background:var(--w);border:1px solid var(--g2);font-size:.83rem;color:var(--g7);text-align:left}
        .fin-trust li::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--o);flex-shrink:0}
        @media(max-width:760px){.fin-trust{grid-template-columns:1fr;max-width:360px}}
        @media(max-width:420px){.fin-cta{flex-direction:column}.fin-btn{width:100%}}
        @media(max-width:480px){.p-card{padding:22px 18px}}
        @media(max-width:480px){.sec-h{margin-bottom:28px}}
        @media(max-width:480px){.h-badge{margin-bottom:14px}}
        @media(max-width:480px){.h-sub{margin-bottom:20px}}
        .f-glow{position:absolute;width:640px;height:640px;background:radial-gradient(closest-side,rgba(249,115,22,.1),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
        .f-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(28,25,23,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(28,25,23,.03) 1px,transparent 1px);background-size:36px 36px;pointer-events:none}
        footer.lf{border-top:1px solid var(--g2);padding:30px 5%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        @media(max-width:480px){footer.lf{padding:20px 4%;flex-direction:column;align-items:flex-start}}
        .f-links{display:flex;gap:20px;list-style:none}
        .f-links a{font-size:.75rem;color:var(--g5);text-decoration:none;transition:color .15s}
        .f-links a:hover{color:var(--bk)}
        .f-copy{font-size:.7rem;color:var(--g4)}
        .sec{padding:80px 5%;background:var(--w)}
        .sec-alt{background:var(--g0);border-top:1px solid var(--g2);border-bottom:1px solid var(--g2)}
        @media(max-width:768px){.sec{padding:56px 3%}}
        @media(max-width:480px){.sec{padding:40px 2%}}
        @media(max-width:360px){.sec{padding:32px 0}}
        .sec-w{max-width:1060px;margin:0 auto}
        .sec-h{text-align:center;margin-bottom:44px}
        .s-tag{font-size:.67rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#c2410c;margin-bottom:10px}
        .s-title{font-family:var(--serif);font-size:clamp(1.55rem,3.2vw,2.8rem);font-weight:300;letter-spacing:-.03em;line-height:1.1;color:var(--bk);margin-bottom:8px}
        .s-title em{font-style:italic;color:var(--o)}
        .s-sub{font-size:.93rem;color:var(--g5);line-height:1.7;max-width:440px;margin:0 auto}

        /* Hero app mockup: fixed 540 by 506 canvas, scales as one unit on small screens */
        .hero-visual{position:relative;display:flex;justify-content:center;min-width:0;padding:10px 0 26px;animation:fu .9s .3s ease both}
        .hero-visual::before{content:"";position:absolute;left:50%;top:-6%;width:720px;height:112%;transform:translateX(-50%);background:radial-gradient(closest-side,rgba(249,115,22,.1),transparent 70%);pointer-events:none}
        .hm-scale{position:relative;--s:1;width:680px;transform:scale(var(--s));transform-origin:top center;margin-bottom:calc((var(--s) - 1) * 506px)}
        @media(max-width:1100px){.hm-scale{--s:.92}}
        @media(max-width:1000px){.hm-scale{--s:.84}.hero-visual{padding-bottom:24px}}
        @media(max-width:880px){.hm-scale{--s:.74}.hero-visual{padding-bottom:20px}}
        @media(max-width:720px){.hm-scale{--s:.64}.hero-visual{padding-bottom:16px}}
        @media(max-width:560px){.hm-scale{--s:.54}.hero-visual{padding-bottom:12px}}
        @media(max-width:420px){.hm-scale{--s:.46}.hero-visual{padding-bottom:8px}}
        @media(max-width:340px){.hm-scale{--s:.4}.hero-visual{padding-bottom:4px}}
        .hm{width:680px;height:506px;background:var(--w);border:1px solid var(--g2);border-radius:18px;box-shadow:0 1px 1px rgba(28,25,23,.03),0 8px 20px -12px rgba(28,25,23,.18),0 34px 60px -30px rgba(28,25,23,.34);overflow:hidden;opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.3,1)}
        .hm.hm-on{opacity:1;transform:none}
        .hm-bar{display:flex;align-items:center;gap:10px;height:40px;padding:0 13px;background:linear-gradient(180deg,#fcfcfb,#f7f6f4);border-bottom:1px solid var(--g2)}
        .hm-dots{display:flex;gap:5px;flex-shrink:0}
        .hm-dots i{width:9px;height:9px;border-radius:50%;display:block}
        .hm-url{flex:1;min-width:0;background:rgba(231,229,228,.55);border:1px solid rgba(231,229,228,.9);border-radius:6px;padding:3px 10px;font-size:10.5px;color:var(--g4);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .hm-main{display:flex;height:424px}
        .hm-tabs{width:50px;flex-shrink:0;background:var(--g0);border-right:1px solid var(--g2);padding:11px 0;display:flex;flex-direction:column;align-items:center;gap:5px}
        .hm-tab{position:relative;width:34px;height:34px;border-radius:9px;border:1px solid transparent;background:transparent;color:var(--g4);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .18s ease,color .18s ease,border-color .18s ease,box-shadow .18s ease}
        .hm-tab:hover{background:var(--g1);color:var(--g7)}
        .hm-tab:focus-visible{outline:2px solid var(--o);outline-offset:1px}
        .hm-tab.is-active{background:var(--w);border-color:var(--om);color:var(--o);box-shadow:0 2px 6px rgba(249,115,22,.14)}
        .hm-body{flex:1;min-width:0;padding:13px 15px;display:flex;flex-direction:column}
        .hm-head{display:flex;align-items:center;gap:9px;margin-bottom:12px;padding-bottom:11px;border-bottom:1px solid var(--g2)}
        .hm-head-ic{display:flex;width:24px;height:24px;border-radius:7px;background:var(--ol);border:1px solid var(--om);color:var(--o);align-items:center;justify-content:center;flex-shrink:0}
        .hm-head-t{font-size:12px;font-weight:700;letter-spacing:-.01em;color:var(--bk)}
        .hm-head-h{font-size:10.5px;color:var(--g4);margin-left:auto;text-align:right}
        .hm-panel{flex:1;min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:11px;animation:hmfade .32s ease both}
        .hm-card{border:1px solid var(--g2);border-radius:12px;padding:12px;background:var(--g0)}
        .hm-eyebrow{font-size:9px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--g4)}
        .hm-eyebrow-o{color:var(--o)}
        .hm-input{font-size:11.5px;line-height:1.65;color:var(--g5);margin-top:7px}
        .hm-chips{display:flex;flex-wrap:wrap;gap:6px}
        .hm-chip{font-family:inherit;font-size:10.5px;font-weight:600;color:var(--g5);background:var(--w);border:1px solid var(--g2);border-radius:100px;padding:5px 11px;cursor:pointer;transition:color .18s ease,border-color .18s ease,background .18s ease,transform .18s ease}
        .hm-chip:hover{transform:translateY(-1px);border-color:var(--om);color:var(--bk)}
        .hm-chip:focus-visible{outline:2px solid var(--o);outline-offset:2px}
        .hm-chip.is-active{background:var(--ol);border-color:var(--o);color:var(--o)}
        .hm-out{background:linear-gradient(180deg,#fffaf5,#fff7ed);border-color:var(--om);margin-top:auto;box-shadow:0 6px 18px rgba(249,115,22,.1)}
        .hm-out-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
        .hm-count{font-size:10px;font-weight:700;color:var(--o)}
        .hm-out-text{font-size:11.5px;line-height:1.7;color:var(--g7);margin:8px 0 11px}
        .hm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:11px}
        .hm-stat{background:var(--w);border:1px solid var(--om);border-radius:9px;padding:7px 9px;display:flex;flex-direction:column;gap:2px}
        .hm-stat-k{font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--g4)}
        .hm-stat-v{font-family:var(--serif);font-size:14px;color:var(--bk)}
        .hm-keys{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
        .hm-key{font-size:9.5px;font-weight:600;color:var(--o);background:var(--ol);border:1px solid var(--om);border-radius:100px;padding:3px 9px}
        .hm-bar-track{height:4px;border-radius:100px;background:#fed7aa;overflow:hidden}
        .hm-bar-track i{display:block;height:100%;border-radius:100px;background:var(--o);transition:width .12s linear}
        .hm-rows-wrap{position:relative;flex:1;min-height:0}
        .hm-rows-fade{position:absolute;left:0;right:0;bottom:0;height:26px;background:linear-gradient(180deg,rgba(255,255,255,0),#fff);pointer-events:none}
        .hm-rows{display:flex;flex-direction:column;gap:6px;height:100%;overflow-y:auto;scrollbar-width:none;overscroll-behavior:contain;padding-bottom:14px}
        .hm-rows::-webkit-scrollbar{display:none}
        .hm-row{position:relative;display:flex;align-items:center;gap:10px;width:100%;text-align:left;font-family:inherit;padding:7px 11px;border-radius:10px;border:1px solid var(--g2);background:var(--w);cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease}
        .hm-row:hover{transform:translateY(-1px);border-color:var(--om);box-shadow:0 4px 12px rgba(28,25,23,.05)}
        .hm-row:focus-visible{outline:2px solid var(--o);outline-offset:2px}
        .hm-row.is-active{border-color:var(--om);background:var(--ol);box-shadow:0 4px 14px rgba(249,115,22,.1)}
        .hm-row.is-active::before{content:"";position:absolute;left:-1px;top:50%;transform:translateY(-50%);width:3px;height:18px;border-radius:100px;background:var(--o)}
        .hm-row-ic{display:flex;width:23px;height:23px;border-radius:7px;background:var(--w);border:1px solid var(--g2);color:var(--c);align-items:center;justify-content:center;flex-shrink:0}
        .hm-row.is-active .hm-row-ic{background:var(--w);border-color:var(--om)}
        .hm-row-n{font-size:11.5px;font-weight:600;color:var(--g7);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .hm-row.is-active .hm-row-n{color:var(--bk);font-weight:700}
        .hm-row-m{font-size:10px;color:var(--g4);white-space:nowrap}
        .hm-row.is-active .hm-row-m{color:var(--o)}
        .hm-note{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--g4)}
        .hm-note svg{color:var(--o)}
        .hm-preview{border:1px solid var(--g2);border-radius:12px;padding:11px 12px;background:linear-gradient(180deg,#fff,#fbfaf9);box-shadow:0 4px 14px rgba(28,25,23,.05);animation:hmfade .3s ease both;margin-top:auto}
        .hm-preview .hm-eyebrow{color:var(--o)}
        .hm-preview-text{font-size:11px;line-height:1.65;color:var(--g5);margin-top:6px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
        .hm-chat{display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;overflow-y:auto;scrollbar-width:none;overscroll-behavior:contain}
        .hm-chat::-webkit-scrollbar{display:none}
        .hm-msg{display:flex}
        .hm-msg.is-user{justify-content:flex-end}
        .hm-bubble{max-width:86%;padding:8px 11px;border-radius:12px 12px 12px 3px;background:var(--g1);color:var(--g7);font-size:11px;line-height:1.6;white-space:pre-line}
        .hm-msg.is-user .hm-bubble{background:var(--bk);color:#fff;border-radius:12px 12px 3px 12px}
        .hm-bubble.is-ai{background:var(--ol);color:var(--g7)}
        .hm-typing{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--g4);padding:6px 2px}
        .hm-typing i{width:5px;height:5px;border-radius:50%;background:var(--o);animation:pulse 1.4s infinite}
        .hm-typing i:nth-child(2){animation-delay:.2s}
        .hm-typing i:nth-child(3){animation-delay:.4s}
        .hm-chips-b{margin-top:auto;padding-top:8px}
        .hm-uses{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
        .hm-meter{margin-top:11px}
        .hm-meter:first-of-type{margin-top:9px}
        .hm-meter-top{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px}
        .hm-meter-l{font-size:10.5px;color:var(--g5)}
        .hm-meter-v{font-family:var(--serif);font-size:12px;color:var(--bk)}
        .hm-meter-track{height:5px;border-radius:100px;background:#eceae5;overflow:hidden}
        .hm-meter-track i{display:block;height:100%;border-radius:100px;transition:width .45s ease}
        .hm-toggle{display:flex;align-items:center;gap:10px;width:100%;text-align:left;font-family:inherit;padding:11px;border-radius:12px;border:1px solid var(--g2);background:var(--w);cursor:pointer;margin-top:auto;transition:border-color .18s ease,background .18s ease}
        .hm-toggle:hover{border-color:var(--om)}
        .hm-toggle:focus-visible{outline:2px solid var(--o);outline-offset:2px}
        .hm-toggle.is-on{background:#f0fdf4;border-color:#bbf7d0}
        .hm-toggle-dot{position:relative;width:32px;height:18px;border-radius:100px;background:#d6d3d1;flex-shrink:0;transition:background .2s ease}
        .hm-toggle-dot::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s ease}
        .hm-toggle.is-on .hm-toggle-dot{background:#22c55e}
        .hm-toggle.is-on .hm-toggle-dot::after{transform:translateX(14px)}
        .hm-toggle-tx{font-size:10.5px;font-weight:600;color:var(--g7)}
        .hm-toggle.is-on .hm-toggle-tx{color:#15803d}
        .hm-foot{display:flex;align-items:center;gap:10px;height:42px;padding:0 15px;background:linear-gradient(180deg,#17150f,#0c0a09);font-size:11px;color:rgba(255,255,255,.66)}
        .hm-foot b{color:#fff;font-weight:600}
        .hm-foot-line{flex:1;height:1px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.28) 0 5px,transparent 5px 10px)}
        @keyframes hmfade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        :focus-visible{outline:2px solid var(--o);outline-offset:2px}
        @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.hm{opacity:1;transform:none;transition:none}.hm-panel,.hm-preview{animation:none}.hm-typing i{animation:none}}

      `}</style>

      <section className="hero-section">
        <div className="hero">
          <div className="hero-copy">
            <div className="h-badge">
              <span className="h-badge-icon" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#f97316" opacity="0.9"/>
                  <path d="M2 17l10 5 10-5" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 12l10 5 10-5" stroke="#ea580c" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="h-badge-text">Built for content creators</span>
              <span className="h-badge-glow" aria-hidden="true" />
            </div>
            <h1 className="h-h1">Your content,<br /><em>repurposed</em> for<br /><strong>every platform.</strong></h1>
            <p className="h-typ">Turn any idea into a <TypingEffect /></p>
            <p className="h-sub">AI-powered content platform for creators. Summarize videos, remix into multiple formats, chat with AI, and publish in your brand voice all in one place.</p>
            <div className="h-ctas">
              <button className="btn-p" onClick={() => window.location.href="/sign-up"}>
                Get started
              </button>
            </div>
          </div>
          <div className="hero-visual"><div className="hm-scale"><HeroMockup /></div></div>
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
                <p className="b-desc" style={{ marginBottom: 20 }}>YouTube URL or paste text.</p>
                <div className="b-modes">
                  {[
                    { m: "Executive Brief", badge: "POPULAR", Icon: FileText },
                    { m: "Action Items", badge: "", Icon: ListChecks },
                    { m: "SWOT Analysis", badge: "", Icon: LayoutGrid },
                  ].map(({ m, badge, Icon }) => (
                    <div key={m} className={`b-mode${badge ? " is-hot" : ""}`}>
                      <span className="b-mode-ic"><Icon size={15} strokeWidth={2} /></span>
                      <span className="b-mode-n">{m}</span>
                      {badge && <span className="b-mode-b">{badge}</span>}
                    </div>
                  ))}
                  <div className="b-mode is-more">
                    <span className="b-mode-ic"><Plus size={15} strokeWidth={2} /></span>
                    <span className="b-mode-n">+ 7 more modes</span>
                  </div>
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
              <div className="b-formats">
                {[
                  { l: "Twitter Thread", icon: "x", c: "#000000" },
                  { l: "LinkedIn Post", icon: "linkedin", c: "#0A66C2" },
                  { l: "Email Newsletter", icon: "email", c: "#EA4335" },
                  { l: "YT Description", icon: "youtube", c: "#FF0000" },
                  { l: "Podcast Notes", icon: "spotify", c: "#1DB954" },
                  { l: "Blog Outline", icon: "medium", c: "#111111" },
                  { l: "Instagram Caption", icon: "instagram", c: "#E4405F" },
                  { l: "Short-form Script", icon: "shorts", c: "#FF0000" },
                ].map((f) => (
                  <div key={f.l} className="b-format" style={{ ["--c" as string]: f.c }}>
                    <span className="b-format-ic"><BrandIcon name={f.icon} size={14} /></span>
                    <span className="b-format-n">{f.l}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Chat */}
            <div className="b-card" style={{ gridColumn: "span 6" }}>
              <div className="b-in">
                <div className="b-tag">AI Chat</div>
                <h3 className="b-title"><em>Creator-focused</em> AI<br />that remembers you.</h3>
                <p className="b-desc">Ask about any of your content, with creator prompt starters.</p>
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
                <p className="b-desc">Clario learns from your published samples, not a style guide.</p>
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

      <section className="sec sec-alt" id="demo">
        <div className="sec-w">
          <div className="sec-h">
            <div className="s-tag">Live demo</div>
            <h2 className="s-title">One video in.<br /><em>Ten ready drafts</em> out.</h2>
            <p className="s-sub">Pick a format and the draft rewrites itself in your brand voice, ready to paste.</p>
          </div>
          <div className="demo-box" ref={demoRef}>
            <div className="dm-side">
              <div className="dm-side-in">
                <p className="dm-cap">Choose an output format</p>
                <div className="dm-list" role="radiogroup" aria-label="Output format">
                  {remixFormats.map((f, i) => (
                    <button
                      key={f.label}
                      role="radio"
                      aria-checked={i === remixActive}
                      className={`dm-item${i === remixActive ? " is-active" : ""}`}
                      onClick={() => handleRemix(i)}
                    >
                      <span className="dm-item-ic" style={{ ["--c" as string]: f.color }}><BrandIcon name={f.icon} size={13} /></span>
                      <span className="dm-item-tx">
                        <span className="dm-item-n">{f.label}</span>
                        <span className="dm-item-m">{f.meta}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="dm-usage">
                <div className="dm-usage-top">
                  <span>Requests per week</span>
                  <span className="dm-chip-up">+34%</span>
                </div>
                <div className="dm-bars">
                  {[42,68,55,89,74,96,83].map((v,i) => (
                    <div key={i} className="dm-bar">
                      <span className={i===5?"is-peak":i===3?"is-mid":""} style={{ height: demoInView?`${v}%`:"0%", transition: `height .9s ${i*.08}s cubic-bezier(.34,1.56,.64,1)` }} />
                    </div>
                  ))}
                </div>
                <svg viewBox="0 0 180 24" fill="none" className="dm-spark" aria-hidden="true">
                  <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity=".2"/><stop offset="100%" stopColor="#f97316" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 18L26 14L52 16L78 5L104 10L130 2L156 7L180 4" stroke="#f97316" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M0 18L26 14L52 16L78 5L104 10L130 2L156 7L180 4L180 24L0 24Z" fill="url(#sg)"/>
                </svg>
                <span className="dm-usage-note">Sample week, shown for illustration</span>
              </div>
            </div>

            <div className="dm-main">
              <div className="dm-bar-top">
                <span className="dm-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="dm-file">{remixFormats[remixActive].label}.txt</span>
                <span className="dm-live"><i />Live</span>
              </div>
              <div className="dm-src">
                <span className="dm-src-l">Source</span>
                <span className="dm-src-t">47 min YouTube video, 8,412 words, auto captions on</span>
              </div>
              <div className="dm-body">
                <p className="dm-out" style={{ opacity: remixFading ? 0 : 1 }}>{remixFormats[remixActive].preview}</p>
              </div>
              <div className="dm-actions">
                <button
                  className="dm-btn dm-btn-p"
                  onClick={() => {
                    const text = remixFormats[remixActive].preview;
                    if (navigator.clipboard) navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  }}
                >
                  {copied ? "Copied" : "Copy draft"}
                </button>
                <button className="dm-btn" onClick={() => handleRemix((remixActive + 1) % remixFormats.length)}>Next format</button>
                <span className="dm-meta">Brand voice on, same tone every time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="pricing">
        <div className="sec-w">
          <div className="sec-h">
            <div className="s-tag">Pricing</div>
            <h2 className="s-title">Simple, <em>honest</em> pricing.</h2>
            <p className="s-sub">The free plan is live now. Pro is coming soon with even more power.</p>
          </div>
          <div className="p-grid">
            <div className="p-card feat">
              <div className="p-badge">FREE FOREVER</div>
              <div className="p-plan">Free</div>
              <div className="p-price">$0<sub>/mo</sub></div>
              <p className="p-desc">Everything to get started. No card required.</p>
              <ul className="p-list">
                {["100 AI requests/month","Chat + Summarizer","10 summary modes","1 Brand Voice","3 Remix formats","Email support"].map(item => (
                  <li key={item} className="p-item"><span className="p-ck">✓</span>{item}</li>
                ))}
              </ul>
              <button className="btn-pp" onClick={() => window.location.href="/sign-up"}>Get started free</button>
            </div>
            <div className="p-card">
              <div className="p-plan">Pro</div>
              <div className="p-price">$19<sub>/mo</sub></div>
              <p className="p-desc">For creators who ship content every day.</p>
              <ul className="p-list">
                {["1,000 AI requests/month","All 10 Remix formats","Export to Notion / Google Docs","AI Image Prompt Generator","3 Brand Voices","Priority support"].map(item => (
                  <li key={item} className="p-item"><span className="p-ck">✓</span>{item}</li>
                ))}
              </ul>
              <button className="btn-pf" disabled>Coming soon</button>
            </div>
          </div>
          <p className="p-note">One summary or one chat message counts as one request.</p>
        </div>
      </section>

      <section className="finale">
        <div className="f-glow" /><div className="f-grid" />
        <div className="fin-in">
          <p className="fin-tag"><i />One toolkit, four tools</p>
          <h2 className="fin-h">Your content,<br /><em>multiplied.</em></h2>
          <p className="fin-sub">The AI toolkit built for YouTubers, podcasters, and bloggers. Summarize in seconds, remix for every platform, and keep your voice.</p>
          <div className="fin-cta">
            <button className="fin-btn fin-btn-p" onClick={() => window.location.href="/sign-up"}>
              Start for free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="fin-btn" onClick={() => window.location.href="/pricing"}>See pricing</button>
          </div>
          <p className="fin-note">The free plan is live now. Pro is coming soon.</p>
        </div>
      </section>
      </div>
    </>
  );
}
