import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/ai-fallback";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const content = String(body?.content || "").trim();
  const platform = String(body?.platform || "general");
  const tone = String(body?.tone || "friendly");
  const count = Math.min(Math.max(Number(body?.count) || 3, 1), 10);

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const prompt = `Generate ${count} short ${tone} comments for ${platform} based on:\n\n${content}\n\nReturn only a JSON array of strings.`;
  try {
    const raw = await generateCompletion(prompt, "You are a helpful social media assistant. Output valid JSON only.", { temperature: 0.7, maxTokens: 800 });
    let comments: string[] = [];
    try {
      comments = JSON.parse(raw);
    } catch {
      comments = raw.split("\n").filter(Boolean).slice(0, count);
    }

    await supabase.from("comment_history").insert({
      user_id: user.id,
      input_type: "text",
      input_content: content,
      platform,
      tone,
      length: "short",
      generated_comments: comments,
    });

    return NextResponse.json({ comments });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Generation failed" }, { status: 500 });
  }
}
