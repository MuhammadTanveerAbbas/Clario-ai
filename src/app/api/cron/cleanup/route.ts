import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Reset monthly usage for users whose reset window has passed
    const { error: resetError } = await supabase.rpc("reset_monthly_usage");
    if (resetError) {
      console.error("[cron/cleanup] reset_monthly_usage error:", resetError.message);
      return NextResponse.json({ error: "Reset failed", detail: resetError.message }, { status: 500 });
    }

    // Prune old rate-limit rows (older than 2 hours) to keep the table lean
    const { error: pruneError } = await supabase
      .from("api_rate_limits")
      .delete()
      .lt("window_start", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    if (pruneError) {
      // Non-fatal — log and continue
      console.warn("[cron/cleanup] rate-limit prune error:", pruneError.message);
    }

    return NextResponse.json({ success: true, ran_at: new Date().toISOString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cron/cleanup] unexpected error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
