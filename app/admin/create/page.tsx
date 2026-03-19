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
      const { id } = await res.json();
      router.push(`/admin/game/${id}`);
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
          <svg className="w-20 h-20 mx-auto mb-2" viewBox="0 0 1200 1200" fill="#10b981">
            <path d="m502.69 727.31c-7.8281 0-15.609-3.2344-21.188-9.6094-10.219-11.672-9.0469-29.484 2.625-39.703l134.81-117.94c11.672-10.219 29.438-9.0469 39.656 2.625s9.0469 29.484-2.6719 39.703l-134.81 117.94c-5.3438 4.6875-11.953 6.9375-18.516 6.9375z"/>
            <path d="m214.26 687.94c-4.9219 0-9.9375-1.3125-14.484-4.0312-13.312-8.0156-17.578-25.312-9.5625-38.625l216.94-359.81c6.0938-10.078 17.859-15.281 29.344-13.078 11.578 2.2031 20.531 11.391 22.453 23.016l8.5781 51.516 223.22-271.03c9.8906-12 27.609-13.734 39.609-3.8438s13.734 27.609 3.8438 39.609l-262.5 318.74c-6.9844 8.5312-18.375 12.141-28.969 9.2812-10.641-2.8594-18.656-11.672-20.484-22.547l-6.2344-37.406-177.61 294.61c-5.2969 8.7656-14.578 13.594-24.094 13.594z"/>
            <path d="m656.26 945.56c-9.6094 0-18.938-4.9219-24.188-13.781-7.9219-13.359-3.5156-30.609 9.8438-38.531l124.45-73.781-21.844-4.3594c-11.109-2.2031-19.781-10.875-22.031-21.938s2.3438-22.453 11.672-28.828l356.26-243.74c12.797-8.7656 30.281-5.4844 39.094 7.3125 8.7656 12.797 5.4844 30.328-7.3594 39.094l-301.18 206.06 28.312 5.6719c11.438 2.2969 20.25 11.391 22.219 22.875 1.9688 11.484-3.3281 22.969-13.406 28.922l-187.5 111.19c-4.5 2.6719-9.4219 3.9375-14.297 3.9375z"/>
            <path d="m487.5 590.63c-6.4688 0-12.984-2.2031-18.281-6.7969-11.812-10.125-13.172-27.844-3.0469-39.656l225-262.5c5.5312-6.4688 13.641-10.125 22.266-9.7969 8.5312 0.28125 16.453 4.4062 21.609 11.25l36.797 49.031 258.28-258.28c10.969-10.969 28.781-10.969 39.75 0s10.969 28.781 0 39.75l-281.26 281.26c-5.7656 5.7656-13.547 8.7656-21.891 8.1562-8.1094-0.5625-15.609-4.6406-20.531-11.156l-35.203-46.969-202.18 235.87c-5.5781 6.4688-13.453 9.8438-21.375 9.8438z"/>
            <path d="m637.5 759.37c-8.7188 0-17.25-4.0312-22.781-11.578-9.1406-12.562-6.375-30.141 6.1875-39.281l358.22-260.53-46.312-7.7344c-10.688-1.7812-19.406-9.5625-22.406-19.969s0.23438-21.609 8.3438-28.828l168.74-150c11.578-10.359 29.391-9.2812 39.703 2.3438s9.2812 29.391-2.3438 39.703l-124.78 110.91 54.469 9.0938c11.203 1.875 20.156 10.266 22.781 21.281 2.5781 11.016-1.6875 22.547-10.828 29.203l-412.5 300c-4.9688 3.6562-10.781 5.3906-16.5 5.3906z"/>
            <path d="m768.74 234.37c-7.2188 0-14.391-2.7656-19.875-8.25-10.969-10.969-10.969-28.781 0-39.75l112.5-112.5c10.969-10.969 28.781-10.969 39.75 0s10.969 28.781 0 39.75l-112.5 112.5c-5.4844 5.4844-12.703 8.25-19.875 8.25z"/>
            <path d="m332.72 1134.4c-147.28 0-267.1-119.81-267.1-267.1 0-147.28 119.81-267.1 267.1-267.1 147.28 0 267.1 119.81 267.1 267.1 0 147.28-119.81 267.1-267.1 267.1zm0-477.94c-116.25 0-210.84 94.594-210.84 210.84 0 116.25 94.594 210.84 210.84 210.84s210.84-94.594 210.84-210.84c0-116.25-94.594-210.84-210.84-210.84z"/>
            <path d="m370.22 867.28c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
            <path d="m370.22 722.06c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m232.13 822.42c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
            <path d="m284.86 984.74c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m455.58 984.74c0 50.016-75 50.016-75 0 0-49.969 75-49.969 75 0"/>
            <path d="m508.31 822.42c0 50.016-75 50.016-75 0s75-50.016 75 0"/>
          </svg>
          <h1 className="text-4xl font-bold text-emerald-600">New Game</h1>
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
