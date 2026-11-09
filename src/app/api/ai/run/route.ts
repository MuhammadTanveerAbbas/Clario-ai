import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCompletion } from "@/lib/ai-fallback";

const PROMPTS: Record<string, (input: string) => { prompt: string; system: string }> = {
  "angle-finder": (input) => ({ prompt: `Find 5 unique angles for: ${input}`, system: "You are a content strategist. Return a numbered list." }),
  "bio-builder": (input) => ({ prompt: `Write a compelling profile bio based on: ${input}`, system: "You write concise bios." }),
  "hook-generator": (input) => ({ prompt: `Generate 8 scroll-stopping hooks for: ${input}`, system: "You write hooks. Return a numbered list." }),
  "repurposer": (input) => ({ prompt: `Repurpose into 5 formats (tweet, linkedin, instagram, email, blog): ${input}`, system: "Return labeled sections." }),
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const task = String(body?.task || "");
  const input = String(body?.input || "").trim();
  if (!PROMPTS[task]) return NextResponse.json({ error: "Unknown task" }, { status: 400 });
  if (!input) return NextResponse.json({ error: "Input required" }, { status: 400 });
  const { prompt, system } = PROMPTS[task](input);
  try {
    const result = await generateCompletion(prompt, system, { temperature: 0.7, maxTokens: 1200 });
    await supabase.from("toolkit_results").insert({
      user_id: user.id,
      tool: task,
      input,
      output: { result },
    });
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
