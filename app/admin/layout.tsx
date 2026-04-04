import Link from "next/link";
import { AppNavLink } from "@/components/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-stone-900 px-6 py-4 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Admin Dashboard</h2>
            <p className="text-sm text-stone-400">Secure staff management area</p>
          </div>
          <nav className="flex flex-wrap gap-2 rounded-xl bg-stone-800 p-1">
            <AppNavLink href="/admin">Overview</AppNavLink>
            <AppNavLink href="/admin/bookings">Bookings</AppNavLink>
            <AppNavLink href="/admin/schedule">Schedule</AppNavLink>
            <AppNavLink href="/admin/staff">Staff Tools</AppNavLink>
          </nav>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}