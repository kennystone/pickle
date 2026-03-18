import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateSlug } from "@/lib/slug-generator";
import { isAdmin } from "@/lib/auth";
import type { Game } from "@/lib/database.types";

export async function POST(request: Request) {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, time, place, people_needed } = await request.json();

  if (!date || !time || !place || !people_needed) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Generate a unique slug
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
  }

  if (!slug) {
    return NextResponse.json({ error: "Could not generate unique slug" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("games")
    .insert({ slug, date, time, place, people_needed })
    .select()
    .single() as { data: Game | null; error: { message: string } | null };

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ slug: data.slug });
}
