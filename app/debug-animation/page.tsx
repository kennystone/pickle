"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PickleballAnimation from "@/components/PickleballAnimation";

const FAKE_PLAYERS = ["Alice", "Bob", "Charlie"];
const AUTO_INTERVAL = 10_000;

export default function DebugAnimationPage() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_INTERVAL / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const trigger = useCallback(() => {
    setShowAnimation(true);
    // Reset countdown
    setCountdown(AUTO_INTERVAL / 1000);
  }, []);

  const onDone = useCallback(() => {
    setShowAnimation(false);
  }, []);

  useEffect(() => {
    // Auto-trigger every 10s
    intervalRef.current = setInterval(trigger, AUTO_INTERVAL);
    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? AUTO_INTERVAL / 1000 : c - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [trigger]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      {/* Debug bar */}
      <div className="bg-yellow-400 text-yellow-900 text-sm font-mono px-4 py-2 flex items-center justify-between">
        <span>DEBUG — Animation preview</span>
        <div className="flex items-center gap-4">
          <span>Auto-trigger in {countdown}s</span>
          <button
            onClick={trigger}
            className="bg-yellow-900 text-yellow-100 px-3 py-1 rounded text-xs font-bold hover:bg-yellow-800"
          >
            Trigger Now
          </button>
        </div>
      </div>

      {/* Mock header */}
      <div className="text-white px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-serif">Kenny&apos;s Game</h1>
          <div className="mt-3 inline-flex items-center gap-2 text-base bg-white/15 rounded-full px-5 py-2">
            <span>Wednesday 3/18 · 6:00 PM @ Mock Courts</span>
          </div>
        </div>
      </div>

      {/* Mock body */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Mock RSVP card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="font-semibold text-stone-700 mb-3">Are you coming?</h2>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Your name"
              disabled
            />
            <button
              className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
              disabled
            >
              I&apos;m in!
            </button>
          </div>
        </div>

        {/* Mock attendee list */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <h2 className="font-semibold text-stone-700 mb-4">Who&apos;s in</h2>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>{FAKE_PLAYERS.length} confirmed</span>
              <span>8 needed</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(FAKE_PLAYERS.length / 8) * 100}%` }}
              />
            </div>
          </div>

          <ul className="space-y-2">
            {FAKE_PLAYERS.map((name) => (
              <li
                key={name}
                className="flex items-center gap-3 py-2 px-3 rounded-lg bg-stone-50"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {name[0]}
                </div>
                <span className="text-stone-700 text-sm">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showAnimation && <PickleballAnimation onDone={onDone} />}
    </div>
  );
}
