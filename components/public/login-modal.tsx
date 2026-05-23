"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function LoginModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        throw new Error("Supabase non configurato nel browser.");
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error("Email o password non validi.");
      }

      const user = signInData?.user;
      if (!user?.id) throw new Error("Login non riuscito (ID non trovato).");

      await new Promise(r => setTimeout(r, 500));

      // Redirect to the customer personal page
      router.push(`/customer/${user.id}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa e' andato storto.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Area Utente</h2>
            <p className="mt-2 text-sm text-slate-600">
              Accedi per visualizzare il tuo progetto e i preventivi.
            </p>
          </div>

          {error && (
            <div className="mt-4">
              <Alert title="Errore" variant="danger">
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting || !email || !password}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Accedi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
