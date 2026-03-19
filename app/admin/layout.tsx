import AdminTabs from "@/components/AdminTabs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-950 to-teal-700">
      <AdminTabs />
      {children}
    </div>
  );
}
