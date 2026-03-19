"use client";

import { useState, useEffect, FormEvent } from "react";
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

interface Invite {
  id: string;
  slug: string;
  game_id: string;
  player_name: string;
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
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/games?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.game) setGame(data.game);
        if (data.attendees) setAttendees(data.attendees);
      });

    fetch(`/api/invites?game_id=${id}`)
      .then((r) => r.json())
      .then(setInvites);

    fetch("/api/favorites")
      .then((r) => r.json())
      .then(setFavorites);
  }, [id]);

  function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text: string) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  async function createInviteAndCopy(playerName: string) {
    setGenerating(playerName);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: id, player_name: playerName }),
      });

      if (!res.ok) return;

      const invite: Invite = await res.json();

      setInvites((prev) =>
        prev.some((i) => i.id === invite.id) ? prev : [...prev, invite]
      );

      copyText(`${window.location.origin}/${invite.slug}`);
      setCopied(playerName);
      setTimeout(() => setCopied(null), 2000);
    } finally {
      setGenerating(null);
    }
  }

  function copyInviteLink(invite: Invite) {
    copyText(`${window.location.origin}/${invite.slug}`);
    setCopied(invite.player_name);
    setTimeout(() => setCopied(null), 2000);
  }

  async function removeAttendee(attendeeId: string) {
    setRemovingId(attendeeId);
    const res = await fetch("/api/attendees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: attendeeId }),
    });
    if (res.ok) {
      setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
    }
    setRemovingId(null);
  }

  async function handleCustomInvite(e: FormEvent) {
    e.preventDefault();
    const name = customName.trim();
    if (!name) return;
    await createInviteAndCopy(name);
    setCustomName("");
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
  const invitedNames = new Set(invites.map((i) => i.player_name.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      <div className="text-white px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif">Kenny&apos;s Game Details</h1>
          <div className="mt-3 inline-flex items-center gap-2 text-base bg-white/15 rounded-full px-5 py-2">
            <span>{weekday} {shortDate} · {timeStr} @ {game.place}</span>
          </div>
          <div className="mt-2 text-white/60 text-sm">
            {attendees.length}/{game.people_needed} confirmed
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Confirmed attendees */}
        {attendees.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <h2 className="font-semibold text-stone-700 mb-3">Confirmed</h2>
            <div className="flex flex-wrap gap-2">
              {attendees.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {a.name}
                  <button
                    onClick={() => removeAttendee(a.id)}
                    disabled={removingId === a.id}
                    className="text-emerald-400 hover:text-red-500 transition-colors ml-0.5"
                  >
                    {removingId === a.id ? "..." : "\u00d7"}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick invite from favorites */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="font-semibold text-stone-700 mb-3">Quick invite</h2>
          <p className="text-xs text-stone-400 mb-3">Tap a name to generate their invite link</p>
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => {
              const alreadyIn = attendeeNames.has(fav.name.toLowerCase());
              const isGenerating = generating === fav.name;
              return (
                <button
                  key={fav.id}
                  onClick={() => createInviteAndCopy(fav.name)}
                  disabled={alreadyIn || isGenerating}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                    alreadyIn
                      ? "bg-emerald-100 text-emerald-400 cursor-default"
                      : copied === fav.name
                        ? "bg-emerald-600 text-white"
                        : isGenerating
                          ? "bg-stone-200 text-stone-400"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {alreadyIn ? `${fav.name} ✓` : copied === fav.name ? "Copied!" : isGenerating ? "..." : fav.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom invite */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="font-semibold text-stone-700 mb-3">Custom invite</h2>
          <form onSubmit={handleCustomInvite} className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Player name"
              className="flex-1 px-4 py-2 border-2 border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={!customName.trim() || generating !== null}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
            >
              Generate Link
            </button>
          </form>
        </div>

        {/* Invites table */}
        {invites.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <h2 className="font-semibold text-stone-700 mb-3">Invites</h2>
            <div className="space-y-2">
              {invites.map((invite) => {
                const confirmed = attendeeNames.has(invite.player_name.toLowerCase());
                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between py-2 px-1"
                  >
                    <span className="text-sm text-stone-700 font-medium">
                      {invite.player_name}
                      {confirmed && <span className="ml-1.5 text-emerald-500">✓</span>}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/admin/game/player/${invite.slug}`}
                        target="_blank"
                        className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-500 hover:bg-stone-200 transition-all"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => copyInviteLink(invite)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          copied === invite.player_name
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                      >
                        {copied === invite.player_name ? "Copied!" : "Copy link"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-stone-800 text-white text-sm font-medium rounded-full shadow-lg transition-all duration-300 ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        Link copied for {copied}
      </div>
    </div>
  );
}
