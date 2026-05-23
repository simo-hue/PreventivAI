"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Sparkles, XCircle, Search, Layers, DollarSign, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils/cn";

const STEPS = [
  {
    title: "Ingestione e Normalizzazione",
    description: "Estrazione del testo e normalizzazione dei requisiti...",
    icon: Sparkles,
  },
  {
    title: "Analisi Requisiti & Ricerca",
    description: "Ricerca di pattern e progetti storici simili nel database...",
    icon: Search,
  },
  {
    title: "Generazione Moduli e Scenari",
    description: "Definizione degli scenari (Lean, Balanced, Premium) e stima dell'effort...",
    icon: Layers,
  },
  {
    title: "Calcolo Costi & Rate Card",
    description: "Applicazione delle tariffe professionali e calcolo PM...",
    icon: DollarSign,
  },
  {
    title: "Finalizzazione Preventivo",
    description: "Generazione finale degli scenari e validazione dei modelli...",
    icon: ShieldCheck,
  },
];

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<
    ("pending" | "loading" | "completed" | "error")[]
  >(["pending", "pending", "pending", "pending", "pending"]);
  const activeStepRef = useRef(0);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setStepStatuses(["pending", "pending", "pending", "pending", "pending"]);
      activeStepRef.current = 0;
      return;
    }

    setStepStatuses(["loading", "pending", "pending", "pending", "pending"]);
    setProgress(0);
    activeStepRef.current = 0;

    let currentProgress = 0;

    const interval = setInterval(() => {
      if (currentProgress < 95) {
        currentProgress += 1;
        setProgress(currentProgress);

        setStepStatuses(() => {
          const statuses: ("pending" | "loading" | "completed" | "error")[] = [
            "pending", "pending", "pending", "pending", "pending",
          ];

          if (currentProgress < 15) statuses[0] = "loading";
          else statuses[0] = "completed";

          if (currentProgress >= 20) {
            if (currentProgress < 40) statuses[1] = "loading";
            else statuses[1] = "completed";
          }
          if (currentProgress >= 45) {
            if (currentProgress < 65) statuses[2] = "loading";
            else statuses[2] = "completed";
          }
          if (currentProgress >= 70) {
            if (currentProgress < 85) statuses[3] = "loading";
            else statuses[3] = "completed";
          }
          if (currentProgress >= 90) {
            statuses[4] = "loading";
          }

          const loadingIdx = statuses.indexOf("loading");
          if (loadingIdx !== -1) {
            activeStepRef.current = loadingIdx;
          } else {
            const lastCompletedIdx = statuses.lastIndexOf("completed");
            if (lastCompletedIdx !== -1) activeStepRef.current = lastCompletedIdx;
          }

          return statuses;
        });
      }
    }, 210);

    return () => clearInterval(interval);
  }, [isGenerating]);

  async function fastForwardAndRedirect(requestId: string) {
    const current = activeStepRef.current;
    
    for (let s = current; s < 5; s++) {
      setStepStatuses((prev) => {
        const next = [...prev];
        if (s > 0) next[s - 1] = "completed";
        next[s] = "loading";
        return next;
      });
      setProgress(Math.min(100, (s + 1) * 20));
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    setStepStatuses((prev) => prev.map(() => "completed"));
    setProgress(100);

    await new Promise((resolve) => setTimeout(resolve, 800));

    router.push(`/requests/${requestId}`);
  }

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

      // 1. SignUp user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: companyName, // Use company name as fallback full_name
          }
        }
      });

      if (authError) throw new Error(authError.message);

      // We wait for the session to be established on client
      await new Promise(r => setTimeout(r, 1000));
      
      setIsSubmitting(false);
      setIsGenerating(true);

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

      const created = await createResponse.json();

      // 3. Analyze to generate quotes
      const analyzeResponse = await fetch(`/api/requests/${created.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText: projectDescription }),
      });

      if (!analyzeResponse.ok) {
        const payload = await analyzeResponse.json();
        throw new Error(payload.error || "Errore nell'analisi della richiesta.");
      }

      // 4. Fast forward animations and redirect
      await fastForwardAndRedirect(created.id);

    } catch (err: any) {
      setError(err.message || "Qualcosa e' andato storto.");
      setIsSubmitting(false);
      
      if (isGenerating) {
        setStepStatuses((prev) => {
          const next = [...prev];
          const activeIdx = next.indexOf("loading");
          if (activeIdx !== -1) next[activeIdx] = "error";
          else next[activeStepRef.current] = "error";
          return next;
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        
        {isGenerating ? (
          <div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 dark:bg-cyan-950/30">
                <Sparkles className="h-7 w-7 animate-pulse text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                Generazione Preventivo
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Stiamo analizzando la tua richiesta per formulare il preventivo.
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--muted)]">Stato elaborazione</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{progress}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="relative mt-8 space-y-5">
              <div className="absolute bottom-2 left-4.5 top-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
              {STEPS.map((step, idx) => {
                const status = stepStatuses[idx];
                const Icon = step.icon;
                const isCompleted = status === "completed";
                const isLoading = status === "loading";
                const isError = status === "error";
                const isPending = status === "pending";

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={cn(
                        "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                        isCompleted && "border-emerald-200 bg-emerald-50 text-[var(--success)]",
                        isLoading && "border-cyan-200 bg-cyan-50 text-cyan-600 animate-pulse",
                        isError && "border-rose-200 bg-rose-50 text-[var(--danger)]",
                        isPending && "border-slate-200 bg-white text-slate-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                      ) : isError ? (
                        <XCircle className="h-5 w-5" />
                      ) : isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Icon className="h-4.5 w-4.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <h3
                        className={cn(
                          "text-sm font-semibold transition-colors duration-300",
                          isCompleted && "text-slate-800",
                          isLoading && "text-cyan-600 font-bold",
                          isError && "text-[var(--danger)]",
                          isPending && "text-slate-400"
                        )}
                      >
                        {step.title}
                      </h3>
                      {isLoading && (
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {step.description}
                        </p>
                      )}
                      {isError && error && (
                        <p className="mt-1 text-xs leading-5 text-[var(--danger)]">
                          {error}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {stepStatuses.includes("error") && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setIsGenerating(false)} className="bg-[var(--danger)] text-white">
                  Chiudi e riprova
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Crea il tuo account</h2>
              <p className="mt-2 text-sm text-slate-600">
                Per salvare e gestire il tuo preventivo in futuro.
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
                  Crea e genera
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
