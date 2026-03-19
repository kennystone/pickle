"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { Attendee } from "@/lib/database.types";
import PlayerIcon from "./PlayerIcon";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AttendeeList({
  initialAttendees,
  gameId,
  peopleNeeded,
  viewerName,
}: {
  initialAttendees: Attendee[];
  gameId: string;
  peopleNeeded: number;
  viewerName?: string;
}) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setRemovingId(id);
    const res = await fetch("/api/attendees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setAttendees((prev) => prev.filter((a) => a.id !== id));
    }
    setRemovingId(null);
  }

  useEffect(() => {
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel(`attendees-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "attendees",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setAttendees((prev) => {
            const exists = prev.some((a) => a.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new as Attendee];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "attendees",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setAttendees((prev) => prev.filter((a) => a.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const count = attendees.length;
  const isFull = count >= peopleNeeded;
  const fillPercent = Math.min((count / peopleNeeded) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Progress bar with count */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">{count}/{peopleNeeded}</span>
      </div>

      {isFull && (
        <div className="bg-ball-yellow text-pickle-dark font-bold text-center py-2 px-4 rounded-xl text-sm">
          🎉 Game is full! See you on the court!
        </div>
      )}

      {/* Attendee list */}
      {attendees.length > 0 ? (
        <ul className="space-y-2">
          {attendees.map((a, i) => (
            <li
              key={a.id}
              className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-100 animate-fade-slide-up"
            >
              <div className="flex items-center gap-2">
                <PlayerIcon index={i} gameId={gameId} playerName={a.name} />
                <span className="font-medium">{a.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">{timeAgo(a.created_at)}</span>
                {viewerName && a.name.toLowerCase() === viewerName.toLowerCase() && (
                  <button
                    onClick={() => handleRemove(a.id)}
                    disabled={removingId === a.id}
                    className="text-stone-300 hover:text-red-500 transition-colors text-lg leading-none"
                    title={`Remove ${a.name}`}
                  >
                    {removingId === a.id ? "..." : "\u00d7"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-stone-400 py-4">
          No one yet — be the first! 🏓
        </p>
      )}
    </div>
  );
}
