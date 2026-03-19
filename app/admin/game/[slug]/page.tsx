"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Game {
  id: string;
  slug: string;
  date: string;
  time: string;
  place: string;
  people_needed: number;
}

interface Attendee {
  id: string;
  name: string;
}

interface Favorite {
  id: string;
  name: string;
}

function formatGame(game: Game) {
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

  return { weekday, shortDate, timeStr };
}

export default function AdminGamePage() {
  const { slug } = useParams<{ slug: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Fetch game data via supabase through a simple API
    fetch(`/api/games?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.game) setGame(data.game);
        if (data.attendees) setAttendees(data.attendees);
      });

    fetch("/api/favorites")
      .then((r) => r.json())
      .then(setFavorites);
  }, [slug]);

  function copyLink(favName: string) {
    const url = `${window.location.origin}/${slug}?p=${encodeURIComponent(favName)}`;
    navigator.clipboard.writeText(url);
    setCopied(favName);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700 flex items-center justify-center">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  const { weekday, shortDate, timeStr } = formatGame(game);
  const attendeeNames = new Set(attendees.map((a) => a.name.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      <div className="text-white px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif">Game Details</h1>
          <div className="mt-3 inline-flex items-center gap-2 text-base bg-white/15 rounded-full px-5 py-2">
            <span>{weekday} {shortDate} · {timeStr} @ {game.place}</span>
          </div>
          <div className="mt-2 text-white/60 text-sm">
            {attendees.length}/{game.people_needed} confirmed
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Attendees */}
        {attendees.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <h2 className="font-semibold text-stone-700 mb-3">Confirmed</h2>
            <div className="flex flex-wrap gap-2">
              {attendees.map((a) => (
                <span
                  key={a.id}
                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Favorite links */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="font-semibold text-stone-700 mb-3">Send invite link</h2>
          <p className="text-xs text-stone-400 mb-3">Tap a name to copy their personal RSVP link</p>
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => {
              const alreadyIn = attendeeNames.has(fav.name.toLowerCase());
              return (
                <button
                  key={fav.id}
                  onClick={() => copyLink(fav.name)}
                  disabled={alreadyIn}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                    alreadyIn
                      ? "bg-emerald-100 text-emerald-400 cursor-default"
                      : copied === fav.name
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {alreadyIn ? `${fav.name} ✓` : copied === fav.name ? "Copied!" : fav.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
