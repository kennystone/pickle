import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateSlug } from "@/lib/slug-generator";
import { isAdmin } from "@/lib/auth";
import { log } from "@/lib/logger";
import type { Invite } from "@/lib/database.types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("game_id");

  if (!gameId) {
    return NextResponse.json({ error: "Missing game_id" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: invites } = await supabase
    .from("invites")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true }) as { data: Invite[] | null };

  return NextResponse.json(invites ?? []);
}

export async function POST(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    log.warn("invite create unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { game_id, player_name } = await request.json();

  if (!game_id || !player_name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Check for existing invite (idempotent)
  const { data: existing } = await supabase
    .from("invites")
    .select("*")
    .eq("game_id", game_id)
    .ilike("player_name", player_name)
    .maybeSingle() as { data: Invite | null };

  if (existing) {
    return NextResponse.json(existing);
  }

  // Generate unique slug
  let slug = "";
  for (let i = 0; i < 10; i++) {
    const candidate = generateSlug();
    const { data } = await supabase
      .from("invites")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) {
      slug = candidate;
      break;
    }
    log.info("invite slug collision, retrying", { candidate, attempt: i + 1 });
  }

  if (!slug) {
    log.error("failed to generate unique invite slug");
    return NextResponse.json({ error: "Could not generate unique slug" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("invites")
    .insert({ slug, game_id, player_name } as never)
    .select()
    .single() as { data: Invite | null; error: { message: string } | null };

  if (error || !data) {
    log.error("invite insert failed", { error: error?.message, slug });
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  }

  log.info("invite created", { slug, game_id, player_name });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, declined } = await request.json();
  if (!id || typeof declined !== "boolean") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("invites")
    .update({ declined } as never)
    .eq("id", id)
    .select()
    .single() as { data: Invite | null; error: { message: string } | null };

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
