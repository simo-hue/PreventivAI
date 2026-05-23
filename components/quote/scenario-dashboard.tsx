"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, HelpCircle, RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { evaluateScenarioRisk } from "@/src/lib/quotes/risk-engine";
import { formatCurrency, formatPercent } from "@/src/lib/utils/format";
import type { StoredRequest } from "@/src/lib/demo/storage";

export function ScenarioDashboard({ initialData: request }: { initialData: StoredRequest }) {
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-normal">{request.title}</h1>
            <Badge
              variant={
                request.status === "quoted"
                  ? "success"
                  : request.status === "needs_clarification"
                    ? "warning"
                    : "neutral"
              }
            >
              {request.status === "quoted" ? "Quoted" : "Needs clarification"}
            </Badge>
          </div>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--muted)]">
            {analysis?.summary ?? request.rawText}
          </p>
        </div>
        <ButtonLink href="/requests/new" variant="secondary">
          <RefreshCw className="size-4" aria-hidden="true" />
          Nuova analisi
        </ButtonLink>
      </div>

      {analysis?.blockingQuestions.length ? (
        <Alert title="Informazioni bloccanti" variant="warning">
          Il sistema non genera un preventivo finale finche' queste domande non
          sono chiarite.
        </Alert>
      ) : null}

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

      {analysis?.blockingQuestions.length ? (
        <Card>
          <CardHeader
            title="Domande cliente"
            description="Rispondi alle domande e rilancia l'analisi con il testo aggiornato."
            action={
              <ButtonLink href={`/requests/${request.id}/clarifications`}>
                Rispondi
              </ButtonLink>
            }
          />
          <CardBody className="space-y-3">
            {analysis.blockingQuestions.map((question) => (
              <QuestionRow key={question.question} question={question.question} reason={question.reason} />
            ))}
          </CardBody>
        </Card>
      ) : null}

      {analysis?.importantQuestions.length ? (
        <Card>
          <CardHeader title="Domande importanti" description="Non bloccano la stima, ma delimitano lo scope." />
          <CardBody className="grid gap-3 lg:grid-cols-3">
            {analysis.importantQuestions.map((question) => (
              <QuestionRow key={question.question} question={question.question} reason={question.impact} />
            ))}
          </CardBody>
        </Card>
      ) : null}

      {sortedScenarios.length ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {sortedScenarios.map((scenario) => {
            const risks = evaluateScenarioRisk({
              scenario,
              budgetEur: analysis?.detectedBudgetEur ?? null,
              requestedTimelineText: analysis?.detectedTimelineText ?? null,
            });
            return (
              <Card key={scenario.id}>
                <CardBody className="flex h-full flex-col gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{scenario.name}</h2>
                      <Badge variant={scenario.scenarioType === "lean" ? "success" : scenario.scenarioType === "premium" ? "warning" : "info"}>
                        {scenario.scenarioType}
                      </Badge>
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
                    <ButtonLink href={`/requests/${request.id}/scenarios/${scenario.id}`} className="flex-1">
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

function QuestionRow({ question, reason }: { question: string; reason: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-white p-3">
      <div className="flex gap-2">
        <HelpCircle className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{question}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{reason}</p>
        </div>
      </div>
    </div>
  );
}
