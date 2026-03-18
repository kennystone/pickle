"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    date: "",
    time: "",
    place: "",
    people_needed: "8",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        time: form.time,
        place: form.place,
        people_needed: parseInt(form.people_needed),
      }),
    });

    if (res.ok) {
      const { slug } = await res.json();
      router.push(`/${slug}`);
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: "Failed to create game" }));
      setError(msg || "Failed to create game");
      setLoading(false);
    }
  }

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🥒🏓</div>
          <h1 className="text-2xl font-bold text-pickle-green">New Game</h1>
          <p className="text-stone-500 text-sm mt-1">Set up your pickleball game</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-pickle-green bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Time</label>
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-pickle-green bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Place</label>
            <input
              type="text"
              required
              value={form.place}
              onChange={(e) => set("place", e.target.value)}
              placeholder="e.g. Riverside Courts"
              className="w-full px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-pickle-green bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Players needed</label>
            <input
              type="number"
              required
              min={2}
              max={24}
              value={form.people_needed}
              onChange={(e) => set("people_needed", e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-pickle-green bg-white"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-pickle-green text-white font-bold text-lg rounded-xl disabled:opacity-50 active:scale-95 transition-transform mt-2"
          >
            {loading ? "Creating..." : "Create Game 🥒"}
          </button>
        </form>
      </div>
    </div>
  );
}
