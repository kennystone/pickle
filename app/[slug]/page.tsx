import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import AttendeeList from "@/components/AttendeeList";
import RsvpSection from "@/components/RsvpSection";
import type { Game, Attendee, Invite } from "@/lib/database.types";
import { formatTimeRange } from "@/lib/time-range";

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

  const timeRange = formatTimeRange(game.time, game.duration || 120);
  const pillTime = `${weekday} ${shortDate} · ${timeRange}`;
  const paMapUrl = "https://maps.app.goo.gl/2semxb1XU9zmQ3ky7";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      {/* Header */}
      <div className="text-white px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto text-center">
          <svg className="w-20 h-20 mx-auto mb-2" viewBox="0 0 1200 1200" fill="#10b981">
            <path d="m502.69 727.31c-7.8281 0-15.609-3.2344-21.188-9.6094-10.219-11.672-9.0469-29.484 2.625-39.703l134.81-117.94c11.672-10.219 29.438-9.0469 39.656 2.625s9.0469 29.484-2.6719 39.703l-134.81 117.94c-5.3438 4.6875-11.953 6.9375-18.516 6.9375z"/>
            <path d="m214.26 687.94c-4.9219 0-9.9375-1.3125-14.484-4.0312-13.312-8.0156-17.578-25.312-9.5625-38.625l216.94-359.81c6.0938-10.078 17.859-15.281 29.344-13.078 11.578 2.2031 20.531 11.391 22.453 23.016l8.5781 51.516 223.22-271.03c9.8906-12 27.609-13.734 39.609-3.8438s13.734 27.609 3.8438 39.609l-262.5 318.74c-6.9844 8.5312-18.375 12.141-28.969 9.2812-10.641-2.8594-18.656-11.672-20.484-22.547l-6.2344-37.406-177.61 294.61c-5.2969 8.7656-14.578 13.594-24.094 13.594z"/>
            <path d="m656.26 945.56c-9.6094 0-18.938-4.9219-24.188-13.781-7.9219-13.359-3.5156-30.609 9.8438-38.531l124.45-73.781-21.844-4.3594c-11.109-2.2031-19.781-10.875-22.031-21.938s2.3438-22.453 11.672-28.828l356.26-243.74c12.797-8.7656 30.281-5.4844 39.094 7.3125 8.7656 12.797 5.4844 30.328-7.3594 39.094l-301.18 206.06 28.312 5.6719c11.438 2.2969 20.25 11.391 22.219 22.875 1.9688 11.484-3.3281 22.969-13.406 28.922l-187.5 111.19c-4.5 2.6719-9.4219 3.9375-14.297 3.9375z"/>
            <path d="m487.5 590.63c-6.4688 0-12.984-2.2031-18.281-6.7969-11.812-10.125-13.172-27.844-3.0469-39.656l225-262.5c5.5312-6.4688 13.641-10.125 22.266-9.7969 8.5312 0.28125 16.453 4.4062 21.609 11.25l36.797 49.031 258.28-258.28c10.969-10.969 28.781-10.969 39.75 0s10.969 28.781 0 39.75l-281.26 281.26c-5.7656 5.7656-13.547 8.7656-21.891 8.1562-8.1094-0.5625-15.609-4.6406-20.531-11.156l-35.203-46.969-202.18 235.87c-5.5781 6.4688-13.453 9.8438-21.375 9.8438z"/>
            <path d="m637.5 759.37c-8.7188 0-17.25-4.0312-22.781-11.578-9.1406-12.562-6.375-30.141 6.1875-39.281l358.22-260.53-46.312-7.7344c-10.688-1.7812-19.406-9.5625-22.406-19.969s0.23438-21.609 8.3438-28.828l168.74-150c11.578-10.359 29.391-9.2812 39.703 2.3438s9.2812 29.391-2.3438 39.703l-124.78 110.91 54.469 9.0938c11.203 1.875 20.156 10.266 22.781 21.281 2.5781 11.016-1.6875 22.547-10.828 29.203l-412.5 300c-4.9688 3.6562-10.781 5.3906-16.5 5.3906z"/>
            <path d="m768.74 234.37c-7.2188 0-14.391-2.7656-19.875-8.25-10.969-10.969-10.969-28.781 0-39.75l112.5-112.5c10.969-10.969 28.781-10.969 39.75 0s10.969 28.781 0 39.75l-112.5 112.5c-5.4844 5.4844-12.703 8.25-19.875 8.25z"/>
            <path d="m332.72 1134.4c-147.28 0-267.1-119.81-267.1-267.1 0-147.28 119.81-267.1 267.1-267.1 147.28 0 267.1 119.81 267.1 267.1 0 147.28-119.81 267.1-267.1 267.1zm0-477.94c-116.25 0-210.84 94.594-210.84 210.84 0 116.25 94.594 210.84 210.84 210.84s210.84-94.594 210.84-210.84c0-116.25-94.594-210.84-210.84-210.84z"/>
            <path d="m370.22 867.28c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
            <path d="m370.22 722.06c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m232.13 822.42c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
            <path d="m284.86 984.74c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m455.58 984.74c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m508.31 822.42c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
          </svg>
          <h1 className="text-4xl font-bold font-serif mt-5 mb-5">Kenny&apos;s Game</h1>
          <div className="inline-flex items-center gap-2 text-base text-white bg-emerald-600 rounded-full px-5 py-2">
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 1200 1200" fill="currentColor">
              <path d="m600 120c-206.24 0-374.03 167.79-374.03 374.03 0 105.64 33.938 206.24 103.77 307.57 59.051 85.691 133.52 157.4 199.23 220.69 17.879 17.219 34.766 33.48 50.496 49.211 5.4492 5.4492 12.828 8.5078 20.531 8.5078s15.086-3.0586 20.531-8.5078c16.68-16.68 34.246-33.613 52.848-51.539 133.96-129.11 300.66-289.79 300.66-525.94 0-206.24-167.79-374.03-374.03-374.03zm0 615.61c-133.21 0-241.59-108.37-241.59-241.59 0-133.21 108.37-241.59 241.59-241.59 133.21 0 241.59 108.37 241.59 241.59 0 133.21-108.37 241.59-241.59 241.59zm0-425.1c-101.2 0-183.52 82.32-183.52 183.52 0 101.2 82.32 183.52 183.52 183.52s183.52-82.32 183.52-183.52c0-101.2-82.32-183.52-183.52-183.52zm92.734 237.11c-5.375 9.3125-15.133 14.508-25.164 14.508-4.9336 0-9.9258-1.2617-14.496-3.8984l-67.598-39.059c-8.9766-5.1836-14.508-14.773-14.508-25.141v-105.35c0-16.031 12.996-29.027 29.027-29.027s29.027 12.996 29.027 29.027v88.586l53.09 30.684c13.883 8.0273 18.637 25.777 10.609 39.66z"/>
            </svg>
            <span>{pillTime} @ {game.place === "PA" ? <a href={paMapUrl} target="_blank" className="underline">PA</a> : game.place}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-6">
        <RsvpSection
          gameId={game.id}
          defaultName={defaultName}
          isFull={attendees.length >= game.people_needed}
          alreadyConfirmed={!!defaultName && attendees.some((a) => a.name.toLowerCase() === defaultName.toLowerCase())}
          confirmedAttendeeId={defaultName ? attendees.find((a) => a.name.toLowerCase() === defaultName.toLowerCase())?.id : undefined}
        >
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

        {/* Pickleball icon */}
        <div className="flex justify-center pt-1 pb-2">
          <svg className="w-16 h-16 text-emerald-500" viewBox="0 0 1200 1200" fill="currentColor">
            <path d="m369.56 958.13c-4.9219 0-9.8906-1.2656-14.391-3.9844-143.9-85.781-233.29-243.05-233.29-410.39 0-263.63 214.5-478.13 478.13-478.13 263.63 0 478.13 214.5 478.13 478.13 0 116.53-42.469 228.79-119.53 316.03-10.266 11.625-28.031 12.703-39.703 2.4375-11.625-10.312-12.75-28.031-2.4375-39.703 68.016-76.969 105.47-175.97 105.47-278.81 0-232.6-189.28-421.87-421.87-421.87-232.69 0.046875-421.92 189.32-421.92 421.92 0 147.66 78.891 286.36 205.82 362.11 13.312 7.9688 17.719 25.219 9.75 38.578-5.25 8.8125-14.578 13.734-24.188 13.734z"/>
            <path d="m600 501.28c-78.75 0-142.82-64.078-142.82-142.82s64.078-142.82 142.82-142.82 142.82 64.078 142.82 142.82-64.078 142.82-142.82 142.82zm0-229.4c-47.719 0-86.578 38.859-86.578 86.578 0 47.766 38.859 86.578 86.578 86.578s86.578-38.859 86.578-86.578-38.859-86.578-86.578-86.578z"/>
            <path d="m794.06 756c-15.516 0-28.125-12.609-28.125-28.125v-60.562c0-91.5-74.438-165.94-165.94-165.94s-165.94 74.438-165.94 165.94v60.562c0 15.516-12.609 28.125-28.125 28.125s-28.125-12.609-28.125-28.125v-60.562c0-122.53 99.656-222.19 222.19-222.19s222.19 99.656 222.19 222.19v60.562c0 15.516-12.609 28.125-28.125 28.125z"/>
            <path d="m335.29 543.56c-59.391 0-107.72-48.328-107.72-107.72s48.328-107.72 107.72-107.72 107.72 48.328 107.72 107.72-48.328 107.72-107.72 107.72zm0-159.19c-28.359 0-51.469 23.109-51.469 51.469s23.109 51.469 51.469 51.469 51.469-23.109 51.469-51.469-23.109-51.469-51.469-51.469z"/>
            <path d="m178.69 729.94c-15.516 0-28.125-12.609-28.125-28.125v-29.812c0-101.81 82.875-184.69 184.69-184.69 46.594 0 90.891 17.25 124.69 48.562 11.391 10.547 12.047 28.359 1.5 39.75s-28.359 12.047-39.75 1.5c-23.344-21.656-54.094-33.562-86.438-33.562-70.828 0-128.44 57.609-128.44 128.44v29.812c0 15.516-12.609 28.125-28.125 28.125z"/>
            <path d="m864.71 543.56c-59.391 0-107.72-48.328-107.72-107.72s48.328-107.72 107.72-107.72 107.72 48.328 107.72 107.72-48.328 107.72-107.72 107.72zm0-159.19c-28.359 0-51.469 23.109-51.469 51.469s23.109 51.469 51.469 51.469 51.469-23.109 51.469-51.469-23.109-51.469-51.469-51.469z"/>
            <path d="m1021.3 729.94c-15.516 0-28.125-12.609-28.125-28.125v-29.812c0-70.828-57.609-128.44-128.44-128.44-32.391 0-63.094 11.906-86.438 33.562-11.391 10.547-29.156 9.8906-39.75-1.5-10.547-11.391-9.8906-29.203 1.5-39.75 33.797-31.312 78.094-48.562 124.69-48.562 101.81 0 184.69 82.875 184.69 184.69v29.812c0 15.516-12.609 28.125-28.125 28.125z"/>
            <path d="m600 600.19c-147.28 0-267.1 119.81-267.1 267.1 0 147.28 119.81 267.1 267.1 267.1 147.28 0 267.1-119.81 267.1-267.1 0-147.28-119.81-267.1-267.1-267.1zm-165.98 247.31c-13.875-15.375-12.609-39.094 2.7656-52.969s39.094-12.609 52.969 2.7656 12.609 39.094-2.7656 52.969-39.094 12.609-52.969-2.7656zm95.859 171.52c-18.938 8.4375-41.109-0.09375-49.5-18.984-8.4375-18.938 0.09375-41.109 18.984-49.5 18.938-8.4375 41.109 0.09375 49.5 18.984 8.4375 18.938-0.09375 41.109-18.984 49.5zm102.56-132.98c-10.359 17.953-33.281 24.094-51.234 13.734s-24.094-33.281-13.734-51.234 33.281-24.094 51.234-13.734 24.094 33.281 13.734 51.234zm0-145.22c-10.359 17.953-33.281 24.094-51.234 13.734s-24.094-33.281-13.734-51.234 33.281-24.094 51.234-13.734 24.094 33.281 13.734 51.234zm56.812 281.21c-20.578 2.1562-39.047-12.797-41.203-33.375s12.797-39.047 33.375-41.203 39.047 12.797 41.203 33.375-12.797 39.047-33.375 41.203zm85.5-191.86c-4.3125 20.25-24.234 33.188-44.484 28.875s-33.188-24.234-28.875-44.484 24.234-33.188 44.484-28.875 33.188 24.234 28.875 44.484z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
