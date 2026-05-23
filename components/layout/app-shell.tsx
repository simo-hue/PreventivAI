import Link from "next/link";
import { FileText, History, Plus, Settings, Table2 } from "lucide-react";
import { requireUser } from "@/src/lib/auth/require-user";

const navItems = [
  { href: "/requests", label: "Requests", icon: FileText },
  { href: "/requests/new", label: "New request", icon: Plus },
  { href: "/admin/rate-card", label: "Rate card", icon: Table2 },
  { href: "/admin/history", label: "History", icon: History },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[var(--border)] bg-white lg:block">
        <div className="flex h-16 items-center border-b border-[var(--border)] px-5">
          <Link href="/requests" className="text-lg font-bold text-[var(--primary)]">
            PreventivAI
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-[var(--surface-strong)]"
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/requests" className="font-bold text-[var(--primary)] lg:hidden">
              PreventivAI
            </Link>
            <div className="hidden text-sm text-[var(--muted)] sm:block">
            </div>
            <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-slate-700">
              {user.email}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
