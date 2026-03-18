import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { game_id, name } = await request.json();

  if (!game_id || !name?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const cleanName = name.trim();
  const supabase = createServerClient();

  // Check for duplicate name in this game (case-insensitive)
  const { data: existing } = await supabase
    .from("attendees")
    .select("id")
    .eq("game_id", game_id)
    .ilike("name", cleanName)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: `${cleanName} is already in! 🥒` },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("attendees")
    .insert({ game_id, name: cleanName })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
