import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { log } from "@/lib/logger";

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error } = await supabase.from("attendees").delete().eq("id", id);

  if (error) {
    log.error("attendee delete failed", { id, error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  log.info("attendee removed", { id });
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const { game_id, name } = await request.json();

  if (!game_id || !name?.trim()) {
    log.warn("attendee missing fields", { game_id, name });
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const cleanName = name.trim();
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("attendees")
    .select("id")
    .eq("game_id", game_id)
    .ilike("name", cleanName)
    .maybeSingle();

  if (existing) {
    log.info("attendee duplicate", { game_id, name: cleanName });
    return NextResponse.json(
      { error: `${cleanName} is already in! 🥒` },
      { status: 409 }
    );
  }

  const { data, error } = (await supabase
    .from("attendees")
    .insert({ game_id, name: cleanName } as never)
    .select()
    .single()) as { data: { id: string } | null; error: { message: string } | null };

  if (error) {
    log.error("attendee insert failed", { game_id, name: cleanName, error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  log.info("attendee confirmed", { game_id, name: cleanName });
  return NextResponse.json(data);
}
