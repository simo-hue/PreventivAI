import Link from "next/link";
import { FileText, History, Settings, Table2 } from "lucide-react";
import { requireUser } from "@/src/lib/auth/require-user";

const navItems = [
  { href: "/requests", label: "Richieste", icon: FileText },
  { href: "/admin/rate-card", label: "Tariffe", icon: Table2 },
  { href: "/admin/history", label: "Cronologia", icon: History },
  { href: "/admin/settings", label: "Impostazioni", icon: Settings },
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[var(--border)] bg-[var(--surface-strong)] lg:block">
        <div className="flex h-20 items-center border-b border-[var(--border)] px-5">
          <Link href="/requests" className="flex items-center gap-2 text-lg font-bold text-[var(--primary)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="PreventivAI Logo" className="h-14 w-auto object-contain" />
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-white hover:text-[var(--primary)] hover:shadow-sm"
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-white/80 backdrop-blur-md">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/requests" className="flex items-center gap-2 font-bold text-[var(--primary)] lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="PreventivAI Logo" className="h-14 w-auto object-contain" />
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
