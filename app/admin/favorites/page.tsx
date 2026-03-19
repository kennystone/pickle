"use client";

import { useState, useEffect, FormEvent } from "react";

interface Favorite {
  id: string;
  name: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then(setFavorites);
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (res.ok) {
      const fav = await res.json();
      setFavorites((prev) => [...prev, fav].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: "Failed" }));
      setError(msg || "Failed to add");
    }
    setLoading(false);
  }

  async function handleRemove(id: string) {
    const res = await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      <div className="text-white px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif">Favorites</h1>
          <p className="text-white/60 text-sm mt-2">Manage your regular players</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add a player"
              maxLength={50}
              className="flex-1 px-4 py-3 text-base border-2 border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
            />
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
            >
              Add
            </button>
          </form>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <ul className="space-y-2">
            {favorites.map((fav) => (
              <li
                key={fav.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-stone-50"
              >
                <span className="text-stone-700">{fav.name}</span>
                <button
                  onClick={() => handleRemove(fav.id)}
                  className="text-sm text-red-400 hover:text-red-600 font-medium"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
