"use client";

import { useState, FormEvent } from "react";
import PickleballAnimation from "./PickleballAnimation";

export default function AttendeeForm({ gameId }: { gameId: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/attendees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: gameId, name: name.trim() }),
    });

    if (res.ok) {
      setShowAnimation(true);
      setSubmitted(true);
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: "Something went wrong" }));
      setError(msg || "Something went wrong");
      setLoading(false);
    }
  }

  if (submitted && !showAnimation) {
    return (
      <div className="bg-pickle-green/10 border-2 border-pickle-green rounded-xl px-4 py-4 text-center">
        <span className="text-pickle-green font-semibold text-lg">
          You&apos;re confirmed, {name}! 🥒
        </span>
      </div>
    );
  }

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
          className="flex-1 px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-pickle-green bg-white"
          autoComplete="given-name"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-5 py-3 bg-pickle-green text-white font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-transform whitespace-nowrap"
        >
          {loading ? "..." : "I&apos;m In!"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
    </>
  );
}
