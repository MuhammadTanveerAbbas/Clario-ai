"use client";
import { useState } from "react";
import {
  FileText,
  ListChecks,
  LayoutGrid,
  Plus,
  Sparkles,
  MessageSquare,
  Mic,
  MessageCircle,
  RefreshCw,
  Youtube,
  Brain,
  History,
  Check,
  Copy,
  ArrowRight,
  Layers,
  Play,
  Tag,
} from "lucide-react";
import GradientASCII from "@/components/GradientASCII";
import { Safari } from "@/components/ui/safari";

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

export default function LandingPage() {
  const remixFormats = [
    {
      icon: "x",
      color: "#000000",
      label: "Twitter Thread",
      meta: "5-part thread",
      preview:
        "1/ Most creators burn out not from lack of ideas, but from starting from a blank page every single day.\n\n2/ The fix is a repeatable pipeline: record one core video, extract the transcript, and adapt it for each channel.\n\n3/ Your audience on X wants sharp takeaways. Your newsletter readers want depth and context.\n\n4/ Keep one brand voice across all of them so every post still sounds unmistakably like you.",
    },
    {
      icon: "linkedin",
      color: "#0A66C2",
      label: "LinkedIn Post",
      meta: "Feed post",
      preview:
        "I stopped writing every post from scratch—and our weekly output tripled.\n\nHere is the 3-step workflow we use:\n• Start with one 10-minute video or voice memo\n• Pull out the core argument and three supporting stories\n• Adapt the tone for LinkedIn without losing your voice\n\nWhat part of content repurposing takes you the longest?",
    },
    {
      icon: "email",
      color: "#EA4335",
      label: "Email Newsletter",
      meta: "Email draft",
      preview:
        "Subject: Why one good idea should power your whole week\n\nHey there,\n\nMost teams treat every platform like a separate job. This week we broke down how to turn a single YouTube walkthrough into a newsletter, thread, and summary in under ten minutes.\n\nThree takeaways inside:\n1. Lead with the sharpest contrarian point\n2. Keep formatting native to each inbox or feed\n3. Save your best phrases in a shared voice profile",
    },
    {
      icon: "youtube",
      color: "#FF0000",
      label: "YT Description",
      meta: "Description",
      preview:
        "In this video, we walk through how to turn one long-form recording into ten ready-to-publish drafts without losing your natural tone.\n\nChapters:\n00:00 Why single-channel publishing wastes effort\n02:18 Extracting clean takeaways from transcripts\n06:45 Adapting hooks for X, LinkedIn, and Email\n11:10 Reviewing drafts with a saved Brand Voice",
    },
    {
      icon: "spotify",
      color: "#1DB954",
      label: "Podcast Notes",
      meta: "Episode notes",
      preview:
        "Episode Summary:\nA practical breakdown of building a sustainable creator workflow around one weekly anchor piece.\n\nKey Takeaways:\n• Treat long-form video or audio as your single source of truth\n• Separate drafting from formatting so you ship faster\n• Track weekly requests and format performance in one place",
    },
    {
      icon: "instagram",
      color: "#E4405F",
      label: "Instagram Caption",
      meta: "Caption draft",
      preview:
        "One recording. Ten drafts. Zero blank-page panic.\n\nWhen you already did the hard thinking in your video, rewriting it five times by hand is wasted energy. Keep the core story, trim the fluff, and tailor the hook for each feed.\n\nSave this workflow for your next launch week.\n\n#CreatorWorkflow #ContentStrategy #RepurposeContent",
    },
  ];

  const [remixActive, setRemixActive] = useState(0);
  const [remixFading, setRemixFading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRemix = (i: number) => {
    if (i === remixActive) return;
    setRemixFading(true);
    setTimeout(() => {
      setRemixActive(i);
      setRemixFading(false);
    }, 150);
  };

  const creatorTools = [
    {
      t: "Summarizer",
      d: "Turn long articles, docs, and URLs into structured briefs in seconds.",
      Icon: FileText,
      color: "#ea580c",
      bg: "#fff7ed",
    },
    {
      t: "Remix Studio",
      d: "Transform one source piece into platform-ready drafts across 10 formats.",
      Icon: Sparkles,
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      t: "AI Chat",
      d: "Brainstorm, refine hooks, and iterate with saved conversation history.",
      Icon: MessageSquare,
      color: "#0284c7",
      bg: "#f0f9ff",
    },
    {
      t: "Brand Voice",
      d: "Train Clario on your writing samples so every draft sounds like you.",
      Icon: Mic,
      color: "#e11d48",
      bg: "#fff1f2",
    },
    {
      t: "Comment Generator",
      d: "Draft thoughtful, on-brand replies for X and LinkedIn conversations.",
      Icon: MessageCircle,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      t: "Repurpose",
      d: "Spin existing high-performing posts into fresh angles and new formats.",
      Icon: RefreshCw,
      color: "#0d9488",
      bg: "#f0fdfa",
    },
    {
      t: "YouTube Summarizer",
      d: "Extract key points, chapters, and quotes directly from video transcripts.",
      Icon: Youtube,
      color: "#dc2626",
      bg: "#fef2f2",
    },
    {
      t: "AI Memory",
      d: "Keep audience context, product facts, and key guidelines always on hand.",
      Icon: Brain,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      t: "History",
      d: "Search, revisit, and export every past summary, remix, and chat.",
      Icon: History,
      color: "#57534e",
      bg: "#f5f5f4",
    },
  ];

  const activeDraft = remixFormats[remixActive];
  const wordCount = activeDraft.preview.trim().split(/\s+/).length;

  return (
    <>
      <div className="pg">
      <style>{`
        .pg *,.pg *::before,.pg *::after{box-sizing:border-box;margin:0;padding:0}
        :root{--o:var(--color-accent);--ol:var(--brand-soft);--om:#fed7aa;--bk:var(--color-ink);--g7:#44403c;--g5:var(--color-muted);--g4:var(--color-ink-2);--g2:#e7e5e4;--g1:#f5f5f4;--g0:var(--color-code-panel);--w:var(--color-paper);--serif:var(--font-fraunces),Georgia,serif;--sans:var(--font-inter),system-ui,sans-serif}
        html{scroll-behavior:smooth;scrollbar-width:none;-ms-overflow-style:none}
        html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}
        body{font-family:var(--sans);background:var(--w);color:var(--bk);-webkit-font-smoothing:antialiased;overflow-x:clip}
        .pg{display:contents}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}
        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .hero-section{position:relative;overflow:hidden;background:var(--w)}
        .hero-ascii{position:absolute;inset:0;z-index:0;pointer-events:none}
        .hero-ascii .gradient-ascii-container{width:100%;height:100%}
        .hero{min-height:calc(100vh - 96px);padding:32px 5% 24px;display:flex;flex-direction:column;align-items:center;gap:24px;max-width:1080px;margin:0 auto;position:relative;z-index:1}
        .intro-copy{width:100%;max-width:660px;display:flex;flex-direction:column;align-items:center;text-align:center}
        .h-badge{display:inline-flex;align-items:center;gap:8px;background:var(--color-white);border:1px solid var(--color-rule);border-radius:var(--radius-pill);padding:6px 14px;font-size:var(--text-xs);line-height:1;color:var(--color-ink);margin-bottom:16px}
        .h-badge-mark{width:14px;height:14px;flex:none}
        .hero-visual{width:100%;max-width:1040px;margin:0 auto}
        @media(max-width:860px){.hero{padding-top:44px;gap:34px}}
        @media(max-width:480px){.hero{padding:24px 4% 48px;gap:28px}}
        .h-h1{font-family:var(--serif);font-size:clamp(2rem,5vw,3.6rem);line-height:1.04;letter-spacing:-.035em;font-weight:300;margin-bottom:12px;color:var(--bk);animation:fu .6s .1s ease both}
        .h-h1-accent{font-style:italic;color:var(--bk)}
        .h-h1 strong{font-weight:400}
        .h-sub{font-size:1.05rem;color:var(--g5);line-height:1.75;max-width:520px;margin:0 auto 30px;animation:fu .6s .2s ease both}
        .h-ctas{display:flex;gap:11px;flex-wrap:wrap;justify-content:center;margin-bottom:28px;animation:fu .6s .25s ease both}
        .btn-p{position:relative;background:var(--o);color:var(--color-paper);min-height:50px;padding:0 26px;border-radius:11px;font-size:.9rem;font-weight:600;border:none;cursor:pointer;font-family:var(--sans);letter-spacing:-.01em;transition:transform .2s ease,background .2s ease,box-shadow .2s ease;display:inline-flex;align-items:center;gap:9px}
        .btn-p:hover{background:var(--color-accent-hover);transform:translateY(-2px)}
        .btn-p:active{transform:translateY(0)}
        .btn-p:focus-visible{outline:2px solid var(--o);outline-offset:3px}
        @media(max-width:420px){.h-ctas{justify-content:center}.btn-p{width:100%;justify-content:center}}

        /* Features Bento */
        .b-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
        @media(max-width:960px){.b-grid>*{grid-column:span 6!important}}
        @media(max-width:640px){.b-grid>*{grid-column:span 12!important}}
        .b-card{background:var(--w);border-radius:18px;border:1px solid var(--g2);overflow:hidden;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;display:flex;flex-direction:column;justify-content:space-between}
        .b-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px -16px rgba(23,20,18,.12);border-color:#d6d3d1}
        .b-in{padding:26px 26px 20px}
        @media(max-width:640px){.b-in{padding:20px 20px 16px}}
        .b-kicker{display:inline-flex;align-items:center;gap:6px;font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--o);margin-bottom:10px}
        .b-title{font-family:var(--serif);font-size:1.45rem;font-weight:300;letter-spacing:-.03em;line-height:1.18;color:var(--bk);margin-bottom:8px}
        .b-title em{font-style:italic;color:var(--o)}
        .b-desc{font-size:.875rem;color:var(--g5);line-height:1.6}
        .b-panel{background:var(--g0);border-top:1px solid var(--g2);padding:20px 26px;flex:1;display:flex;flex-direction:column;justify-content:center}
        @media(max-width:640px){.b-panel{padding:18px 20px}}
        .b-modes{display:flex;flex-direction:column;gap:8px}
        .b-mode{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:11px;background:var(--w);border:1px solid var(--g2);transition:transform .18s ease,border-color .18s ease}
        .b-mode.is-hot{background:var(--ol);border-color:var(--om)}
        .b-mode-ic{display:flex;width:28px;height:28px;border-radius:8px;background:var(--g0);border:1px solid var(--g2);color:var(--g7);align-items:center;justify-content:center;flex-shrink:0}
        .b-mode.is-hot .b-mode-ic{background:var(--w);border-color:var(--om);color:var(--o)}
        .b-mode-n{flex:1;font-size:.84rem;font-weight:600;color:var(--g7);letter-spacing:-.01em}
        .b-mode.is-hot .b-mode-n{color:var(--bk)}
        .b-mode-b{font-size:.68rem;font-weight:600;letter-spacing:.06em;color:var(--o);background:var(--w);border:1px solid var(--om);padding:2px 8px;border-radius:100px}
        .b-mode.is-more{background:transparent;border-style:dashed}
        .b-mode.is-more .b-mode-n{color:var(--g5);font-weight:500}
        .b-formats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        @media(max-width:520px){.b-formats{grid-template-columns:1fr}}
        .b-format{display:flex;align-items:center;gap:11px;padding:12px 13px;border-radius:11px;background:var(--w);border:1px solid var(--g2);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
        .b-format:hover{transform:translateY(-2px);border-color:var(--om);box-shadow:0 8px 18px -12px rgba(28,25,23,.25)}
        .b-format-ic{display:flex;width:30px;height:30px;border-radius:8px;background:var(--g0);border:1px solid var(--g2);color:var(--c);align-items:center;justify-content:center;flex-shrink:0}
        .b-format-tx{min-width:0}
        .b-format-n{display:block;font-size:.84rem;font-weight:600;color:var(--bk);letter-spacing:-.01em}
        .b-format-m{display:block;font-size:.72rem;color:var(--g4)}

        /* Demo Studio */
        .demo-box{border-radius:18px;border:1px solid var(--g2);background:var(--w);overflow:hidden;box-shadow:0 10px 40px -18px rgba(23,20,18,.12);display:grid;grid-template-columns:270px 1fr}
        @media(max-width:780px){.demo-box{grid-template-columns:1fr}}
        .dm-side{display:flex;flex-direction:column;border-right:1px solid var(--g2);background:var(--g0);padding:18px}
        @media(max-width:780px){.dm-side{border-right:none;border-bottom:1px solid var(--g2);padding:16px}}
        .dm-cap{font-size:.72rem;font-weight:600;color:var(--g4);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px}
        .dm-list{display:flex;flex-direction:column;gap:4px}
        @media(max-width:780px){.dm-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}}
        @media(max-width:480px){.dm-list{grid-template-columns:1fr}}
        .dm-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 11px;border-radius:10px;border:1px solid transparent;background:transparent;cursor:pointer;font-family:var(--sans);transition:background .18s ease,border-color .18s ease}
        .dm-item:hover{background:var(--w);border-color:var(--g2)}
        .dm-item:focus-visible{outline:2px solid var(--o);outline-offset:2px}
        .dm-item.is-active{background:var(--w);border-color:var(--om);box-shadow:0 4px 12px -8px rgba(249,115,22,.4)}
        .dm-item-ic{display:flex;width:28px;height:28px;border-radius:8px;background:var(--w);border:1px solid var(--g2);color:var(--c);align-items:center;justify-content:center;flex-shrink:0}
        .dm-item.is-active .dm-item-ic{background:var(--ol);border-color:var(--om)}
        .dm-item-tx{display:block;min-width:0}
        .dm-item-n{display:block;font-size:.82rem;font-weight:600;color:var(--g7);letter-spacing:-.01em}
        .dm-item.is-active .dm-item-n{color:var(--o)}
        .dm-item-m{display:block;font-size:.72rem;color:var(--g4);margin-top:1px}
        .dm-main{display:flex;flex-direction:column;min-width:0}
        .dm-bar-top{display:flex;align-items:center;gap:9px;padding:12px 20px;border-bottom:1px solid var(--g1);background:var(--w)}
        .dm-file{font-size:.76rem;font-weight:600;color:var(--g7)}
        .dm-live{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:600;letter-spacing:.06em;color:var(--o);text-transform:uppercase}
        .dm-live i{width:6px;height:6px;border-radius:50%;background:var(--o);animation:pulse 1.5s infinite}
        .dm-src{display:flex;align-items:center;gap:10px;padding:11px 20px;border-bottom:1px solid var(--g1);background:var(--ol)}
        .dm-src-l{font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--o);background:var(--w);border:1px solid var(--om);border-radius:100px;padding:3px 9px;flex-shrink:0}
        .dm-src-t{font-size:.8rem;color:var(--g7);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .dm-body{padding:22px 20px;flex:1;display:flex;align-items:flex-start}
        .dm-out{font-family:var(--sans);font-size:.88rem;color:var(--g7);line-height:1.7;white-space:pre-wrap;word-break:break-word;transition:opacity .15s ease}
        .dm-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 20px;border-top:1px solid var(--g1);background:var(--g0)}
        .dm-btn{display:inline-flex;align-items:center;gap:7px;padding:0 16px;min-height:42px;border-radius:10px;border:1px solid var(--g2);background:var(--w);color:var(--g7);font-size:.8rem;font-weight:600;font-family:var(--sans);cursor:pointer;transition:border-color .18s ease,color .18s ease,transform .18s ease,background .18s ease}
        .dm-btn:hover{border-color:var(--bk);color:var(--bk);transform:translateY(-1px)}
        .dm-btn-p{background:var(--o);border-color:var(--o);color:var(--color-paper);box-shadow:0 6px 16px -8px rgba(249,115,22,.8)}
        .dm-btn-p:hover{background:var(--color-accent-hover);border-color:var(--color-accent-hover);color:var(--color-paper)}
        .dm-btn:focus-visible{outline:2px solid var(--o);outline-offset:2px}
        .dm-meta{margin-left:auto;font-size:.75rem;color:var(--g4)}
        @media(max-width:480px){.dm-meta{margin-left:0;width:100%}}

        /* Creator OS 3x3 Grid */
        .os-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        @media(max-width:900px){.os-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:900px) and (min-width:561px){.os-grid .os-card:last-child{display:none}}
        @media(max-width:560px){.os-grid{grid-template-columns:1fr}}
        .os-card{background:var(--w);border:1px solid var(--g2);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:14px;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
        .os-card:hover{transform:translateY(-3px);box-shadow:0 14px 34px -16px rgba(23,20,18,.12);border-color:#d6d3d1}
        .os-head{display:flex;align-items:center;gap:12px}
        .os-ic{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(28,25,23,.06)}
        .os-title{font-family:var(--serif);font-size:1.1rem;font-weight:500;letter-spacing:-.02em;line-height:1.25;color:var(--bk)}
        .os-desc{font-size:.86rem;color:var(--g5);line-height:1.6}

        /* Pricing */
        .p-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:920px;margin:0 auto}
        @media(max-width:600px){.p-grid{grid-template-columns:1fr}}
        .p-card{border-radius:18px;padding:30px;border:1.5px solid var(--g2);background:var(--w);position:relative;transition:transform .25s,box-shadow .25s;display:flex;flex-direction:column}
        .p-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.07)}
        .p-card.feat{background:var(--w);border-color:var(--om)}
        .p-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--g1);color:var(--g7);border:1px solid var(--g2);font-size:.72rem;font-weight:600;padding:3px 12px;border-radius:100px;letter-spacing:.08em;white-space:nowrap}
        .p-card.feat .p-badge{background:var(--ol);color:var(--o);border-color:var(--om)}
        .p-plan{font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--g4);margin-bottom:10px}
        .p-card.feat .p-plan{color:var(--o)}
        .p-price{font-family:var(--serif);font-size:2.8rem;font-weight:300;letter-spacing:-.05em;line-height:1;color:var(--bk);margin-bottom:5px}
        .p-price sub{font-size:.82rem;font-family:var(--sans);font-weight:400;color:var(--g5);letter-spacing:0;vertical-align:middle}
        .p-desc{font-size:.8rem;color:var(--g5);margin-bottom:18px;line-height:1.5}
        .p-note{text-align:center;font-size:.8rem;color:var(--g4);margin-top:22px}
        .p-list{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:24px;flex:1}
        .p-item{display:flex;align-items:flex-start;gap:8px;font-size:.82rem;color:var(--g7)}
        .p-ck{width:16px;height:16px;border-radius:50%;background:var(--ol);color:var(--o);font-size:.6rem;display:flex;align-items:center;justify-content:center;font-weight:600;flex-shrink:0;margin-top:2px}
        .p-card.feat .p-ck{background:var(--om)}
        .btn-pf{width:100%;min-height:46px;border-radius:11px;font-size:.82rem;font-weight:600;font-family:var(--sans);background:transparent;color:var(--bk);border:1.5px solid var(--g2);cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease,transform .2s ease;letter-spacing:-.01em}
        .btn-pf:disabled{background:var(--g1);color:var(--g4);border-style:dashed;cursor:not-allowed}

        /* Finale */
        .finale{padding:32px 5% 88px;background:var(--w)}
        @media(max-width:480px){.finale{padding:20px 4% 60px}}
        .fin-card{max-width:1060px;margin:0 auto;border-radius:18px;border:1px solid var(--g2);background:var(--g0);padding:48px 44px;display:flex;align-items:center;justify-content:space-between;gap:36px}
        @media(max-width:780px){.fin-card{flex-direction:column;align-items:flex-start;padding:36px 24px;gap:24px}}
        .fin-copy{max-width:520px;text-align:left}
        .fin-h{font-family:var(--serif);font-size:clamp(1.9rem,3.6vw,2.75rem);font-weight:300;color:var(--bk);letter-spacing:-.03em;line-height:1.08;margin-bottom:10px;max-width:none}
        .fin-h em{font-style:italic;color:var(--o);font-weight:300}
        .fin-sub{font-size:.94rem;color:var(--g5);line-height:1.65;margin:0}
        .fin-actions{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0}
        @media(max-width:780px){.fin-actions{align-items:flex-start;width:100%}}
        .fin-cta{display:flex;gap:10px;flex-wrap:wrap}
        .fin-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 22px;border-radius:11px;font-size:.88rem;font-weight:600;font-family:var(--sans);cursor:pointer;background:var(--w);color:var(--g7);border:1px solid var(--g2);transition:background .2s ease,color .2s ease,border-color .2s ease,transform .2s ease}
        .fin-btn:hover{background:var(--ol);color:var(--bk);border-color:var(--om);transform:translateY(-1px)}
        .fin-btn-p{background:var(--o);border-color:var(--o);color:var(--color-paper)}
        .fin-btn-p:hover{background:var(--color-accent-hover);border-color:var(--color-accent-hover);color:var(--color-paper)}
        .fin-btn:focus-visible{outline:2px solid var(--o);outline-offset:3px}
        .fin-note{font-size:.76rem;color:var(--g4);margin:0}
        @media(max-width:440px){.fin-cta{flex-direction:column;width:100%}.fin-btn{width:100%}}
        @media(max-width:480px){.p-card{padding:24px 20px}}
        @media(max-width:480px){.sec-h{margin-bottom:28px}}
        @media(max-width:480px){.h-sub{margin-bottom:20px}}

        .sec{padding:80px 5%;background:var(--w)}
        .hero-section + .sec,.sec + .sec,.sec + .finale{margin-top:var(--section-gap-s,80px)}
        .sec-alt{background:var(--g0);border-top:1px solid var(--g2);border-bottom:1px solid var(--g2)}
        @media(max-width:768px){.sec{padding:56px 4%}.hero-section + .sec,.sec + .sec,.sec + .finale{margin-top:48px}}
        @media(max-width:480px){.sec{padding:44px 4%}.hero-section + .sec,.sec + .sec,.sec + .finale{margin-top:32px}}
        .sec-w{max-width:1060px;margin:0 auto}
        .sec-h{display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:44px}
        .sec-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:100px;background:var(--ol);border:1px solid var(--om);font-size:.74rem;font-weight:600;letter-spacing:.04em;color:var(--o);margin-bottom:14px}
        .s-title{font-family:var(--serif);font-size:clamp(1.6rem,3.2vw,2.8rem);font-weight:300;letter-spacing:-.03em;line-height:1.1;color:var(--bk);margin-bottom:10px;max-width:none;width:100%}
        .s-title em{font-style:italic;color:var(--o)}
        .s-sub{font-size:.93rem;color:var(--g5);line-height:1.7;max-width:460px;margin:0 auto}

        :focus-visible{outline:2px solid var(--o);outline-offset:2px}
        @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
      `}</style>

      <section className="hero-section">
        <div className="hero-ascii" aria-hidden="true">
          <GradientASCII
            colors={["#f97316", "#fdba74", "#fff7ed", "#faf9f6"]}
            shape="rise"
            lightMode
            cellSize={14}
            density={0.7}
            glyphOpacity={0.7}
            gradientOpacity={0.85}
            glow={0.15}
            grain={0.04}
            speed={0.7}
          />
        </div>
        <div className="hero">
          <div className="intro-copy">
            <span className="h-badge">
              <Sparkles size={13} style={{ color: "var(--o)", flexShrink: 0 }} aria-hidden="true" />
              From summary to publish, in your voice
            </span>
            <h1 className="h-h1">AI-powered content<br /><span className="h-h1-accent">platform for creators.</span></h1>
            <p className="h-sub">Summarize, remix, chat, and publish in your authentic brand voice from one fast, unified workspace every day.</p>
            <div className="h-ctas">
              <button className="btn-p" onClick={() => window.location.href="/sign-up"}>
                Get started
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <Safari url="app.clario.ai" imageSrc="/dashboard-preview.svg" />
          </div>
        </div>
      </section>

      <section className="sec" id="features">
        <div className="sec-w">
          <div className="sec-h">
            <span className="sec-badge"><Layers size={13} aria-hidden="true" /> Core Capabilities</span>
            <h2 className="s-title">Core tools.<br /><span>One workspace.</span></h2>
            <p className="s-sub">Everything you need to turn raw ideas into publish-ready drafts.</p>
          </div>
          <div className="b-grid">
            {/* Summarizer */}
            <div className="b-card" style={{ gridColumn: "span 5" }}>
              <div className="b-in">
                <span className="b-kicker"><FileText size={13} /> Summarizer</span>
                <h3 className="b-title">10 modes, <span>every format.</span></h3>
                <p className="b-desc">Paste text or any URL to extract clear, structured takeaways.</p>
              </div>
              <div className="b-panel">
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
                    <span className="b-mode-n">+ 7 more summary modes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remix */}
            <div className="b-card" style={{ gridColumn: "span 7" }}>
              <div className="b-in">
                <span className="b-kicker"><Sparkles size={13} /> Remix Studio</span>
                <h3 className="b-title">Paste once. Get <span>10 formats.</span></h3>
                <p className="b-desc">Turn a single video, article, or note into native drafts for every channel.</p>
              </div>
              <div className="b-panel">
                <div className="b-formats">
                  {[
                    { l: "Twitter Thread", m: "Thread", icon: "x", c: "#000000" },
                    { l: "LinkedIn Post", m: "Feed post", icon: "linkedin", c: "#0A66C2" },
                    { l: "Email Newsletter", m: "Newsletter", icon: "email", c: "#EA4335" },
                    { l: "YT Description", m: "Chapters", icon: "youtube", c: "#FF0000" },
                    { l: "Podcast Notes", m: "Show notes", icon: "spotify", c: "#1DB954" },
                    { l: "Blog Outline", m: "Article", icon: "medium", c: "#111111" },
                  ].map((f) => (
                    <div key={f.l} className="b-format" style={{ ["--c" as string]: f.c }}>
                      <span className="b-format-ic"><BrandIcon name={f.icon} size={14} /></span>
                      <span className="b-format-tx">
                        <span className="b-format-n">{f.l}</span>
                        <span className="b-format-m">{f.m}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="b-card" style={{ gridColumn: "span 6" }}>
              <div className="b-in">
                <span className="b-kicker"><MessageSquare size={13} /> AI Chat</span>
                <h3 className="b-title"><span>AI</span> that remembers you.</h3>
                <p className="b-desc">Iterate on hooks, angles, and drafts with your saved context.</p>
              </div>
              <div className="b-panel" style={{ gap: 10 }}>
                {[
                  { u: true, m: "Rewrite this intro for a sharper hook." },
                  { u: false, m: "Here is a tighter opener focused on the core outcome." },
                  { u: true, m: "Turn that into a 5-part thread opener." },
                ].map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.u ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "84%",
                        padding: "9px 13px",
                        borderRadius: msg.u ? "13px 13px 3px 13px" : "13px 13px 13px 3px",
                        background: msg.u ? "var(--bk)" : "var(--w)",
                        border: msg.u ? "none" : "1px solid var(--g2)",
                        color: msg.u ? "var(--color-paper)" : "var(--g7)",
                        fontSize: ".81rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.m}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Voice */}
            <div className="b-card" style={{ gridColumn: "span 6" }}>
              <div className="b-in">
                <span className="b-kicker"><Mic size={13} /> Brand Voice</span>
                <h3 className="b-title">Every output <span>sounds like you.</span></h3>
                <p className="b-desc">Learns your tone, pacing, and vocabulary from writing samples.</p>
              </div>
              <div className="b-panel">
                {[
                  ["Tone", "Strong", 87, "var(--brand)"],
                  ["Vocabulary", "Clear", 71, "#0ea5e9"],
                  ["Personality", "Defined", 94, "var(--color-success)"],
                  ["Rhythm", "Steady", 78, "#8b5cf6"],
                ].map(([l, v, p, c], i) => (
                  <div key={String(l)} style={{ marginBottom: i < 3 ? 12 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: ".78rem", color: "var(--bk)", fontWeight: 600 }}>{String(l)}</span>
                      <span style={{ fontSize: ".74rem", color: "var(--g4)" }}>{v} · {p}%</span>
                    </div>
                    <div style={{ height: 5, background: "var(--g2)", borderRadius: 100, overflow: "hidden" }}>
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
            <span className="sec-badge"><Play size={13} aria-hidden="true" /> Interactive Demo</span>
            <h2 className="s-title">One video in.<br /><span>Ten ready drafts</span> out.</h2>
            <p className="s-sub">Pick a format to preview how Clario adapts a single source.</p>
          </div>
          <div className="demo-box">
            <div className="dm-side">
              <p className="dm-cap">Output format</p>
              <div className="dm-list" role="radiogroup" aria-label="Output format">
                {remixFormats.map((f, i) => (
                  <button
                    key={f.label}
                    role="radio"
                    aria-checked={i === remixActive}
                    className={`dm-item${i === remixActive ? " is-active" : ""}`}
                    onClick={() => handleRemix(i)}
                  >
                    <span className="dm-item-ic" style={{ ["--c" as string]: f.color }}>
                      <BrandIcon name={f.icon} size={13} />
                    </span>
                    <span className="dm-item-tx">
                      <span className="dm-item-n">{f.label}</span>
                      <span className="dm-item-m">{f.meta}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="dm-main">
              <div className="dm-bar-top">
                <span className="dm-file">{activeDraft.label}.txt</span>
                <span className="dm-live"><i />Live preview</span>
              </div>
              <div className="dm-src">
                <span className="dm-src-l">Source</span>
                <span className="dm-src-t">YouTube · &ldquo;How to Build a Weekly Content System&rdquo; (14:22)</span>
              </div>
              <div className="dm-body">
                <p className="dm-out" style={{ opacity: remixFading ? 0 : 1 }}>
                  {activeDraft.preview}
                </p>
              </div>
              <div className="dm-actions">
                <button
                  className="dm-btn dm-btn-p"
                  onClick={() => {
                    if (navigator.clipboard) navigator.clipboard.writeText(activeDraft.preview);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1600);
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy draft"}
                </button>
                <button
                  className="dm-btn"
                  onClick={() => handleRemix((remixActive + 1) % remixFormats.length)}
                >
                  Next format
                  <ArrowRight size={14} />
                </button>
                <span className="dm-meta">{wordCount} words · Brand voice applied</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="creator-os">
        <div className="sec-w">
          <div className="sec-h">
            <span className="sec-badge"><LayoutGrid size={13} aria-hidden="true" /> Creator Suite</span>
            <h2 className="s-title">Every tool you need.<br /><span>In one place.</span></h2>
            <p className="s-sub">Create, repurpose, and organize your content without switching apps.</p>
          </div>
          <div className="os-grid">
            {creatorTools.map(({ t, d, Icon, color, bg }) => (
              <div key={t} className="os-card">
                <div className="os-head">
                  <span
                    className="os-ic"
                    style={{ background: bg, color }}
                    aria-hidden="true"
                  >
                    <Icon size={19} strokeWidth={1.9} />
                  </span>
                  <h3 className="os-title">{t}</h3>
                </div>
                <p className="os-desc">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-alt" id="pricing">
        <div className="sec-w">
          <div className="sec-h">
            <span className="sec-badge"><Tag size={13} aria-hidden="true" /> Transparent Pricing</span>
            <h2 className="s-title">Simple, <span>honest</span> pricing.</h2>
            <p className="s-sub">Free and Pro plans are opening soon.</p>
          </div>
          <div className="p-grid">
            <div className="p-card">
              <div className="p-badge">COMING SOON</div>
              <div className="p-plan">Free</div>
              <div className="p-price">$0<sub>/mo</sub></div>
              <p className="p-desc">Everything to get started.</p>
              <ul className="p-list">
                {["100 AI requests/month","Chat + Summarizer","10 summary modes","1 Brand Voice","3 Remix formats","Email support"].map(item => (
                  <li key={item} className="p-item"><span className="p-ck">✓</span>{item}</li>
                ))}
              </ul>
              <button className="btn-pf" disabled>Available soon</button>
            </div>
            <div className="p-card feat">
              <div className="p-badge">COMING SOON</div>
              <div className="p-plan">Pro</div>
              <div className="p-price">$19<sub>/mo</sub></div>
              <p className="p-desc">For daily content work.</p>
              <ul className="p-list">
                {["1,000 AI requests/month","All 10 Remix formats","Export to Notion / Google Docs","AI Image Prompt Generator","3 Brand Voices","Priority support"].map(item => (
                  <li key={item} className="p-item"><span className="p-ck">✓</span>{item}</li>
                ))}
              </ul>
              <button className="btn-pf" disabled>Available soon</button>
            </div>
          </div>
          <p className="p-note">One summary or chat message counts as one request.</p>
        </div>
      </section>

      <section className="finale">
        <div className="fin-card">
          <div className="fin-copy">
            <h2 className="fin-h">Your content, <em>multiplied.</em></h2>
            <p className="fin-sub">Summarize, remix, chat, and write in your brand voice from one workspace.</p>
          </div>
          <div className="fin-actions">
            <div className="fin-cta">
              <button className="fin-btn fin-btn-p" onClick={() => window.location.href="/sign-up"}>
                Start for free
                <ArrowRight size={15} />
              </button>
              <button className="fin-btn" onClick={() => window.location.href="/pricing"}>See pricing</button>
            </div>
            <p className="fin-note">Plans opening soon. Sign up for early access.</p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
