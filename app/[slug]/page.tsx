import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AttendeeList from "@/components/AttendeeList";
import RsvpSection from "@/components/RsvpSection";
import type { Game, Attendee } from "@/lib/database.types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
};

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

export default async function GamePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { p: defaultName } = await searchParams;
  const data = await getGameData(slug);

  if (!data) notFound();

  const { game, attendees } = data;

  const dateObj = new Date(game.date + "T00:00:00");
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const shortDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

  const [hour, minute] = game.time.split(":");
  const timeObj = new Date();
  timeObj.setHours(parseInt(hour!), parseInt(minute!));
  const timeStr = timeObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      {/* Header */}
      <div className="text-white px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif">Kenny&apos;s Game</h1>
          <div className="mt-3 inline-flex items-center gap-2 text-base bg-white/15 rounded-full px-5 py-2">
            <svg className="w-5 h-5 text-stone-100 shrink-0" viewBox="0 0 1200 1200" fill="currentColor">
              <path d="m600 120c-206.24 0-374.03 167.79-374.03 374.03 0 105.64 33.938 206.24 103.77 307.57 59.051 85.691 133.52 157.4 199.23 220.69 17.879 17.219 34.766 33.48 50.496 49.211 5.4492 5.4492 12.828 8.5078 20.531 8.5078s15.086-3.0586 20.531-8.5078c16.68-16.68 34.246-33.613 52.848-51.539 133.96-129.11 300.66-289.79 300.66-525.94 0-206.24-167.79-374.03-374.03-374.03zm0 615.61c-133.21 0-241.59-108.37-241.59-241.59 0-133.21 108.37-241.59 241.59-241.59 133.21 0 241.59 108.37 241.59 241.59 0 133.21-108.37 241.59-241.59 241.59zm0-425.1c-101.2 0-183.52 82.32-183.52 183.52 0 101.2 82.32 183.52 183.52 183.52s183.52-82.32 183.52-183.52c0-101.2-82.32-183.52-183.52-183.52zm92.734 237.11c-5.375 9.3125-15.133 14.508-25.164 14.508-4.9336 0-9.9258-1.2617-14.496-3.8984l-67.598-39.059c-8.9766-5.1836-14.508-14.773-14.508-25.141v-105.35c0-16.031 12.996-29.027 29.027-29.027s29.027 12.996 29.027 29.027v88.586l53.09 30.684c13.883 8.0273 18.637 25.777 10.609 39.66z"/>
            </svg>
            <span>{weekday} {shortDate} · {timeStr} @ {game.place}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <RsvpSection gameId={game.id} defaultName={defaultName}>
          {/* Attendees */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <h2 className="font-semibold text-stone-700 mb-4">Who&apos;s in</h2>
            <AttendeeList
              initialAttendees={attendees}
              gameId={game.id}
              peopleNeeded={game.people_needed}
            />
          </div>
        </RsvpSection>
      </div>
    </div>
  );
}
