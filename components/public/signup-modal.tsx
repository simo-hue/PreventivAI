"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function SignupModal({
  isOpen,
  onClose,
  companyName,
  projectDescription,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  projectDescription: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignupAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      
      if (!supabase) {
        throw new Error("Supabase non configurato nel browser.");
      }

      // Per evitare il limite di rate di signUp (max 3/ora in dev locale su Supabase),
      // e per gestire chi ha già l'account in modo trasparente, proviamo PRIMA il login.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      let user = signInData?.user;

      // Se il login fallisce per credenziali non valide, significa che l'utente non esiste 
      // (oppure ha sbagliato password, ma in questo flusso di 'Registrazione' assumiamo non esista).
      if (signInError && signInError.message.includes("Invalid login")) {
        // 1. SignUp user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: companyName,
            }
          }
        });

        if (authError) {
          if (authError.message.includes("rate limit")) {
            throw new Error("Hai effettuato troppe richieste di registrazione. Attendi qualche minuto.");
          }
          throw new Error(authError.message);
        }
        
        user = authData.user;
      } else if (signInError) {
        // Altri errori di login (es. network)
        throw new Error(signInError.message);
      }

      if (!user?.id) throw new Error("Registrazione non riuscita (ID non trovato).");

      // We wait for the session to be established on client
      await new Promise(r => setTimeout(r, 1000));

      // 2. Create the request
      const createResponse = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: companyName,
          rawText: projectDescription,
          sourceType: "text",
        }),
      });

      if (!createResponse.ok) {
        const payload = await createResponse.json();
        throw new Error(payload.error || "Errore nella creazione della richiesta.");
      }

      // 3. Redirect to the customer personal page
      router.push(`/customer/${user.id}`);
      
      // Do NOT set isSubmitting to false here to keep the loader spinning while redirecting
    } catch (err: any) {
      setError(err.message || "Qualcosa e' andato storto.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crea il tuo account</h2>
            <p className="mt-2 text-sm text-slate-600">
              Per salvare la tua richiesta e ricevere il preventivo.
            </p>
          </div>

          {error && (
            <div className="mt-4">
              <Alert title="Errore" variant="danger">
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSignupAndSubmit} className="mt-6 space-y-4">
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
                minLength={6}
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
                Invia Progetto
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
