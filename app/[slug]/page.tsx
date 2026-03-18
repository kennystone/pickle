import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AttendeeList from "@/components/AttendeeList";
import AttendeeForm from "@/components/AttendeeForm";
import type { Game, Attendee } from "@/lib/database.types";

type Props = { params: Promise<{ slug: string }> };

async function getGameData(slug: string) {
  const supabase = createServerClient();

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .maybeSingle() as { data: Game | null };

  if (!game) return null;

  const { data: attendees } = await supabase
    .from("attendees")
    .select("*")
    .eq("game_id", game.id)
    .order("created_at", { ascending: true }) as { data: Attendee[] | null };

  return { game, attendees: attendees ?? [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getGameData(slug);

  if (!data) {
    return { title: "Game not found — Kenny Pickle" };
  }

  const { game, attendees } = data;
  const count = attendees.length;

  const dateObj = new Date(game.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [hour, minute] = game.time.split(":");
  const timeObj = new Date();
  timeObj.setHours(parseInt(hour!), parseInt(minute!));
  const timeStr = timeObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const title = `Pickleball @ ${game.place} — ${dateStr}`;
  const description = `${timeStr} · ${count}/${game.people_needed} players confirmed. Join us!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Kenny Pickle",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const data = await getGameData(slug);

  if (!data) notFound();

  const { game, attendees } = data;

  const dateObj = new Date(game.date + "T00:00:00");
  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [hour, minute] = game.time.split(":");
  const timeObj = new Date();
  timeObj.setHours(parseInt(hour!), parseInt(minute!));
  const timeStr = timeObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-pickle-green text-white px-4 py-6">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🥒</span>
            <span className="text-sm font-medium opacity-75">Kenny Pickle</span>
          </div>
          <h1 className="text-2xl font-bold leading-tight">Pickleball!</h1>
          <div className="mt-3 space-y-1 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>{timeStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{game.place}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* RSVP form */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="font-semibold text-stone-700 mb-3">Are you coming?</h2>
          <AttendeeForm gameId={game.id} />
        </div>

        {/* Attendees */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="font-semibold text-stone-700 mb-4">Who&apos;s in</h2>
          <AttendeeList
            initialAttendees={attendees}
            gameId={game.id}
            peopleNeeded={game.people_needed}
          />
        </div>
      </div>
    </div>
  );
}
