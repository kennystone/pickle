"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/create");
    } else {
      setError("Wrong password. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🥒</div>
          <h1 className="text-2xl font-bold text-pickle-green">Kenny Pickle</h1>
          <p className="text-stone-500 mt-1 text-sm">Game organizer login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 text-lg border-2 border-stone-200 rounded-xl focus:outline-none focus:border-pickle-green bg-white"
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 px-6 bg-pickle-green text-white font-semibold text-lg rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? "Checking..." : "Enter 🥒"}
          </button>
        </form>
      </div>
    </div>
  );
}
