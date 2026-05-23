import { LogIn } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white p-8 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-lg bg-[var(--surface-strong)] text-[var(--primary)]">
          <LogIn className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Italians quote it better</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          In demo mode l'accesso e' simulato. Configura Supabase Auth per usare
          login reale e RLS in produzione.
        </p>
        <ButtonLink href="/admin/requests" className="mt-6 w-full">
          Entra in demo
        </ButtonLink>
      </section>
    </main>
  );
}
