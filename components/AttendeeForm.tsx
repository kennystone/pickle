"use client";

import { useState, FormEvent } from "react";
import PickleballAnimation from "./PickleballAnimation";

export default function AttendeeForm({ gameId, defaultName, onClearName }: { gameId: string; defaultName?: string; onClearName?: () => void }) {
  const [name, setName] = useState(defaultName ?? "");
  const [knownName, setKnownName] = useState(!!defaultName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [showDeclineAnimation, setShowDeclineAnimation] = useState(false);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/attendees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: gameId, name: name.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      setAttendeeId(data.id);
      setShowAnimation(true);
      setSubmitted(true);
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: "Something went wrong" }));
      setError(msg || "Something went wrong");
      setLoading(false);
    }
  }

  async function handleRemove() {
    if (!attendeeId) return;
    setRemoving(true);

    const res = await fetch("/api/attendees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: attendeeId }),
    });

    if (res.ok) {
      setSubmitted(false);
      setAttendeeId(null);
      setName("");
      setKnownName(false);
      setLoading(false);
      onClearName?.();
    } else {
      setError("Failed to remove. Try again.");
    }
    setRemoving(false);
  }

  if (declined && !showDeclineAnimation) {
    return (
      <div className="text-center py-2">
        <span className="text-stone-400 text-lg">Maybe next time!</span>
      </div>
    );
  }

  if (submitted && !showAnimation) {
    return (
      <div className="bg-emerald-600/10 border-2 border-emerald-600 rounded-xl px-4 py-4 text-center space-y-3">
        <span className="text-emerald-600 font-semibold text-lg block">
          You&apos;re confirmed, {name}! 🥒
        </span>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          {removing ? "Removing..." : "Can't make it? Leave"}
        </button>
      </div>
    );
  }

  // Known name flow: show greeting + confirm/deny buttons
  if (knownName && name) {
    return (
      <>
        {showAnimation && (
          <PickleballAnimation onDone={() => setShowAnimation(false)} />
        )}
        {showDeclineAnimation && (
          <PickleballAnimation variant="decline" onDone={() => setShowDeclineAnimation(false)} />
        )}

        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-stone-700">
            {name}, can you make it?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? "..." : "I'm In!"}
            </button>
            <button
              onClick={() => { setDeclined(true); setShowDeclineAnimation(true); }}
              disabled={loading}
              className="px-6 py-3 bg-stone-100 text-stone-500 font-medium rounded-xl active:scale-95 transition-transform"
            >
              Not this time
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
      </>
    );
  }

  // Default flow: name input
  return (
    <>
      {showAnimation && (
        <PickleballAnimation onDone={() => setShowAnimation(false)} />
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={50}
          className="flex-1 px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
          autoComplete="given-name"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-transform whitespace-nowrap"
        >
          {loading ? "..." : "I'm In!"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
    </>
  );
}
