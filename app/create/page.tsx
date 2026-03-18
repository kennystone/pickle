"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

function getDefaults() {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  // Round up to the next hour
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  const time = nextHour.toTimeString().slice(0, 5);
  return { date, time };
}

function adjustTime(current: string, delta: number): string {
  const [h, m] = current.split(":").map(Number);
  const totalMinutes = h * 60 + m + delta;
  const clamped = Math.max(0, Math.min(23 * 60 + 30, totalMinutes));
  const newH = Math.floor(clamped / 60);
  const newM = clamped % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const defaults = getDefaults();
  const [form, setForm] = useState({
    date: defaults.date,
    time: defaults.time,
    place: "Pickle Athletics",
    people_needed: "5",
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
          <h1 className="text-2xl font-bold text-emerald-600">New Game</h1>
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
              className="w-full px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Time</label>
            <div className="inline-flex items-center border-2 border-stone-200 rounded-full bg-white overflow-hidden">
              <span className="px-5 py-3 text-base font-medium text-stone-800">
                {(() => {
                  const [h, m] = form.time.split(":").map(Number);
                  const d = new Date();
                  d.setHours(h, m);
                  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                })()}
              </span>
              <div className="flex border-l-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => set("time", adjustTime(form.time, -30))}
                  className="px-4 py-3 text-stone-600 font-bold text-lg hover:bg-stone-50 transition-colors"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => set("time", adjustTime(form.time, 30))}
                  className="px-4 py-3 text-stone-600 font-bold text-lg hover:bg-stone-50 transition-colors border-l-2 border-stone-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Place</label>
            <input
              type="text"
              required
              value={form.place}
              onChange={(e) => set("place", e.target.value)}
              placeholder="e.g. Riverside Courts"
              className="w-full px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Players needed</label>
            <div className="inline-flex items-center border-2 border-stone-200 rounded-full bg-white overflow-hidden">
              <span className="px-5 py-3 text-base font-medium text-stone-800 min-w-[3rem] text-center">
                {form.people_needed}
              </span>
              <div className="flex border-l-2 border-stone-200">
                <button
                  type="button"
                  onClick={() => set("people_needed", String(Math.max(2, parseInt(form.people_needed) - 1)))}
                  className="px-4 py-3 text-stone-600 font-bold text-lg hover:bg-stone-50 transition-colors"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => set("people_needed", String(Math.min(24, parseInt(form.people_needed) + 1)))}
                  className="px-4 py-3 text-stone-600 font-bold text-lg hover:bg-stone-50 transition-colors border-l-2 border-stone-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl disabled:opacity-50 active:scale-95 transition-transform mt-2"
          >
            {loading ? "Creating..." : "Create Game 🥒"}
          </button>
        </form>
      </div>
    </div>
  );
}
