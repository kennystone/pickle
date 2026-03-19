import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateSlug } from "@/lib/slug-generator";
import { isAdmin } from "@/lib/auth";
import { log } from "@/lib/logger";
import type { Game, Attendee } from "@/lib/database.types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .maybeSingle() as { data: Game | null };

  if (!game) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: attendees } = await supabase
    .from("attendees")
    .select("*")
    .eq("game_id", game.id)
    .order("created_at", { ascending: true }) as { data: Attendee[] | null };

  return NextResponse.json({ game, attendees: attendees ?? [] });
}

export async function POST(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    log.warn("games create unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, time, place, people_needed } = await request.json();

  if (!date || !time || !place || !people_needed) {
    log.warn("games create missing fields", { date, time, place, people_needed });
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  let slug = "";
  for (let i = 0; i < 10; i++) {
    const candidate = generateSlug();
    const { data } = await supabase
      .from("games")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) {
      slug = candidate;
      break;
    }
    log.info("slug collision, retrying", { candidate, attempt: i + 1 });
  }

  if (!slug) {
    log.error("failed to generate unique slug");
    return NextResponse.json({ error: "Could not generate unique slug" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("games")
    .insert({ slug, date, time, place, people_needed } as never)
    .select()
    .single() as { data: Game | null; error: { message: string } | null };

  if (error || !data) {
    log.error("game insert failed", { error: error?.message, slug });
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  }

  // Auto-add Kenny Stone to every new game
  await supabase
    .from("attendees")
    .insert({ game_id: data.id, name: "Kenny Stone" } as never);

  log.info("game created", { slug, date, time, place, people_needed });
  return NextResponse.json({ id: data.id });
}
