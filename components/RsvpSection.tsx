"use client";

import { useState, ReactNode } from "react";
import AttendeeForm from "./AttendeeForm";

export default function RsvpSection({ gameId, defaultName, children }: { gameId: string; defaultName?: string; children?: ReactNode }) {
  const [name, setName] = useState(defaultName);

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <AttendeeForm
          gameId={gameId}
          defaultName={name}
          onClearName={() => setName(undefined)}
        />
      </div>

      {children}

      {name && (
        <button
          onClick={() => setName(undefined)}
          className="block mx-auto text-xs text-stone-200 underline hover:text-stone-100 transition-colors"
        >
          I&apos;m not {name}
        </button>
      )}
    </>
  );
}
