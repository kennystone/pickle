import { createServerClient } from "../lib/supabase-server";
import { generateSlug } from "../lib/slug-generator";
import { formatTimeRange } from "../lib/time-range";
import type { Game, Attendee, Invite, Favorite } from "../lib/database.types";

// ANSI colors
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

const BASE_URL = process.env.BASE_URL || "https://pickle.kenny.io";

function die(msg: string): never {
  console.error(red(`Error: ${msg}`));
  process.exit(1);
}

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i]!.startsWith("--") && i + 1 < args.length && !args[i + 1]!.startsWith("--")) {
      flags[args[i]!.slice(2)] = args[i + 1]!;
      i++;
    } else if (args[i]!.startsWith("--")) {
      flags[args[i]!.slice(2)] = "true";
    }
  }
  return flags;
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

async function resolveGameId(supabase: ReturnType<typeof createServerClient>, prefix: string): Promise<string> {
  // UUID columns don't support LIKE, so fetch all and filter client-side
  const { data } = await supabase
    .from("games")
    .select("id") as { data: { id: string }[] | null };

  const matches = data?.filter((g) => g.id.startsWith(prefix));
  if (!matches || matches.length === 0) die(`No game found matching "${prefix}"`);
  if (matches.length > 1) die(`Ambiguous prefix "${prefix}" — matches ${matches.length} games`);
  return matches[0]!.id;
}

// ── Commands ────────────────────────────────────────────────────────────

async function listGames() {
  const supabase = createServerClient();
  const { data: games, error } = await supabase
    .from("games")
    .select("*")
    .order("date", { ascending: false }) as { data: Game[] | null; error: { message: string } | null };

  if (error) die(error.message);
  if (!games || games.length === 0) {
    console.log(dim("No games found."));
    return;
  }

  console.log(bold("Games\n"));
  const placeWidth = Math.max(7, ...games.map((g) => g.place.length)) + 2;
  console.log(
    "ID".padEnd(10) +
    "Date".padEnd(13) +
    "Time".padEnd(16) +
    "Place".padEnd(placeWidth) +
    "Need".padEnd(6) +
    "Slug"
  );
  console.log("─".repeat(45 + placeWidth));

  for (const g of games) {
    const timeRange = formatTimeRange(g.time, g.duration);
    console.log(
      shortId(g.id).padEnd(10) +
      g.date.padEnd(13) +
      timeRange.padEnd(16) +
      g.place.padEnd(placeWidth) +
      String(g.people_needed).padEnd(6) +
      dim(g.slug)
    );
  }
}

async function showGame(id: string) {
  const supabase = createServerClient();
  const gameId = await resolveGameId(supabase, id);

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single() as { data: Game | null };

  if (!game) die("Game not found");

  const { data: attendees } = await supabase
    .from("attendees")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true }) as { data: Attendee[] | null };

  const { data: invites } = await supabase
    .from("invites")
    .select("*")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true }) as { data: Invite[] | null };

  const timeRange = formatTimeRange(game.time, game.duration);

  console.log(bold(`\nGame ${shortId(game.id)}\n`));
  console.log(`  Date:     ${game.date}`);
  console.log(`  Time:     ${timeRange}`);
  console.log(`  Place:    ${game.place}`);
  console.log(`  Need:     ${game.people_needed}`);
  console.log(`  Slug:     ${game.slug}`);
  console.log(`  ID:       ${dim(game.id)}`);

  console.log(bold(`\nAttendees (${attendees?.length ?? 0})\n`));
  if (attendees && attendees.length > 0) {
    for (const a of attendees) {
      console.log(`  ${a.name}`);
    }
  } else {
    console.log(dim("  None"));
  }

  console.log(bold(`\nInvites (${invites?.length ?? 0})\n`));
  if (invites && invites.length > 0) {
    for (const inv of invites) {
      const status = inv.declined ? red("declined") : dim("pending");
      console.log(`  ${inv.player_name.padEnd(20)} ${status.padEnd(30)} ${dim(inv.slug)}`);
    }
  } else {
    console.log(dim("  None"));
  }
}

