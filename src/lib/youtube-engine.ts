/**
 * Native YouTube transcript + metadata engine using youtubei.js.
 * Replaces the Railway transcript-service. Runs on Vercel serverless.
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
  method: 'captions' | 'auto_captions';
  language: string;
  segmentCount: number;
}

export interface YouTubeEngineResult {
  videoId: string;
  transcript: TranscriptResult;
  metadata: VideoMetadata;
}

/** Extracts an 11-character video ID from any YouTube URL format or bare ID. */
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
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function cleanTranscriptText(text: string): string {
  return text
    .replace(/\[.*?\]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function segmentPlainText(seg: { snippet?: { text?: string } }): string {
  return seg.snippet?.text ?? '';
}

const LANGUAGE_PREFERENCE = [
  'English',
  'English (United States)',
  'English (United Kingdom)',
  'English (auto-generated)',
  'English (United Kingdom) (auto-generated)',
];

type TranscriptPanel = Awaited<
  ReturnType<Awaited<ReturnType<Innertube['getInfo']>>['getTranscript']>
>;

async function selectPreferredCaptionTrack(transcriptData: TranscriptPanel) {
  const langs = transcriptData.languages;
  for (const pref of LANGUAGE_PREFERENCE) {
    if (langs.includes(pref)) {
      if (transcriptData.selectedLanguage !== pref) {
        return transcriptData.selectLanguage(pref);
      }
      return transcriptData;
    }
  }
  return transcriptData;
}

interface CaptionTrackRow {
  base_url?: string;
  language_code?: string;
  kind?: string;
  name?: { text?: string };
}

function captionTrackIsAuto(t: CaptionTrackRow): boolean {
  if (t.kind === 'asr') return true;
  const label = t.name?.text?.toLowerCase() ?? '';
  return label.includes('auto-generated') || label.includes('automatic');
}

function pickTimedTextCaptionTrack(tracks: CaptionTrackRow[]): CaptionTrackRow | null {
  if (!tracks?.length) return null;
  const en = tracks.filter((t) => (t.language_code ?? '').toLowerCase().startsWith('en'));
  const pool = en.length ? en : tracks;
  const manual = pool.find((t) => !captionTrackIsAuto(t));
  if (manual) return manual;
  return pool[0] ?? tracks[0] ?? null;
}

/**
 * Primary path: timedtext JSON from player caption tracks (reliable on serverless).
 * Requires retrieve_player so the player response includes caption_tracks.
 */
async function fetchTranscriptViaTimedText(
  yt: Innertube,
  videoId: string
): Promise<TranscriptResult | null> {
  let info;
  try {
    info = await yt.getBasicInfo(videoId);
  } catch {
    return null;
  }

  const tracks = info.captions?.caption_tracks as CaptionTrackRow[] | undefined;
  if (!tracks?.length) return null;

  const track = pickTimedTextCaptionTrack(tracks);
  if (!track) return null;
  const base = track.base_url;
  if (!base) return null;

  const url = base.includes('fmt=')
    ? base.replace(/fmt=[^&]+/i, 'fmt=json3')
    : `${base}&fmt=json3`;

  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(25_000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Clario/1.0)' },
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let data: { events?: Array<{ segs?: Array<{ utf8?: string }> }> };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return null;
  }

  const parts: string[] = [];
  let segmentCount = 0;
  for (const ev of data.events ?? []) {
    if (!ev.segs?.length) continue;
    segmentCount++;
    for (const s of ev.segs) {
      if (s.utf8) parts.push(s.utf8);
    }
  }

  const cleaned = cleanTranscriptText(parts.join(' '));
  if (!cleaned || cleaned.length < 30) return null;

  return {
    text: cleaned,
    method: captionTrackIsAuto(track) ? 'auto_captions' : 'captions',
    language: track.language_code ?? 'en',
    segmentCount: segmentCount || Math.max(1, parts.length),
  };
}

/** Fallback: Innertube searchable transcript panel (may fail when YouTube requires extra tokens). */
async function fetchTranscriptViaEngagementPanel(
  yt: Innertube,
  videoId: string
): Promise<TranscriptResult | null> {
  try {
    const info = await yt.getInfo(videoId);
    let transcriptData = await info.getTranscript();
    transcriptData = await selectPreferredCaptionTrack(transcriptData);

    const body = transcriptData.transcript?.content?.body;
    const rawSegments = body?.initial_segments;
    if (!rawSegments?.length) return null;

    const segments = rawSegments.filter(
      (seg) => segmentPlainText(seg as { snippet?: { text?: string } }).length > 0
    );

    const selectedLang = transcriptData.selectedLanguage || 'en';
    const isAuto =
      selectedLang.toLowerCase().includes('auto') ||
      selectedLang.toLowerCase().includes('asr') ||
      /\ba\.en\b/i.test(selectedLang);

    const rawText = segments
      .map((seg) => segmentPlainText(seg as { snippet?: { text?: string } }))
      .join(' ');
    const cleanedText = cleanTranscriptText(rawText);
    if (!cleanedText || cleanedText.length < 30) return null;

    return {
      text: cleanedText,
      method: isAuto ? 'auto_captions' : 'captions',
      language: String(selectedLang),
      segmentCount: segments.length,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches transcript for a given video ID via youtubei.js (timedtext + engagement fallback).
 * Throws errors with `.code` NO_TRANSCRIPT or TRANSCRIPT_EMPTY when applicable.
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  const yt = await Innertube.create({
    retrieve_player: true,
    generate_session_locally: true,
  });

  const timed = await fetchTranscriptViaTimedText(yt, videoId);
  if (timed) return timed;

  const panel = await fetchTranscriptViaEngagementPanel(yt, videoId);
  if (panel) return panel;

  throw Object.assign(new Error('NO_TRANSCRIPT'), {
    code: 'NO_TRANSCRIPT',
    message: 'No transcript available for this video. Captions may be disabled.',
  });
}

export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (!res.ok) throw new Error('oEmbed failed');
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      title: data.title ?? '',
      author: data.author_name ?? '',
      thumbnail: data.thumbnail_url ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: null,
      viewCount: null,
    };
  } catch {
    return {
      title: '',
      author: '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: null,
      viewCount: null,
    };
  }
}

export async function analyzeVideo(videoId: string): Promise<YouTubeEngineResult> {
  const [transcriptResult, metadata] = await Promise.allSettled([
    fetchTranscript(videoId),
    fetchVideoMetadata(videoId),
  ]);

  if (transcriptResult.status === 'rejected') {
    throw transcriptResult.reason;
  }

  return {
    videoId,
    transcript: transcriptResult.value,
    metadata:
      metadata.status === 'fulfilled'
        ? metadata.value
        : {
            title: '',
            author: '',
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            duration: null,
            viewCount: null,
          },
  };
}
