import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get last 30 days of usage data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usageData, error: usageError } = await supabase
      .from("usage_tracking")
      .select("type, created_at")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (usageError) {
      return NextResponse.json(
        { error: "Failed to fetch usage data" },
        { status: 500 },
      );
    }

    // Aggregate data by date
    const dailyUsage: Record<string, number> = {};
    const featureUsage: Record<string, number> = {
      summarize: 0,
      chat: 0,
      remix: 0,
      brand_voice: 0,
    };

    usageData?.forEach((record) => {
      const date = new Date(record.created_at);
      const dateKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dailyUsage[dateKey] = (dailyUsage[dateKey] || 0) + 1;

      const type = record.type as keyof typeof featureUsage;
      if (type in featureUsage) {
        featureUsage[type]++;
      }
    });

    // Format daily usage for chart - ensure we have all 30 days
    const trendData: Array<{ date: string; usage: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      trendData.push({
        date: dateKey,
        usage: dailyUsage[dateKey] || 0,
      });
    }

    // Format feature usage for chart
    const featureData = Object.entries(featureUsage)
      .map(([name, value]) => ({
        name:
          name === "brand_voice"
            ? "Brand Voice"
            : name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json({
      trendData,
      featureData,
      totalUsage: usageData?.length || 0,
    });
  } catch (error: any) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