async function createGame(args: string[]) {
  const flags = parseFlags(args);

  const date = flags.date || prompt("Date (YYYY-MM-DD):")?.trim();
  const time = flags.time || prompt("Time (HH:MM):")?.trim();
  const place = flags.place || prompt("Place:")?.trim();
  const duration = parseInt(flags.duration || prompt("Duration (minutes, default 120):")?.trim() || "120");
  const people_needed = parseInt(flags.people || prompt("People needed:")?.trim() || "0");

  if (!date || !time || !place || !people_needed) {
    die("Missing required fields: date, time, place, people");
  }

  const supabase = createServerClient();

  // Generate unique slug (same retry loop as API)
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
    console.log(dim(`Slug collision, retrying (${i + 1}/10)...`));
  }

  if (!slug) die("Could not generate unique slug after 10 attempts");

  const { data, error } = await supabase
    .from("games")
    .insert({ slug, date, time, place, duration, people_needed } as never)
    .select()
    .single() as { data: Game | null; error: { message: string } | null };

  if (error || !data) die(error?.message ?? "Insert failed");

  // Auto-add Kenny Stone
  await supabase
    .from("attendees")
    .insert({ game_id: data.id, name: "Kenny Stone" } as never);

  console.log(green(`Game created: ${shortId(data.id)}`));
  console.log(`  Slug: ${data.slug}`);
  console.log(`  Date: ${data.date} ${formatTimeRange(data.time, data.duration)}`);
  console.log(`  ${dim(data.id)}`);
}

async function deleteGame(id: string) {
  const supabase = createServerClient();
  const gameId = await resolveGameId(supabase, id);

  const { error } = await supabase.from("games").delete().eq("id", gameId);
  if (error) die(error.message);

  console.log(green(`Deleted game ${shortId(gameId)}`));
}

async function createInvite(gameId: string, args: string[]) {
  const supabase = createServerClient();
  const resolvedGameId = await resolveGameId(supabase, gameId);

  if (args.includes("--all")) {
    // Invite all favorites
    const { data: favorites } = await supabase
      .from("favorites")
      .select("*")
      .order("name", { ascending: true }) as { data: Favorite[] | null };

    if (!favorites || favorites.length === 0) {
      console.log(dim("No favorites found."));
      return;
    }

    for (const fav of favorites) {
      await invitePlayer(supabase, resolvedGameId, fav.name);
    }
    return;
  }

  const name = args.join(" ");
  if (!name) die("Usage: invite <game_id> <name>");

  await invitePlayer(supabase, resolvedGameId, name);
}

async function invitePlayer(
  supabase: ReturnType<typeof createServerClient>,
  gameId: string,
  playerName: string,
) {
  // Check for existing invite (idempotent, case-insensitive)
  const { data: existing } = await supabase
    .from("invites")
    .select("*")
    .eq("game_id", gameId)
    .ilike("player_name", playerName)
    .maybeSingle() as { data: Invite | null };

  if (existing) {
    console.log(dim(`  ${playerName.padEnd(20)} already invited (${existing.slug})`));
    console.log(`  ${BASE_URL}/invite/${existing.slug}`);
    return;
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
  }

  if (!slug) die("Could not generate unique invite slug");

  const { data, error } = await supabase
    .from("invites")
    .insert({ slug, game_id: gameId, player_name: playerName } as never)
    .select()
    .single() as { data: Invite | null; error: { message: string } | null };

  if (error || !data) die(error?.message ?? "Insert failed");

  console.log(green(`  ${playerName.padEnd(20)} ${data.slug}`));
  console.log(`  ${BASE_URL}/invite/${data.slug}`);
}

