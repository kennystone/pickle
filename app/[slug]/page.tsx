import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AttendeeList from "@/components/AttendeeList";
import RsvpSection from "@/components/RsvpSection";
import type { Game, Attendee, Invite } from "@/lib/database.types";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getDataBySlug(slug: string) {
  const supabase = createServerClient();

  // Try invite slug first
  const { data: invite } = await supabase
    .from("invites")
    .select("*")
    .eq("slug", slug)
    .maybeSingle() as { data: Invite | null };

  if (invite) {
    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("id", invite.game_id)
      .maybeSingle() as { data: Game | null };

    if (!game) return null;

    const { data: attendees } = await supabase
      .from("attendees")
      .select("*")
      .eq("game_id", game.id)
      .order("created_at", { ascending: true }) as { data: Attendee[] | null };

    return { game, attendees: attendees ?? [], defaultName: invite.player_name };
  }

  // Fallback: try game slug (old links)
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

  return { game, attendees: attendees ?? [], defaultName: undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDataBySlug(slug);

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
  const data = await getDataBySlug(slug);

  if (!data) notFound();

  const { game, attendees, defaultName } = data;

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

  const whenWhere = `${weekday} ${shortDate} · ${timeStr} @ ${game.place}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      {/* Header */}
      <div className="text-white px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif">Kenny&apos;s Game Details</h1>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-6">
        <RsvpSection gameId={game.id} defaultName={defaultName} whenWhere={whenWhere}>
          {/* Attendees */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <h2 className="font-semibold text-stone-700 mb-4">Who&apos;s in?</h2>
            <AttendeeList
              initialAttendees={attendees}
              gameId={game.id}
              peopleNeeded={game.people_needed}
              viewerName={defaultName}
            />
          </div>
        </RsvpSection>
      </div>
    </div>
  );
}
