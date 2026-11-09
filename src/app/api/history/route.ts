import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [{ data: comments }, { data: repurpose }] = await Promise.all([
    supabase.from("comment_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("repurpose_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);
  return NextResponse.json({ comments: comments || [], repurpose: repurpose || [] });
}
