"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  getStoredRequest,
  upsertStoredRequest,
  type StoredRequest,
} from "@/src/lib/demo/storage";

export function ClarificationForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [request, setRequest] = useState<StoredRequest | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRequest(getStoredRequest(requestId));
  }, [requestId]);

  async function saveAnswers() {
    if (!request?.analysis) {
      return;
    }

    setError(null);
    const payload = request.analysis.blockingQuestions.map((question) => ({
      question: question.question,
      answer: answers[question.question] ?? "",
    }));

    if (payload.some((item) => !item.answer.trim())) {
      setError("Compila tutte le risposte bloccanti.");
      return;
    }

    const response = await fetch(`/api/requests/${request.id}/clarifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });

    if (!response.ok) {
      setError("Salvataggio risposte non riuscito.");
      return;
    }

    const appendedText = `${request.rawText}\n\nRisposte cliente:\n${payload
      .map((item) => `${item.question}\n${item.answer}`)
      .join("\n\n")}`;
    const nextRequest: StoredRequest = {
      ...request,
      rawText: appendedText,
      updatedAt: new Date().toISOString(),
    };

    upsertStoredRequest(nextRequest);
    router.push("/requests/new");
  }

  if (!request?.analysis?.blockingQuestions.length) {
    return (
      <Alert title="Nessuna domanda bloccante" variant="success">
        Questa richiesta puo' gia' produrre scenari di preventivo.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Alert title="Errore" variant="danger">
          {error}
        </Alert>
      ) : null}
      {request.analysis.blockingQuestions.map((question) => (
        <div
          key={question.question}
          className="rounded-lg border border-[var(--border)] bg-white p-5"
        >
          <label className="text-sm font-semibold" htmlFor={question.question}>
            {question.question}
          </label>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {question.impact}
          </p>
          <textarea
            id={question.question}
            value={answers[question.question] ?? ""}
            onChange={(event) =>
              setAnswers((current) => ({
                ...current,
                [question.question]: event.target.value,
              }))
            }
            className="mt-3 min-h-28 w-full rounded-md border border-[var(--border)] px-3 py-3 text-sm leading-6"
          />
        </div>
      ))}
      <Button onClick={saveAnswers}>Salva risposte</Button>
    </div>
  );
}
