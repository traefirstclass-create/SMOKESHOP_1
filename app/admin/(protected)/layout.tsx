import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  MapPinned,
  PackageCheck,
  Handshake,
  ScrollText,
  FileWarning,
} from "lucide-react";
import { requireStaff } from "@/lib/supabase/server-auth";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/state-registrations", label: "State Registrations", icon: MapPinned },
  { href: "/admin/pickup-orders", label: "Pickup Orders", icon: PackageCheck },
  { href: "/admin/trade-applications", label: "Trade Applications", icon: Handshake },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/content", label: "Content Check", icon: FileWarning },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <aside className="w-56 shrink-0">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-foreground/40">Signed in as</p>
          <p className="truncate text-sm font-medium">{staff.displayName || staff.email}</p>
          <p className="text-xs text-gold">{staff.role}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/70 transition hover:bg-surface hover:text-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <AdminSignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
