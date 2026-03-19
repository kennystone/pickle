"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/create", label: "New Game" },
  { href: "/admin/list", label: "Games" },
  { href: "/admin/favorites", label: "Favorites" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center gap-1 px-4 pt-4 pb-2">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active
                ? "bg-white text-teal-900"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
