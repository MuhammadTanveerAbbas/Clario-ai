import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("comment_queue").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return NextResponse.json({ items: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { error } = await supabase.from("comment_queue").insert({
    user_id: user.id,
    comment_text: String(body?.comment_text || ""),
    platform: String(body?.platform || "general"),
    notes: body?.notes || null,
    scheduled_date: body?.scheduled_date || null,
    scheduled_time: body?.scheduled_time || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
