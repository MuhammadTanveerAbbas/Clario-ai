import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("ai_memory").select("*").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ memory: data || null });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const payload = {
    user_id: user.id,
    full_name: body?.full_name || null,
    profession: body?.profession || null,
    industry: body?.industry || null,
    target_audience: body?.target_audience || null,
    use_case: body?.use_case || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("ai_memory").upsert(payload, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
