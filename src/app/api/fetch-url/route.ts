import { NextRequest, NextResponse } from "next/server";
import { Agent } from "undici";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/middleware/rate-limit";
import {
  PUBLIC_URL_ERROR,
  isBlockedAddress,
  parsePublicHttpUrl,
  resolvePublicAddresses,
  type PublicAddress,
} from "@/lib/public-url";
import { extractReadableArticle } from "@/lib/article-extractor";
import { BodyTooLargeError, readTextWithLimit } from "@/lib/http-text";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

type LookupOptions = { all?: boolean; family?: number; hints?: number };
type LookupRecord = { address: string; family: number };
type LookupCallback = (
  error: Error | null,
  addressOrRecords: string | LookupRecord[],
  family?: number
) => void;

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function createPinnedDispatcher(url: URL, addresses: PublicAddress[]): Agent {
  const chosen = addresses.find((address) => !isBlockedAddress(address.address));
  if (!chosen) throw new Error(PUBLIC_URL_ERROR);

  return new Agent({
    connect: {
      servername: url.hostname,
      lookup: (_hostname: string, options: LookupOptions, callback: LookupCallback) => {
        const record = { address: chosen.address, family: chosen.family };
        if (options?.all) callback(null, [record]);
        else callback(null, record.address, record.family);
      },
    },
  } as unknown as ConstructorParameters<typeof Agent>[0]);
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(req, "api");
    if (!rateLimitCheck.allowed) return rateLimitCheck.response!;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody: unknown = await req.json().catch(() => null);
    if (
      !rawBody ||
      typeof rawBody !== "object" ||
      !("url" in rawBody) ||
      typeof rawBody.url !== "string"
    ) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const url = rawBody.url.trim();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    if (isYouTubeUrl(url)) {
      return NextResponse.json({ error: "Use the YouTube tab for YouTube URLs" }, { status: 400 });
    }

    const parsed = parsePublicHttpUrl(url);
    if (!parsed) {
      return NextResponse.json({ error: PUBLIC_URL_ERROR }, { status: 422 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let currentUrl = parsed.toString();
    let html = "";
    let finalUrl = currentUrl;
    let reachedPage = false;

    try {
      for (let hop = 0; hop <= 5; hop++) {
        const nextUrl = parsePublicHttpUrl(currentUrl);
        if (!nextUrl) {
          return NextResponse.json({ error: PUBLIC_URL_ERROR }, { status: 422 });
        }
        currentUrl = nextUrl.toString();

        let dispatcher: Agent | null = null;
        try {
          const addresses = await resolvePublicAddresses(nextUrl);
          dispatcher = createPinnedDispatcher(nextUrl, addresses);

          const res = await fetch(currentUrl, {
            signal: controller.signal,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
              "Cache-Control": "no-cache",
            },
            redirect: "manual",
            dispatcher,
          } as RequestInit & { dispatcher: Agent });

          if (res.status >= 300 && res.status < 400) {
            const location = res.headers.get("location");
            if (!location) {
              return NextResponse.json(
                { error: "The page redirected without a destination." },
                { status: 422 }
              );
            }
            currentUrl = new URL(location, currentUrl).toString();
            continue;
          }

          if (!res.ok) {
            if (res.status === 403 || res.status === 401) {
              return NextResponse.json(
                { error: `This page requires authentication or blocks scrapers (${res.status})` },
                { status: 422 }
              );
            }
            return NextResponse.json(
              { error: `Failed to fetch URL (HTTP ${res.status})` },
              { status: 422 }
            );
          }

          const contentType = res.headers.get("content-type") || "";
          if (
            !contentType.includes("text/html") &&
            !contentType.includes("text/plain") &&
            !contentType.includes("application/xhtml")
          ) {
            return NextResponse.json(
              { error: "URL must point to a web page with readable text" },
              { status: 422 }
            );
          }

          const raw = await readTextWithLimit(res);
          html =
            contentType.includes("text/plain") && !contentType.includes("html")
              ? `<html><body><pre>${escapeHtml(raw)}</pre></body></html>`
              : raw;
          finalUrl = currentUrl;
          reachedPage = true;
          break;
        } catch (err: unknown) {
          if (err instanceof BodyTooLargeError) {
            return NextResponse.json({ error: "The page response is too large." }, { status: 422 });
          }
          if (err instanceof Error && err.message === PUBLIC_URL_ERROR) {
            return NextResponse.json({ error: PUBLIC_URL_ERROR }, { status: 422 });
          }
          throw err;
        } finally {
          dispatcher?.close();
        }
      }
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      const msg = err instanceof Error ? err.message : "";
      if (name === "AbortError" || msg.includes("abort")) {
        return NextResponse.json(
          { error: "Request timed out (20s). The server may be slow or blocking bots." },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: "Could not reach the URL. Check that it is publicly accessible." },
        { status: 422 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!reachedPage) {
      return NextResponse.json({ error: "The page redirected too many times." }, { status: 422 });
    }

    const article = extractReadableArticle(html);
    if (!article) {
      return NextResponse.json(
        {
          error: "Could not extract enough text from this page. Try pasting the content directly.",
        },
        { status: 422 }
      );
    }

    const truncated = article.text.slice(0, 60000);

    return NextResponse.json({
      title: article.title || parsed.hostname,
      text: truncated,
      url: finalUrl,
      charCount: truncated.length,
      source: "web",
    });
  } catch (error) {
    console.error("[fetch-url] Error:", error);
    return NextResponse.json({ error: "Failed to fetch URL content" }, { status: 500 });
  }
}
