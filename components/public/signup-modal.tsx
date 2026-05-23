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

      // 1. Proviamo a registrare l'utente come flusso principale
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: companyName,
          }
        }
      });

      let user = authData?.user;

      // 2. Gestione utente già esistente
      // Supabase (con conferme email abilitate o meno) restituisce identities: [] se l'email è già in uso
      const userAlreadyExists = user && user.identities && user.identities.length === 0;
      const userAlreadyRegisteredError = authError && authError.message.toLowerCase().includes("already registered");

      if (userAlreadyExists || userAlreadyRegisteredError) {
        // Fallback: proviamo ad autenticare l'utente esistente
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw new Error("Esiste già un account con questa email, ma la password è errata.");
        }
        
        user = signInData.user;
      } else if (authError) {
        // Gestione di altri errori di registrazione (es. password debole, email non valida)
        if (authError.message.includes("rate limit")) {
          throw new Error("Hai effettuato troppe richieste. Attendi qualche minuto prima di riprovare.");
        }
        // Traduciamo alcuni messaggi di errore comuni di Supabase per l'utente
        if (authError.message.includes("Password should be at least")) {
          throw new Error("La password è troppo debole. Inserisci almeno 6 caratteri.");
        }
        throw new Error(authError.message);
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
        const payload = await createResponse.json();
        throw new Error(payload.error || "Errore nella creazione della richiesta.");
      }

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
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Crea il tuo account</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-500 transition-colors shadow-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-500 transition-colors shadow-xs"
              />
            </div>
            
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !email || !password}
                className="dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
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
