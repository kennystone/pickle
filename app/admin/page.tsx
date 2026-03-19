import Link from "next/link";

const links = [
  { href: "/admin/create", label: "New Game", description: "Create a new pickleball game" },
  { href: "/admin/list", label: "Games", description: "View all games" },
  { href: "/admin/favorites", label: "Favorites", description: "Manage favorite players" },
];

export default function AdminIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      <div className="text-white px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-serif">Admin</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block bg-white rounded-2xl p-4 shadow-sm border border-stone-100 hover:border-emerald-300 transition-colors"
          >
            <div className="font-semibold text-stone-800">{link.label}</div>
            <div className="text-sm text-stone-500 mt-0.5">{link.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
