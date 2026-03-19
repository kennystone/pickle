import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import type { Game, Attendee } from "@/lib/database.types";

type GameWithAttendees = Game & { attendees: Attendee[] };

async function getGames(): Promise<GameWithAttendees[]> {
  const supabase = createServerClient();

  const { data: games } = (await supabase
    .from("games")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true })) as { data: Game[] | null };

  if (!games?.length) return [];

  const { data: attendees } = (await supabase
    .from("attendees")
    .select("*")
    .in("game_id", games.map((g) => g.id))
    .order("created_at", { ascending: true })) as { data: Attendee[] | null };

  const attendeesByGame = new Map<string, Attendee[]>();
  for (const a of attendees ?? []) {
    const list = attendeesByGame.get(a.game_id) ?? [];
    list.push(a);
    attendeesByGame.set(a.game_id, list);
  }

  return games.map((g) => ({ ...g, attendees: attendeesByGame.get(g.id) ?? [] }));
}

function formatGame(game: Game) {
  const dateObj = new Date(game.date + "T00:00:00");
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const shortDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

  const [hour, minute] = game.time.split(":");
  const timeObj = new Date();
  timeObj.setHours(parseInt(hour!), parseInt(minute!));
  const timeStr = timeObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return { weekday, shortDate, timeStr };
}

function GameCard({ game }: { game: GameWithAttendees }) {
  const { weekday, shortDate, timeStr } = formatGame(game);
  const count = game.attendees.length;

  return (
    <Link
      href={`/admin/game/${game.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm border border-stone-100 hover:border-emerald-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-stone-800">
            {weekday} {shortDate} · {timeStr}
          </div>
          <div className="text-sm text-stone-500 mt-0.5">@ {game.place}</div>
        </div>
        <div className={`text-sm font-medium ${count >= game.people_needed ? "text-emerald-600" : "text-stone-400"}`}>
          {count}/{game.people_needed}
        </div>
      </div>
      {count > 0 && (
        <div className="mt-2 text-xs text-stone-400">
          {game.attendees.map((a) => a.name).join(", ")}
        </div>
      )}
    </Link>
  );
}

export default async function ListPage() {
  const games = await getGames();
  const today = new Date().toISOString().split("T")[0]!;

  const upcoming = games.filter((g) => g.date >= today);
  const previous = games.filter((g) => g.date < today).reverse();

  return (
    <>
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Upcoming */}
        <div>
          <h2 className="text-sm font-semibold text-emerald-300 uppercase tracking-wide mb-3">
            Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-white/50 text-sm">No upcoming games</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>

        {/* Previous */}
        {previous.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-3">
              Previous
            </h2>
            <div className="space-y-3 opacity-60">
              {previous.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