async function listAttendees(gameId: string) {
  const supabase = createServerClient();
  const resolvedGameId = await resolveGameId(supabase, gameId);

  const { data: attendees } = await supabase
    .from("attendees")
    .select("*")
    .eq("game_id", resolvedGameId)
    .order("created_at", { ascending: true }) as { data: Attendee[] | null };

  if (!attendees || attendees.length === 0) {
    console.log(dim("No attendees."));
    return;
  }

  console.log(bold(`\nAttendees\n`));
  for (const a of attendees) {
    console.log(`  ${a.name.padEnd(25)} ${dim(shortId(a.id))}`);
  }
}

async function listFavorites() {
  const supabase = createServerClient();
  const { data: favorites, error } = await supabase
    .from("favorites")
    .select("*")
    .order("name", { ascending: true }) as { data: Favorite[] | null; error: { message: string } | null };

  if (error) die(error.message);
  if (!favorites || favorites.length === 0) {
    console.log(dim("No favorites."));
    return;
  }

  console.log(bold(`\nFavorites\n`));
  for (const f of favorites) {
    console.log(`  ${f.name.padEnd(25)} ${dim(shortId(f.id))}`);
  }
}

async function addFavorite(args: string[]) {
  const name = args.join(" ");
  if (!name) die("Usage: favorites add <name>");

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("favorites")
    .insert({ name } as never)
    .select()
    .single() as { data: Favorite | null; error: { message: string } | null };

  if (error) die(error.message);
  console.log(green(`Added favorite: ${data!.name}`));
}

async function removeFavorite(args: string[]) {
  const name = args.join(" ");
  if (!name) die("Usage: favorites remove <name>");

  const supabase = createServerClient();

  const { data: fav } = await supabase
    .from("favorites")
    .select("*")
    .ilike("name", name)
    .maybeSingle() as { data: Favorite | null };

  if (!fav) die(`Favorite "${name}" not found`);

  const { error } = await supabase.from("favorites").delete().eq("id", fav.id);
  if (error) die(error.message);

  console.log(green(`Removed favorite: ${fav.name}`));
}

// ── Help ────────────────────────────────────────────────────────────────

function showHelp() {
  console.log(`
${bold("pickle admin")} — manage pickleball games

${bold("Usage:")}
  bun scripts/admin.ts <command> [args]

${bold("Commands:")}
  games                           List all games
  games create [flags]            Create a game
  games delete <id>               Delete a game
  games <id>                      Show game detail + attendees + invites

  invite <game_id> <name>         Create invite, print link
  invite <game_id> --all          Invite all favorites

  attendees <game_id>             List attendees

  favorites                       List favorites
  favorites add <name>            Add a favorite
  favorites remove <name>         Remove a favorite

${bold("Game Create Flags:")}
  --date 2026-03-21  --time 14:00  --place PA  --duration 120  --people 5

${bold("Notes:")}
  Game IDs accept partial UUID prefixes (e.g. "a85b" matches "a85b5555-...")
  Multi-word names are supported: favorites add Kenny Stone
`);
}

// ── Router ──────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    return;
  }

  const command = args[0]!;
  const sub = args[1];

  switch (command) {
    case "games":
      if (!sub) return listGames();
      if (sub === "create") return createGame(args.slice(2));
      if (sub === "delete") {
        if (!args[2]) die("Usage: games delete <id>");
        return deleteGame(args[2]);
      }
      // games <id> — show detail
      return showGame(sub);

    case "invite":
      if (!sub) die("Usage: invite <game_id> <name|--all>");
      return createInvite(sub, args.slice(2));

    case "attendees":
      if (!sub) die("Usage: attendees <game_id>");
      return listAttendees(sub);

    case "favorites":
      if (!sub) return listFavorites();
      if (sub === "add") return addFavorite(args.slice(2));
      if (sub === "remove") return removeFavorite(args.slice(2));
      die(`Unknown favorites subcommand: ${sub}`);
      break;

    default:
      die(`Unknown command: ${command}. Run with --help for usage.`);
  }
}

// Only run when executed directly, not when imported by tests
if (import.meta.main) {
  main().catch((e) => {
    console.error(red(e.message));
    process.exit(1);
  });
}

export { parseFlags, shortId, resolveGameId, main };
