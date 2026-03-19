import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AttendeeList from "@/components/AttendeeList";
import RsvpSection from "@/components/RsvpSection";
import type { Game, Attendee, Invite } from "@/lib/database.types";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AdminPlayerPreview({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: invite } = await supabase
    .from("invites")
    .select("*")
    .eq("slug", slug)
    .maybeSingle() as { data: Invite | null };

  if (!invite) notFound();

  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", invite.game_id)
    .maybeSingle() as { data: Game | null };

  if (!game) notFound();

  const { data: attendees } = await supabase
    .from("attendees")
    .select("*")
    .eq("game_id", game.id)
    .order("created_at", { ascending: true }) as { data: Attendee[] | null };

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
      {/* Admin preview banner */}
      <div className="bg-amber-500 text-amber-950 text-center text-xs font-semibold py-1.5 px-4">
        Preview as {invite.player_name} &middot;{" "}
        <Link href={`/admin/game/${game.id}`} className="underline">
          Back to admin
        </Link>
      </div>

      {/* Header */}
      <div className="text-white px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif">Kenny&apos;s Game Details</h1>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-6">
        <RsvpSection gameId={game.id} defaultName={invite.player_name} whenWhere={whenWhere}>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <h2 className="font-semibold text-stone-700 mb-4">Who&apos;s in</h2>
            <AttendeeList
              initialAttendees={attendees ?? []}
              gameId={game.id}
              peopleNeeded={game.people_needed}
              viewerName={invite.player_name}
            />
          </div>
        </RsvpSection>
      </div>
    </div>
  );
}
