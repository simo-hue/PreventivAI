"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileAudio,
  Loader2,
  Sparkles,
  Upload,
  CheckCircle2,
  XCircle,
  Search,
  Layers,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { DEMO_BRIEF_TEXT } from "@/src/lib/demo/sample-analysis";
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

export function RequestForm() {
  const router = useRouter();
  const [title, setTitle] = useState("MVP delivery cibo per animali");
  const [requestText, setRequestText] = useState(DEMO_BRIEF_TEXT);
  const [audioTranscript, setAudioTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stati per il caricamento progressivo deterministico
  const [progress, setProgress] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<
    ("pending" | "loading" | "completed" | "error")[]
  >(["pending", "pending", "pending", "pending", "pending"]);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const activeStepRef = useRef(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      setStepStatuses(["pending", "pending", "pending", "pending", "pending"]);
      setAnalyzeError(null);
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

        // Aggiorna lo stato di avanzamento degli step con pause visive ("checkmark")
        setStepStatuses(() => {
          const statuses: ("pending" | "loading" | "completed" | "error")[] = [
            "pending",
            "pending",
            "pending",
            "pending",
            "pending",
          ];

          // Step 0: Ingestione
          if (currentProgress < 15) {
            statuses[0] = "loading";
          } else {
            statuses[0] = "completed";
          }

          // Step 1: Analisi
          if (currentProgress >= 20) {
            if (currentProgress < 40) {
              statuses[1] = "loading";
            } else {
              statuses[1] = "completed";
            }
          }

          // Step 2: Generazione
          if (currentProgress >= 45) {
            if (currentProgress < 65) {
              statuses[2] = "loading";
            } else {
              statuses[2] = "completed";
            }
          }

          // Step 3: Calcolo
          if (currentProgress >= 70) {
            if (currentProgress < 85) {
              statuses[3] = "loading";
            } else {
              statuses[3] = "completed";
            }
          }

          // Step 4: Finalizzazione
          if (currentProgress >= 90) {
            statuses[4] = "loading";
          }

          // Trova lo step attivo da salvare per eventuale gestione errori o fast-forward
          const loadingIdx = statuses.indexOf("loading");
          if (loadingIdx !== -1) {
            activeStepRef.current = loadingIdx;
          } else {
            const lastCompletedIdx = statuses.lastIndexOf("completed");
            if (lastCompletedIdx !== -1) {
              activeStepRef.current = lastCompletedIdx;
            }
          }

          return statuses;
        });
      }
    }, 210); // ~20 secondi totali per raggiungere il 95% (95 * 210ms = 19950ms)

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  async function fastForwardAndRedirect(requestId: string) {
    const current = activeStepRef.current;
    
    // Avanzamento rapido degli step rimanenti per gratificazione visiva
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

    // Breve pausa per visualizzare il successo
    await new Promise((resolve) => setTimeout(resolve, 800));

    router.push(`/admin/requests/${requestId}`);
  }

  async function handleAnalyze() {
    setError(null);
    setAnalyzeError(null);
    setIsAnalyzing(true);

    try {
      const textToAnalyze = audioTranscript
        ? `${requestText}\n\nTranscript audio:\n${audioTranscript}`
        : requestText;
      const createResponse = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          rawText: textToAnalyze,
          sourceType: audioTranscript ? "mixed" : "text",
          isManualCreation: true,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Creazione richiesta non riuscita.");
      }

      const created = (await createResponse.json()) as {
        id: string;
        createdAt: string;
      };
      const analyzeResponse = await fetch(`/api/requests/${created.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestText: textToAnalyze }),
      });

      if (!analyzeResponse.ok) {
        const payload = (await analyzeResponse.json()) as { error?: string };
        throw new Error(payload.error ?? "Analisi non riuscita.");
      }

      await fastForwardAndRedirect(created.id);
    } catch (caught) {
      const errMsg = caught instanceof Error ? caught.message : "Errore inatteso.";
      setError(errMsg);
      setAnalyzeError(errMsg);
      setStepStatuses((prev) => {
        const next = [...prev];
        const activeIdx = next.indexOf("loading");
        if (activeIdx !== -1) {
          next[activeIdx] = "error";
        } else {
          next[activeStepRef.current] = "error";
        }
        return next;
      });
    }
  }

  async function handleAudioUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Trascrizione non riuscita.");
      }

      const payload = (await response.json()) as { transcript: string };
      setAudioTranscript(payload.transcript);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Errore inatteso.");
    } finally {
      setIsTranscribing(false);
    }
  }

  return (
    <div className="space-y-5">
      {error ? (
        <Alert title="Errore" variant="danger">
          {error}
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-5">
          <div>
            <label className="text-sm font-semibold" htmlFor="request-title">
              Titolo richiesta
            </label>
            <input
              id="request-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-[var(--border)] px-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="request-text">
              Testo cliente
            </label>
            <textarea
              id="request-text"
              value={requestText}
              onChange={(event) => setRequestText(event.target.value)}
              className="mt-2 min-h-72 w-full rounded-md border border-[var(--border)] px-3 py-3 text-sm leading-6"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || requestText.trim().length < 20}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            Genera analisi
          </Button>
        </div>

        <aside className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-5">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <FileAudio className="size-4" aria-hidden="true" />
              Audio intake
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Carica mp3, wav o m4a.
            </p>
          </div>

          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-4 text-center text-sm font-semibold text-slate-700">
            {isTranscribing ? (
              <Loader2 className="mb-2 size-6 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="mb-2 size-6" aria-hidden="true" />
            )}
            {isTranscribing ? "Trascrizione in corso" : "Carica audio"}
            <input
              type="file"
              accept=".m4a,.mp3,.wav,audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/m4a"
              className="sr-only"
              disabled={isTranscribing}
              onChange={(event) => handleAudioUpload(event.target.files?.[0])}
            />
          </label>

          {audioTranscript ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-[var(--success)] dark:border-emerald-900 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                <span className="font-medium">Audio trascritto con successo!</span>
              </div>
              <p className="mt-1 text-xs opacity-90">
                La trascrizione verrà automaticamente inclusa nell'analisi.
              </p>
            </div>
          ) : null}
        </aside>
      </div>

      {/* Modal Overlay per lo stato di avanzamento della generazione */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 dark:bg-cyan-950/30">
                <Sparkles className="h-7 w-7 animate-pulse text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                Generazione Preventivo
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                L'intelligenza artificiale sta analizzando i requisiti per formulare scenari e stime di costo precise.
              </p>
            </div>

            {/* Barra di progresso */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--muted)]">Stato elaborazione</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{progress}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 dark:from-cyan-500 dark:to-cyan-300 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Lista degli step deterministici */}
            <div className="relative mt-8 space-y-5">
              {/* Linea verticale di connessione timeline */}
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
                    {/* Cerchio dello step */}
                    <div
                      className={cn(
                        "z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                        isCompleted && "border-emerald-200 bg-emerald-50 text-[var(--success)] dark:border-emerald-950 dark:bg-emerald-950/20",
                        isLoading && "border-cyan-200 bg-cyan-50 text-cyan-600 dark:text-cyan-400 animate-pulse dark:border-cyan-950 dark:bg-cyan-950/20",
                        isError && "border-rose-200 bg-rose-50 text-[var(--danger)] dark:border-rose-950 dark:bg-rose-950/20",
                        isPending && "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900"
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

                    {/* Testi descrittivi */}
                    <div className="min-w-0 flex-1 pt-1">
                      <h3
                        className={cn(
                          "text-sm font-semibold transition-colors duration-300",
                          isCompleted && "text-slate-800 dark:text-slate-200",
                          isLoading && "text-cyan-600 dark:text-cyan-400 font-bold",
                          isError && "text-[var(--danger)]",
                          isPending && "text-slate-400 dark:text-slate-600"
                        )}
                      >
                        {step.title}
                      </h3>
                      {isLoading && (
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {step.description}
                        </p>
                      )}
                      {isError && analyzeError && (
                        <p className="mt-1 text-xs leading-5 text-[var(--danger)]">
                          {analyzeError}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottone per uscire in caso di errore */}
            {stepStatuses.includes("error") && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => {
                    setIsAnalyzing(false);
                    setAnalyzeError(null);
                  }}
                  className="bg-[var(--danger)] hover:bg-rose-700 text-white transition-colors"
                >
                  Chiudi e riprova
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
