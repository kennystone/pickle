"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";
import type { Attendee } from "@/lib/database.types";

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
}: {
  initialAttendees: Attendee[];
  gameId: string;
  peopleNeeded: number;
}) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);

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
      {/* Count header */}
      <div className="text-center">
        <div className="text-4xl font-bold text-pickle-green">
          {count} <span className="text-stone-400 font-normal text-2xl">/ {peopleNeeded}</span>
        </div>
        <div className="text-stone-500 text-sm mt-1">players confirmed</div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-pickle-green transition-all duration-500 rounded-full"
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {isFull && (
        <div className="bg-ball-yellow text-pickle-dark font-bold text-center py-2 px-4 rounded-xl text-sm">
          🎉 Game is full! See you on the court!
        </div>
      )}

      {/* Attendee list */}
      {attendees.length > 0 ? (
        <ul className="space-y-2">
          {attendees.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-100 animate-fade-slide-up"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🥒</span>
                <span className="font-medium">{a.name}</span>
              </div>
              <span className="text-xs text-stone-400">{timeAgo(a.created_at)}</span>
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
