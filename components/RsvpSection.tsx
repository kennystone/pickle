"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import AttendeeForm from "./AttendeeForm";

export default function RsvpSection({ gameId, defaultName, isFull, children }: { gameId: string; defaultName?: string; isFull?: boolean; children?: ReactNode }) {
  const [name, setName] = useState(defaultName);

  return (
    <>
      {!isFull && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <AttendeeForm
            gameId={gameId}
            defaultName={name}
            onClearName={() => setName(undefined)}
          />
        </div>
      )}

      {children}

      {!isFull && name && (
        <Link
          href="/contact"
          className="block mx-auto text-xs text-stone-200 underline hover:text-stone-100 transition-colors text-center"
        >
          I&apos;m not {name}
        </Link>
      )}
    </>
  );
}
