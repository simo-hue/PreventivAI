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
      // e per gestire in modo trasparente gli utenti esistenti, proviamo PRIMA il login.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      let user = signInData?.user;

      // Se il login fallisce per credenziali non valide (Invalid login credentials), 
      // significa che l'utente non esiste (oppure ha sbagliato password, ma nel form di 
      // "Crea account" è più probabile che sia un nuovo utente).
      if (signInError && signInError.message.includes("Invalid login")) {
        // 1. Procediamo a creare un nuovo account
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
          if (authError.message.includes("Password should be at least")) {
            throw new Error("La password è troppo debole. Inserisci almeno 6 caratteri.");
          }
          throw new Error(authError.message);
        }

        // Se authError è nullo ma anche user è nullo, significa che l'email esiste già!
        if (!authData.user) {
          throw new Error("Esiste già un account con questa email, ma la password inserita è errata.");
        }
        
        user = authData.user;
      } else if (signInError) {
        // Altri errori di login (es. problemi di rete, email non confermata)
        throw new Error(signInError.message);
      }

      if (!user?.id) throw new Error("Registrazione non riuscita (ID non trovato).");

      // Attendiamo che la sessione sia stabilita sul client
      await new Promise(r => setTimeout(r, 1000));

      // 3. Creazione della richiesta
      const createResponse = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: companyName,
          rawText: projectDescription,
          sourceType: "text",
          customerId: user.id,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Errore durante il salvataggio della richiesta.");
      }

      const created = await createResponse.json();

      // Avvia l'analisi in background senza bloccare l'utente (fire-and-forget)
      fetch(`/api/requests/${created.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText: projectDescription }),
      }).catch(console.error);

      // 4. Redirect alla pagina personale del cliente
      router.push(`/customer/${user.id}`);
      
      // Non reimpostiamo isSubmitting a false per mantenere il loader attivo durante il redirect
    } catch (err) {
      const message = err instanceof Error ? err.message : "Qualcosa è andato storto.";
      setError(message);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
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
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors shadow-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors shadow-xs"
              />
            </div>
            
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !email || !password}
              >
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
