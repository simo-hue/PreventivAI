"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileAudio, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { DEMO_BRIEF_TEXT } from "@/src/lib/demo/sample-analysis";
import { upsertStoredRequest, type StoredRequest } from "@/src/lib/demo/storage";

type AnalyzeResponse = {
  requestId: string;
  quoteRunId: string;
  promptVersion: string;
  analysis: StoredRequest["analysis"];
};

export function RequestForm() {
  const router = useRouter();
  const [title, setTitle] = useState("MVP delivery cibo per animali");
  const [requestText, setRequestText] = useState(DEMO_BRIEF_TEXT);
  const [audioTranscript, setAudioTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setError(null);
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

      const analyzed = (await analyzeResponse.json()) as AnalyzeResponse;
      const status = analyzed.analysis?.shouldGenerateQuote
        ? "quoted"
        : "needs_clarification";
      const stored: StoredRequest = {
        id: created.id,
        title,
        rawText: textToAnalyze,
        sourceType: audioTranscript ? "mixed" : "text",
        status,
        createdAt: created.createdAt,
        updatedAt: new Date().toISOString(),
        analysis: analyzed.analysis,
        quoteRunId: analyzed.quoteRunId,
        promptVersion: analyzed.promptVersion,
      };

      upsertStoredRequest(stored);
      router.push(`/requests/${created.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Errore inatteso.");
    } finally {
      setIsAnalyzing(false);
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
              Carica mp3, wav o m4a. Senza API key ElevenLabs viene usata una
              trascrizione demo editabile.
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
              accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/m4a"
              className="sr-only"
              disabled={isTranscribing}
              onChange={(event) => handleAudioUpload(event.target.files?.[0])}
            />
          </label>

          <div>
            <label className="text-sm font-semibold" htmlFor="audio-transcript">
              Transcript editabile
            </label>
            <textarea
              id="audio-transcript"
              value={audioTranscript}
              onChange={(event) => setAudioTranscript(event.target.value)}
              placeholder="La trascrizione apparira' qui."
              className="mt-2 min-h-44 w-full rounded-md border border-[var(--border)] px-3 py-3 text-sm leading-6"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
