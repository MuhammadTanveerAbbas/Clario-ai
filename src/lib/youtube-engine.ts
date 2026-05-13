/**
 * YouTube transcript engine — always returns something.
 * Strategy (in order):
 *  1. Timedtext JSON via caption tracks (fastest, most reliable)
 *  2. Innertube engagement panel transcript
 *  3. YouTube page scrape — description + chapters from ytInitialData
 *  4. Minimal stub from oEmbed metadata (last resort, never throws)
 */

import { Innertube } from 'youtubei.js';

export interface VideoMetadata {
  title: string;
  author: string;
  thumbnail: string;
  duration: number | null;
  viewCount: string | null;
}

export interface TranscriptResult {
  text: string;
  method: 'captions' | 'auto_captions' | 'description' | 'stub';
  language: string;
  segmentCount: number;
}

export interface YouTubeEngineResult {
  videoId: string;
  transcript: TranscriptResult;
  metadata: VideoMetadata;
}

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:m\.youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

function clean(text: string): string {
  return text
    .replace(/\[.*?\]/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Method 1: Timedtext JSON ────────────────────────────────────────────────

interface CaptionTrack {
  base_url?: string;
  language_code?: string;
  kind?: string;
  name?: { text?: string };
}

function isAuto(t: CaptionTrack): boolean {
  if (t.kind === 'asr') return true;
  const l = t.name?.text?.toLowerCase() ?? '';
  return l.includes('auto-generated') || l.includes('automatic');
}

function pickTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (!tracks?.length) return null;
  const en = tracks.filter((t) => (t.language_code ?? '').toLowerCase().startsWith('en'));
  const pool = en.length ? en : tracks;
  return pool.find((t) => !isAuto(t)) ?? pool[0] ?? tracks[0];
}

async function viaTimedText(yt: Innertube, videoId: string): Promise<TranscriptResult | null> {
  let info;
  try { info = await yt.getBasicInfo(videoId); } catch { return null; }

  const tracks = info.captions?.caption_tracks as CaptionTrack[] | undefined;
  if (!tracks?.length) return null;

  const track = pickTrack(tracks);
  if (!track?.base_url) return null;

  const url = track.base_url.includes('fmt=')
    ? track.base_url.replace(/fmt=[^&]+/i, 'fmt=json3')
    : `${track.base_url}&fmt=json3`;

  for (let i = 0; i < 3; i++) {
    if (i > 0) await sleep(600 * i);
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Clario/1.0)' },
      });
      if (!res.ok) { if (res.status >= 500) continue; return null; }
      const data = await res.json() as { events?: Array<{ segs?: Array<{ utf8?: string }> }> };
      const parts: string[] = [];
      let segs = 0;
      for (const ev of data.events ?? []) {
        if (!ev.segs?.length) continue;
        segs++;
        for (const s of ev.segs) { if (s.utf8) parts.push(s.utf8); }
      }
      const text = clean(parts.join(' '));
      if (text.length < 30) return null;
      return { text, method: isAuto(track) ? 'auto_captions' : 'captions', language: track.language_code ?? 'en', segmentCount: segs || parts.length };
    } catch { continue; }
  }
  return null;
}

// ─── Method 2: Engagement panel ─────────────────────────────────────────────

async function viaEngagementPanel(yt: Innertube, videoId: string): Promise<TranscriptResult | null> {
  try {
    const info = await yt.getInfo(videoId);
    let td = await info.getTranscript();

    // Try to select English
    const langs = td.languages ?? [];
    const enPref = ['English', 'English (United States)', 'English (auto-generated)'];
    for (const p of enPref) {
      if (langs.includes(p) && td.selectedLanguage !== p) {
        td = await td.selectLanguage(p);
        break;
      }
    }

    const segs = td.transcript?.content?.body?.initial_segments ?? [];
    const parts = segs
      .map((s: { snippet?: { text?: string } }) => s.snippet?.text ?? '')
      .filter(Boolean);
    if (!parts.length) return null;

    const text = clean(parts.join(' '));
    if (text.length < 30) return null;

    const lang = String(td.selectedLanguage ?? 'en');
    const auto = lang.toLowerCase().includes('auto') || lang.toLowerCase().includes('asr');
    return { text, method: auto ? 'auto_captions' : 'captions', language: lang, segmentCount: parts.length };
  } catch { return null; }
}

