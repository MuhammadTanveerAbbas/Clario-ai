from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)
from groq import Groq
import re, os, json
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ── Helpers ────────────────────────────────────────────────────────────────────

def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|/)([0-9A-Za-z_-]{11})",
        r"youtu\.be/([0-9A-Za-z_-]{11})",
        r"embed/([0-9A-Za-z_-]{11})",
        r"shorts/([0-9A-Za-z_-]{11})",
        r"live/([0-9A-Za-z_-]{11})",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    raise ValueError("Invalid YouTube URL")


def get_transcript(video_id: str) -> tuple[str, str]:
    """Returns (transcript_text, method). Raises HTTPException on total failure."""

    # ── Layer 1: Official captions via youtube-transcript-api ─────────────────
    try:
        ytt = YouTubeTranscriptApi()
        # Try default (English) first
        try:
            t = ytt.fetch(video_id)
            text = " ".join(s.text for s in t.snippets)
            return text, "captions"
        except NoTranscriptFound:
            pass

        # English failed → try any available transcript
        try:
            transcript_list = ytt.list(video_id)
            transcripts = list(transcript_list)
            if transcripts:
                t = transcripts[0].fetch()
                text = " ".join(s.text for s in t.snippets)
                return text, "captions"
        except Exception:
            pass

    except TranscriptsDisabled:
        pass  # fall through to layer 2
    except VideoUnavailable:
        raise HTTPException(
            status_code=422,
            detail={
                "reason": "private_video",
                "message": "This video is private or unavailable.",
            },
        )
    except Exception as e:
        print(f"[Layer 1 fail] {e}")

    # ── Layer 2: yt-dlp audio URL → AssemblyAI ────────────────────────────────
    try:
        import yt_dlp
        import assemblyai as aai

        aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY", "")

        audio_url = None
        ydl_opts = {"format": "m4a/bestaudio/best", "quiet": True, "noplaylist": True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}", download=False
            )
            audio_url = info.get("url")

        if audio_url:
            transcriber = aai.Transcriber()
            result = transcriber.transcribe(audio_url)
            if result.text:
                return result.text, "audio_transcription"

    except Exception as e:
        print(f"[Layer 2 fail] {e}")

    # ── Layer 3: Total failure  explain why ──────────────────────────────────
    raise HTTPException(
        status_code=422,
        detail={
            "reason": "no_transcript",
            "message": (
                "No transcript could be extracted. The video may have captions disabled, "
                "be region-blocked, or have no usable audio track."
            ),
        },
    )


SUMMARIZE_SYSTEM = """You are an expert content analyst for Clario, a platform for YouTubers and content creators.

Analyze the transcript and return ONLY a valid JSON object  no markdown, no backticks, no preamble.

Required schema:
{
  "tldr": "2-3 sentence plain English summary",
  "key_points": ["string"],
  "topics": [{ "name": "string", "percentage": number, "description": "string" }],
  "timeline": [{ "time_range": "string", "topic": "string", "summary": "string" }],
  "insights": ["string"],
  "action_items": ["string"],
  "key_quotes": ["string"],
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "content_type": "tutorial" | "lecture" | "podcast" | "review" | "news" | "entertainment" | "other",
  "word_count": number
}

Rules:
- key_points: 5-8 items, each 1-2 sentences
- topics: 3-5 items, percentages sum to 100
- timeline: 4-6 segments with realistic time ranges
- insights: 3-5 unique or non-obvious observations
- action_items: practical takeaways, empty array if not applicable
- key_quotes: 2-3 exact short quotes from the transcript"""


def summarize(transcript: str, title: str) -> dict:
    max_chars = 24000
    if len(transcript) > max_chars:
        transcript = transcript[:max_chars] + "\n[Truncated for length]"

    resp = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=3000,
        temperature=0.3,
        messages=[
            {"role": "system", "content": SUMMARIZE_SYSTEM},
            {
                "role": "user",
                "content": f"Video title: {title}\n\nTranscript:\n{transcript}",
            },
        ],
    )
    raw = resp.choices[0].message.content.strip()
    # Strip markdown fences if model adds them
    raw = re.sub(r"^```json\s*|^```\s*|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)


# ── Routes ─────────────────────────────────────────────────────────────────────


class TranscriptRequest(BaseModel):
    url: str


class AnalyzeRequest(BaseModel):
    url: str
    title: str = "Unknown"


@app.post("/api/transcript")
async def get_transcript_only(req: TranscriptRequest):
    """Simple endpoint that just returns the transcript text"""
    try:
        video_id = extract_video_id(req.url)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={"reason": "invalid_url", "message": "Not a valid YouTube URL."},
        )

    transcript, method = get_transcript(video_id)

    return {
        "video_id": video_id,
        "transcript": transcript,
        "method": method,
        "char_count": len(transcript),
    }


@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    try:
        video_id = extract_video_id(req.url)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={"reason": "invalid_url", "message": "Not a valid YouTube URL."},
        )

    transcript, method = get_transcript(video_id)
    summary = summarize(transcript, req.title)

    return {
        "video_id": video_id,
        "transcript_method": method,
        "transcript_preview": (
            transcript[:400] + "..." if len(transcript) > 400 else transcript
        ),
        **summary,
    }


@app.get("/health")
def health():
    return {"status": "ok"}
