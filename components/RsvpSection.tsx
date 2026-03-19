"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import AttendeeForm from "./AttendeeForm";

export default function RsvpSection({ gameId, defaultName, whenWhere, children }: { gameId: string; defaultName?: string; whenWhere?: string; children?: ReactNode }) {
  const [name, setName] = useState(defaultName);

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        {whenWhere && (
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 text-base text-white bg-emerald-600 rounded-full px-5 py-2">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 1200 1200" fill="currentColor">
                <path d="m600 120c-206.24 0-374.03 167.79-374.03 374.03 0 105.64 33.938 206.24 103.77 307.57 59.051 85.691 133.52 157.4 199.23 220.69 17.879 17.219 34.766 33.48 50.496 49.211 5.4492 5.4492 12.828 8.5078 20.531 8.5078s15.086-3.0586 20.531-8.5078c16.68-16.68 34.246-33.613 52.848-51.539 133.96-129.11 300.66-289.79 300.66-525.94 0-206.24-167.79-374.03-374.03-374.03zm0 615.61c-133.21 0-241.59-108.37-241.59-241.59 0-133.21 108.37-241.59 241.59-241.59 133.21 0 241.59 108.37 241.59 241.59 0 133.21-108.37 241.59-241.59 241.59zm0-425.1c-101.2 0-183.52 82.32-183.52 183.52 0 101.2 82.32 183.52 183.52 183.52s183.52-82.32 183.52-183.52c0-101.2-82.32-183.52-183.52-183.52zm92.734 237.11c-5.375 9.3125-15.133 14.508-25.164 14.508-4.9336 0-9.9258-1.2617-14.496-3.8984l-67.598-39.059c-8.9766-5.1836-14.508-14.773-14.508-25.141v-105.35c0-16.031 12.996-29.027 29.027-29.027s29.027 12.996 29.027 29.027v88.586l53.09 30.684c13.883 8.0273 18.637 25.777 10.609 39.66z"/>
              </svg>
              <span>{whenWhere}</span>
            </div>
          </div>
        )}
        <AttendeeForm
          gameId={gameId}
          defaultName={name}
          onClearName={() => setName(undefined)}
        />
      </div>

      {children}

      {name && (
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
