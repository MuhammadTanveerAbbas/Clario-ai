import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/ai-fallback";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const content = String(body?.content || "").trim();
  if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const prompt = `Repurpose the following content into: Twitter thread, LinkedIn post, Instagram caption, and Email newsletter. Return JSON object with keys twitter, linkedin, instagram, email.\n\n${content}`;
  try {
    const raw = await generateCompletion(prompt, "You are a content repurposing assistant. Output valid JSON only.", { temperature: 0.7, maxTokens: 1500 });
    let outputs: Record<string, string> = {};
    try { outputs = JSON.parse(raw); } catch { outputs = { raw }; }

    await supabase.from("repurpose_history").insert({
      user_id: user.id,
      source_text: content,
      source_type: "text",
      outputs,
    });

    return NextResponse.json({ outputs });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
