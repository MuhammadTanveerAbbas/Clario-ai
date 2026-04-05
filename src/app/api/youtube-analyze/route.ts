import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/middleware/rate-limit";

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]{11}/;

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(req as any, "api");
    if (!rateLimitCheck.allowed) return rateLimitCheck.response!;

    const { url } = await req.json();

    if (!url || !YT_REGEX.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check usage limits using existing pattern
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, requests_used_this_month, email")
      .eq("id", user.id)
      .single();

    const tier = (profile?.subscription_tier || "free") as "free" | "pro";
    const currentUsage = profile?.requests_used_this_month || 0;

    if (profile?.email !== process.env.ADMIN_EMAIL) {
      const { checkUsageLimit } = await import("@/lib/usage-limits");
      const usageCheck = checkUsageLimit(tier, currentUsage);
      if (!usageCheck.allowed) {
        return NextResponse.json(
          { error: `Monthly limit reached. Upgrade to Pro for more.` },
          { status: 429 }
        );
      }
    }

    const serviceUrl = process.env.TRANSCRIPT_SERVICE_URL;
    if (!serviceUrl) {
      return NextResponse.json(
        { error: "YouTube analysis service not configured." },
        { status: 503 }
      );
    }

    const serviceResp = await fetch(`${serviceUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!serviceResp.ok) {
      const err = await serviceResp.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.detail?.message || "Could not extract transcript" },
        { status: serviceResp.status }
      );
    }

    const result = await serviceResp.json();

    // Save to ai_summaries (non-blocking)
    supabase
      .from("ai_summaries")
      .insert({
        user_id: user.id,
        summary_text: result.tldr,
        original_text: result.transcript_preview,
        mode: "youtube_analysis",
      })
      .then(({ error }) => {
        if (error) console.error("[youtube-analyze] DB insert error:", error.message);
      });

    // Track usage (non-blocking)
    supabase
      .rpc("track_usage", { p_user_id: user.id, p_type: "summary", p_count: 1 })
      .then(({ error }) => {
        if (error) console.error("[youtube-analyze] Track usage error:", error.message);
      });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[youtube-analyze]", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
