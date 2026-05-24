"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Printer, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import type { StoredRequest } from "@/src/lib/demo/storage";
import type { PricedScenario } from "@/src/lib/quotes/types";
import { formatCurrency, formatNumber, formatPercent } from "@/src/lib/utils/format";

export function QuotePreviewClient({ 
  scenarioId, 
  initialScenario,
  initialRequest,
  backUrl,
}: { 
  scenarioId: string; 
  initialScenario?: PricedScenario | null;
  initialRequest?: StoredRequest | null;
  backUrl?: string;
}) {
  const request = initialRequest;
  const scenario = initialScenario;
  const router = useRouter();
  const [isApproved, setIsApproved] = useState(scenario?.isApproved ?? false);
  const [isApproving, setIsApproving] = useState(false);

  async function exportPdf() {
    if (!request || !scenario) {
      return;
    }

    const response = await fetch(`/api/quote-scenarios/${scenario.id}/export-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestTitle: request.title,
        scenario,
      }),
    });

    if (!response.ok) {
      window.print();
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${scenario.slug}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleApprove() {
    if (!scenario || isApproving) return;
    setIsApproving(true);
    try {
      const response = await fetch(`/api/quote-scenarios/${scenario.id}/approve`, {
        method: "POST",
      });
      if (response.ok) {
        setIsApproved(true);
        router.refresh();
      } else {
        alert("Errore durante l'approvazione del preventivo.");
      }
    } catch {
      alert("Errore di rete.");
    } finally {
      setIsApproving(false);
    }
  }

  if (!request || !scenario) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <Alert title="Preventivo non trovato" variant="warning">
          Lo scenario richiesto non esiste o non è stato caricato correttamente dal database.
        </Alert>
      </main>
    );
  }

  return (
    <main className="bg-white @container">
      <div className="no-print sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          {backUrl ? (
            <ButtonLink href={backUrl} variant="ghost" className="-ml-2 px-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-2 size-4" />
              Torna al preventivo
            </ButtonLink>
          ) : (
            <p className="text-sm font-semibold text-[var(--primary)]">Italians quote it better - Preview</p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" />
              Stampa
            </Button>
            <Button onClick={exportPdf}>
              <Download className="size-4" aria-hidden="true" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-5 py-10 text-slate-900 @sm:px-8">
        <section className="min-h-[60vh] border-b border-slate-200 pb-10">
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{scenario.scenarioType}</Badge>
            <Badge variant="neutral">IVA esclusa</Badge>
            {isApproved && (
              <Badge variant="success" className="gap-1 px-2.5">
                <CheckCircle2 className="size-3" />
                Confermato
              </Badge>
            )}
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-normal @sm:text-5xl">
            {request.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            {scenario.description}
          </p>
          <div className="mt-10 grid gap-4 @sm:grid-cols-3">
            <HeroMetric label="Investimento" value={formatCurrency(scenario.totals.totalEur)} />
            <HeroMetric label="Timeline attesa" value={`${scenario.estimatedWeeksExpected} settimane`} />
            <HeroMetric label="Confidenza" value={formatPercent(scenario.confidence)} />
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-2xl font-bold">Executive summary</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
            {request.analysis?.summary}
          </p>
        </section>

        <section className="avoid-break border-t border-slate-200 py-10">
          <h2 className="text-2xl font-bold">Scope incluso</h2>
          <div className="mt-6 grid gap-4">
            {scenario.modules
              .filter((module) => module.isIncluded)
              .map((module) => (
                <div key={module.id} className="rounded-lg border border-slate-200 p-5">
                  <div className="flex flex-col gap-2 @sm:flex-row @sm:items-start @sm:justify-between">
                    <div>
                      <h3 className="font-bold">{module.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {module.description}
                      </p>
                    </div>
                    <p className="font-bold text-lg text-right">
                      {scenario.displayOptions?.showHours !== false && (
                         <span className="text-slate-400 font-normal mr-3 text-base">
                           {formatNumber(module.tasks?.reduce((sum, t) => sum + (t.efforts?.reduce((es, e) => es + (Number(e.estimatedHoursExpected) || 0), 0) || 0), 0) || 0)}h
                         </span>
                      )}
                      {formatCurrency(module.subtotalEur)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="avoid-break border-t border-slate-200 py-10">
          <h2 className="text-2xl font-bold">Breakdown economico</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full  text-left text-sm">
              <thead className="border-b border-slate-300 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Ruolo</th>
                  {scenario.displayOptions?.showHours !== false && <th className="py-3">Ore</th>}
                  {scenario.displayOptions?.showHourlyRate !== false && <th className="py-3">Tariffa</th>}
                  <th className="py-3 text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                {scenario.roleBreakdown.map((row) => (
                  <tr key={row.roleRateCardId} className="border-b border-slate-100">
                    <td className="py-3 font-semibold">
                      {row.roleName} <span className="font-normal text-slate-500">{row.seniority}</span>
                    </td>
                    {scenario.displayOptions?.showHours !== false && <td className="py-3">{formatNumber(row.hours)}h</td>}
                    {scenario.displayOptions?.showHourlyRate !== false && <td className="py-3">{formatCurrency(row.hourlyRateEur)}/h</td>}
                    <td className="py-3 text-right font-semibold">
                      {formatCurrency(row.costEur)}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-slate-100">
                  <td className="py-3 font-semibold">Product Manager / Agile Coach</td>
                  {scenario.displayOptions?.showHours !== false && <td className="py-3">{scenario.totals.pmHours}h</td>}
                  {scenario.displayOptions?.showHourlyRate !== false && <td className="py-3">Quota 10%</td>}
                  <td className="py-3 text-right font-semibold">
                    {formatCurrency(scenario.totals.pmCostEur)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-8 border-t border-slate-200 py-10 @lg:grid-cols-2">
          <PreviewList title="Assumptions" items={scenario.assumptions} />
          <PreviewList title="Exclusions" items={scenario.exclusions} />
        </section>

        <section className="border-t border-slate-200 py-10">
          <h2 className="text-2xl font-bold">Rischi e mitigazioni</h2>
          <div className="mt-6 grid gap-4">
            {scenario.risks.map((risk) => (
              <div key={risk.label} className="rounded-lg border border-slate-200 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{risk.label}</h3>
                  <Badge variant={risk.severity === "high" ? "danger" : risk.severity === "medium" ? "warning" : "success"}>
                    {risk.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200 py-10">
          <h2 className="text-2xl font-bold">Prossimi step</h2>
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 @sm:grid-cols-3">
            <li className="rounded-lg border border-slate-200 p-4">Conferma perimetro e moduli inclusi.</li>
            <li className="rounded-lg border border-slate-200 p-4">Workshop tecnico di dettaglio.</li>
            <li className="rounded-lg border border-slate-200 p-4">Kickoff e pianificazione sprint.</li>
          </ol>
        </section>

        {!isApproved && (
          <section className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-emerald-950">Sei soddisfatto della proposta?</h2>
            <p className="mt-2 text-emerald-800">
              Cliccando sul pulsante qui sotto approverai ufficialmente questo preventivo.
              Il team verrà notificato e potrà sbloccare il progetto procedendo con la consegna formale.
            </p>
            <Button 
              className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700 w-full @sm:w-auto px-8"
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
              {isApproving ? "Approvazione in corso..." : "Approva Preventivo"}
            </Button>
          </section>
        )}
      </article>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