// ─── Method 3: Page scrape (description + chapters) ─────────────────────────

function extractJsonFromHtml(html: string, varName: string): unknown {
  const idx = html.indexOf(`var ${varName} =`);
  if (idx === -1) return null;
  const start = html.indexOf('{', idx);
  if (start === -1) return null;
  let depth = 0, i = start;
  for (; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') { depth--; if (depth === 0) break; }
  }
  try { return JSON.parse(html.slice(start, i + 1)); } catch { return null; }
}

function extractText(obj: unknown, keys: string[], maxDepth = 8): string[] {
  if (maxDepth <= 0 || !obj || typeof obj !== 'object') return [];
  const results: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (keys.includes(k) && typeof v === 'string' && v.trim()) {
      results.push(v.trim());
    } else if (typeof v === 'object') {
      results.push(...extractText(v, keys, maxDepth - 1));
    }
  }
  return results;
}

async function viaPageScrape(videoId: string): Promise<TranscriptResult | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      signal: AbortSignal.timeout(20_000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const data = extractJsonFromHtml(html, 'ytInitialData') as Record<string, unknown> | null;
    if (!data) return null;

    // Extract description runs
    const descTexts = extractText(data, ['text'], 6);

    // Extract chapter titles
    const chapterTitles = extractText(data, ['title'], 5);

    // Also grab short description from meta tag
    const metaMatch = html.match(/<meta name="description" content="([^"]{20,}?)"/);
    const metaDesc = metaMatch?.[1] ? decodeURIComponent(metaMatch[1].replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))) : '';

    // Combine: prefer longer description texts
    const allText = [...new Set([metaDesc, ...descTexts, ...chapterTitles])]
      .filter((t) => t.length > 10)
      .slice(0, 60)
      .join(' ');

    const text = clean(allText);
    if (text.length < 40) return null;

    return { text, method: 'description', language: 'en', segmentCount: 1 };
  } catch { return null; }
}

// ─── Method 4: Stub from metadata (never fails) ──────────────────────────────

async function viaStub(videoId: string): Promise<TranscriptResult> {
  const meta = await fetchVideoMetadata(videoId);
  const parts = [`Video: ${meta.title || videoId}`];
  if (meta.author) parts.push(`Channel: ${meta.author}`);
  parts.push(`URL: https://www.youtube.com/watch?v=${videoId}`);
  parts.push('Note: No transcript or captions were available for this video. The summary is based on the video title and channel information only.');
  return {
    text: parts.join('\n'),
    method: 'stub',
    language: 'en',
    segmentCount: 0,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  // Init Innertube (retry once)
  let yt: Innertube | null = null;
  for (let i = 0; i < 2; i++) {
    try {
      yt = await Innertube.create({ retrieve_player: true, generate_session_locally: true });
      break;
    } catch { if (i === 0) await sleep(1000); }
  }

  if (yt) {
    const t1 = await viaTimedText(yt, videoId);
    if (t1) return t1;

    const t2 = await viaEngagementPanel(yt, videoId);
    if (t2) return t2;
  }

  // Innertube failed or no captions — try page scrape
  const t3 = await viaPageScrape(videoId);
  if (t3) return t3;

  // Absolute last resort — always succeeds
  return viaStub(videoId);
}

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const endpoints = [
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { signal: AbortSignal.timeout(8_000) });
      if (!res.ok) continue;
      const d = await res.json() as { title?: string; author_name?: string; thumbnail_url?: string };
      if (d.title) return {
        title: d.title,
        author: d.author_name ?? '',
        thumbnail: d.thumbnail_url ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        duration: null,
        viewCount: null,
      };
    } catch { continue; }
  }
  return { title: '', author: '', thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, duration: null, viewCount: null };
}

export async function analyzeVideo(videoId: string): Promise<YouTubeEngineResult> {
  const [tr, mr] = await Promise.allSettled([fetchTranscript(videoId), fetchVideoMetadata(videoId)]);
  return {
    videoId,
    transcript: tr.status === 'fulfilled' ? tr.value : await viaStub(videoId),
    metadata: mr.status === 'fulfilled' ? mr.value : { title: '', author: '', thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, duration: null, viewCount: null },
  };
}
