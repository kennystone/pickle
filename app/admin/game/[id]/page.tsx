"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatTimeRange } from "@/lib/time-range";
import { getInviteStatus, getInviteAction, type InviteStatus } from "@/lib/game-logic";

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
  declined: boolean;
}

function formatGame(game: Game) {
  const dateObj = new Date(game.date + "T00:00:00");
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const shortDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

  const timeRange = formatTimeRange(game.time, (game as Game & { duration?: number }).duration || 120);

  return { weekday, shortDate, timeRange };
}

export default function AdminGamePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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

  async function confirmPlayer(playerName: string) {
    const res = await fetch("/api/attendees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: id, name: playerName }),
    });
    if (res.ok) {
      const data = await res.json();
      setAttendees((prev) => [...prev, data]);
    }
  }

  async function removeByName(playerName: string) {
    const attendee = attendees.find(
      (a) => a.name.toLowerCase() === playerName.toLowerCase()
    );
    if (!attendee) return;
    await removeAttendee(attendee.id);
  }

  async function resetInvite(inviteId: string) {
    // Clear declined flag on the invite
    await fetch(`/api/invites`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inviteId, declined: false }),
    });
    setInvites((prev) =>
      prev.map((i) => (i.id === inviteId ? { ...i, declined: false } : i))
    );
  }

  async function deleteGame() {
    if (!confirm("Delete this game? This cannot be undone.")) return;
    const res = await fetch("/api/games", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      router.push("/admin/list");
    }
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
      <div className="flex items-center justify-center py-20">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  const { weekday, shortDate, timeRange } = formatGame(game);
  const attendeeNames = new Set(attendees.map((a) => a.name.toLowerCase()));
  const invitedNames = new Set(invites.map((i) => i.player_name.toLowerCase()));

  return (
    <>
      <div className="text-white px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif">Kenny&apos;s Game Details</h1>
          <div className="mt-3 inline-flex items-center gap-2 text-base text-white bg-emerald-600 rounded-full px-5 py-2">
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 1200 1200" fill="currentColor">
              <path d="m600 120c-206.24 0-374.03 167.79-374.03 374.03 0 105.64 33.938 206.24 103.77 307.57 59.051 85.691 133.52 157.4 199.23 220.69 17.879 17.219 34.766 33.48 50.496 49.211 5.4492 5.4492 12.828 8.5078 20.531 8.5078s15.086-3.0586 20.531-8.5078c16.68-16.68 34.246-33.613 52.848-51.539 133.96-129.11 300.66-289.79 300.66-525.94 0-206.24-167.79-374.03-374.03-374.03zm0 615.61c-133.21 0-241.59-108.37-241.59-241.59 0-133.21 108.37-241.59 241.59-241.59 133.21 0 241.59 108.37 241.59 241.59 0 133.21-108.37 241.59-241.59 241.59zm0-425.1c-101.2 0-183.52 82.32-183.52 183.52 0 101.2 82.32 183.52 183.52 183.52s183.52-82.32 183.52-183.52c0-101.2-82.32-183.52-183.52-183.52zm92.734 237.11c-5.375 9.3125-15.133 14.508-25.164 14.508-4.9336 0-9.9258-1.2617-14.496-3.8984l-67.598-39.059c-8.9766-5.1836-14.508-14.773-14.508-25.141v-105.35c0-16.031 12.996-29.027 29.027-29.027s29.027 12.996 29.027 29.027v88.586l53.09 30.684c13.883 8.0273 18.637 25.777 10.609 39.66z"/>
            </svg>
            <span>{weekday} {shortDate} · {timeRange} @ {game.place === "PA" ? <a href="https://maps.app.goo.gl/2semxb1XU9zmQ3ky7" target="_blank" className="underline">PA</a> : game.place}</span>
          </div>
          <div className="mt-2 text-white/60 text-sm">
            {attendees.length}/{game.people_needed} confirmed
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Invites table */}
        {invites.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <h2 className="font-semibold text-stone-700 mb-3">Invites</h2>
            <div className="space-y-2">
              {invites.map((invite) => {
                const declinedNames = invites.filter((i) => i.declined).map((i) => i.player_name);
                const status = getInviteStatus(
                  invite.player_name,
                  Array.from(attendeeNames),
                  declinedNames,
                );
                const action = getInviteAction(status);
                const statusColors: Record<InviteStatus, string> = {
                  confirmed: "text-emerald-500",
                  pending: "text-stone-400",
                  declined: "text-red-400",
                };
                const statusLabels: Record<InviteStatus, string> = {
                  confirmed: "✓",
                  pending: "…",
                  declined: "✗",
                };
                const actionColors: Record<InviteStatus, string> = {
                  confirmed: "bg-red-50 text-red-500 hover:bg-red-100",
                  pending: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                  declined: "bg-stone-100 text-stone-500 hover:bg-stone-200",
                };

                function handleAction() {
                  if (status === "confirmed") removeByName(invite.player_name);
                  else if (status === "pending") confirmPlayer(invite.player_name);
                  else resetInvite(invite.id);
                }

                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between py-2 px-1"
                  >
                    <span className="text-sm text-stone-700 font-medium">
                      {invite.player_name}
                      <span className={`ml-1.5 ${statusColors[status]}`}>{statusLabels[status]}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyInviteLink(invite)}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all bg-stone-100 text-stone-500 hover:bg-stone-200 whitespace-nowrap"
                      >
                        {copied === invite.player_name ? "✓" : "Copy link"}
                      </button>
                      <button
                        onClick={handleAction}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${actionColors[status]}`}
                      >
                        {action}
                      </button>
                    </div>
                  </div>
                );
              })}
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

        {/* Delete game */}
        <div className="flex justify-center">
          <button
            onClick={deleteGame}
            className="inline-flex items-center gap-1.5 px-6 py-2 bg-red-50 text-red-500 font-medium text-sm rounded-xl hover:bg-red-100 transition-colors active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete game
          </button>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-stone-800 text-white text-sm font-medium rounded-full shadow-lg transition-all duration-300 ${
          copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        Link copied for {copied}
      </div>
    </>
  );
}
