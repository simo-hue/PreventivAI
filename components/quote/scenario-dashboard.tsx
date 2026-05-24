"use client";

import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { evaluateScenarioRisk } from "@/src/lib/quotes/risk-engine";
import { formatCurrency, formatPercent } from "@/src/lib/utils/format";
import type { StoredRequest } from "@/src/lib/demo/storage";
import { DeliveryConfirmModal } from "./delivery-confirm-modal";
import { useState } from "react";

export function ScenarioDashboard({ initialData: request }: { initialData: StoredRequest }) {
  const router = useRouter();
  const scenarios = request?.analysis?.scenarios ?? [];
  const sortedScenarios = [...scenarios].sort(
    (a, b) => a.totals.totalEur - b.totals.totalEur,
  );

  if (!request) {
    return (
      <Alert title="Richiesta non trovata" variant="warning">
        La richiesta non e' presente nello storage locale. Torna alla lista e
        rigenera il demo.
      </Alert>
    );
  }

  const analysis = request.analysis;
  const approvedScenario = sortedScenarios.find((s) => s.isApproved);
  const hasApproved = !!approvedScenario;
  const scenariosToDisplay = approvedScenario ? [approvedScenario] : sortedScenarios;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);

  async function handleConfirmDelivery() {
    if (!request) return;
    setIsDelivering(true);
    try {
      const res = await fetch(`/api/requests/${request.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      if (res.ok) {
        router.push("/admin/history");
        router.refresh();
      }
    } catch {
      alert("Errore di connessione");
      setIsDelivering(false);
    }
  }

  return (
    <div className="space-y-5">
      {approvedScenario && (
        <DeliveryConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelivery}
          isPending={isDelivering}
          requestId={request.id}
          scenarioId={approvedScenario.id}
          scenario={approvedScenario as any}
        />
      )}
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-normal">{request.title}</h1>
            <Badge
              variant={
                request.status === "delivered"
                  ? "success"
                  : request.status === "quoted"
                    ? "success"
                    : request.status === "needs_clarification"
                      ? "warning"
                      : "neutral"
              }
            >
              {request.status === "quoted" ? "Preventivato" : request.status === "delivered" ? "Consegnato" : "Richiede chiarimenti"}
            </Badge>
          </div>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--muted)]">
            {analysis?.summary ?? request.rawText}
          </p>
        </div>
      </div>

      {request.status === "quoted" && hasApproved && (
        <Button
          variant="primary"
          className="w-full"
          onClick={() => setIsModalOpen(true)}
        >
          Segna come Consegnato
        </Button>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Budget rilevato"
          value={
            analysis?.detectedBudgetEur
              ? formatCurrency(analysis.detectedBudgetEur)
              : "Non rilevato"
          }
        />
        <Metric
          label="Timeline richiesta"
          value={analysis?.detectedTimelineText ?? "Non rilevata"}
        />
        <Metric
          label="Scenari"
          value={analysis?.shouldGenerateQuote ? String(scenarios.length) : "0"}
        />
      </div>



      {analysis?.importantQuestions.length && !hasApproved ? (
        <ImportantQuestionsSection 
          questions={analysis.importantQuestions} 
          requestId={request.id}
          hideSendToUserButton={request.isManualCreation}
        />
      ) : null}

      {scenariosToDisplay.length ? (
        <div className={`grid gap-4 ${scenariosToDisplay.length === 1 ? "xl:grid-cols-1" : scenariosToDisplay.length === 2 ? "xl:grid-cols-2" : "xl:grid-cols-3"}`}>
          {scenariosToDisplay.map((scenario) => {
            const risks = evaluateScenarioRisk({
              scenario,
              budgetEur: analysis?.detectedBudgetEur ?? null,
              requestedTimelineText: analysis?.detectedTimelineText ?? null,
            });
            return (
              <Card 
                key={scenario.id} 
                className={scenario.isApproved ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-1 ring-emerald-500/20" : ""}
              >
                <CardBody className="flex h-full flex-col gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{scenario.name}</h2>
                      <Badge variant={scenario.scenarioType === "lean" ? "success" : scenario.scenarioType === "premium" ? "warning" : "info"}>
                        {scenario.scenarioType === "lean" ? "Essenziale" : scenario.scenarioType === "premium" ? "Premium" : "Bilanciato"}
                      </Badge>
                      {scenario.isApproved && (
                        <Badge variant="success" className="gap-1 px-2.5">
                          <CheckCircle2 className="size-3" />
                          Confermato
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {scenario.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat label="Totale" value={formatCurrency(scenario.totals.totalEur)} />
                    <MiniStat label="Timeline" value={`${scenario.estimatedWeeksExpected} sett.`} />
                    <MiniStat label="PM" value={`${scenario.totals.pmHours}h`} />
                    <MiniStat label="Confidenza" value={formatPercent(scenario.confidence)} />
                  </div>
                  <div className="space-y-2">
                    {risks.slice(0, 2).map((risk) => (
                      <div
                        key={risk.label}
                        className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950"
                      >
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        <span>{risk.label}: {risk.detail}</span>
                      </div>
                    ))}
                    {!risks.length ? (
                      <div className="flex gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-950">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                        <span>Scenario coerente con i vincoli rilevati.</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <ButtonLink href={`/admin/requests/${request.id}/scenarios/${scenario.id}`} className="flex-1">
                      Dettaglio
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </ButtonLink>
                    <ButtonLink href={`/quotes/${scenario.id}/preview`} variant="secondary">
                      Preview
                    </ButtonLink>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--surface-strong)] p-3">
      <p className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ImportantQuestionsSection({ questions, requestId, hideSendToUserButton }: { questions: any[]; requestId: string; hideSendToUserButton?: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  const [answeringQuestion, setAnsweringQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);

  const toggle = (q: string) => {
    setSelected(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]);
  }

  const handleSend = async () => {
    if (!selected.length) return;
    setIsSending(true);
    try {
      const content = `Ciao, per elaborare al meglio il preventivo abbiamo bisogno di queste informazioni:\n\n${selected.map(q => `- ${q}`).join('\n')}`;
      
      await fetch(`/api/requests/${requestId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content,
          senderId: "5d65094f-d066-423c-a7ce-ef18a0f64368"
        }),
      });
      setSelected([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  }

  const handleAnswerSubmit = async () => {
    if (!answeringQuestion || !answerText.trim()) return;
    setIsAnswering(true);
    try {
      await fetch(`/api/requests/${requestId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: `Nota: Alla domanda "${answeringQuestion}", il cliente ha fornito questa informazione: ${answerText}`,
          metadata: { isHidden: true }
        }),
      });

      // Aggiorna subito lo stato a "analyzing" così la UI si aggiorna prima del redirect
      await fetch(`/api/requests/${requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "analyzing" }),
      });

      // Avvia l'analisi in background senza bloccare l'UI
      fetch(`/api/requests/${requestId}/analyze`, { method: "POST" }).catch(console.error);
      
      setAnsweringQuestion(null);
      setAnswerText("");
      router.push("/admin/requests");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Errore durante l'aggiornamento del preventivo.");
      setIsAnswering(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader 
          title="Domande importanti" 
          description="Seleziona le domande da inviare al cliente via chat oppure rispondi direttamente."
          action={
            !hideSendToUserButton ? (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSend} 
                  disabled={selected.length === 0 || isSending}
                >
                  {isSending ? "Invio..." : "Invia all'utente"}
                </Button>
              </div>
            ) : null
          }
        />
        <CardBody className="grid gap-3 lg:grid-cols-2">
          {questions.map(q => (
            <div key={q.question} className="flex flex-col rounded-md border border-[var(--border)] bg-white p-4 hover:bg-[var(--surface-strong)] transition-colors">
              <div className="flex items-start gap-3">
                <label className="flex items-start gap-3 cursor-pointer flex-1">
                  <input 
                    type="checkbox" 
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    checked={selected.includes(q.question)}
                    onChange={() => toggle(q.question)}
                  />
                  <div className="w-full">
                    <p className="text-sm font-semibold">{q.question}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{q.impact}</p>
                  </div>
                </label>
                <Button 
                  variant="secondary" 
                  className="shrink-0 text-xs py-1 px-3 h-8"
                  onClick={() => setAnsweringQuestion(q.question)}
                >
                  Rispondi
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {answeringQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Rispondi alla domanda</h3>
            <p className="mt-2 text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">{answeringQuestion}</p>
            
            <textarea
              className="mt-4 w-full rounded-xl border border-slate-300 p-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[160px] resize-y shadow-sm transition-colors"
              placeholder="Inserisci qui le informazioni ricevute..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isAnswering}
              autoFocus
            />
            
            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setAnsweringQuestion(null);
                  setAnswerText("");
                }}
                disabled={isAnswering}
                className="w-24"
              >
                Annulla
              </Button>
              <Button 
                onClick={handleAnswerSubmit}
                disabled={!answerText.trim() || isAnswering}
                className="w-32 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isAnswering ? "Aggiornamento..." : "Aggiorna"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
