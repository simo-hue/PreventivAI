"use client";

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  findStoredScenario,
  type StoredRequest,
} from "@/src/lib/demo/storage";
import type { PricedScenario } from "@/src/lib/quotes/types";
import { formatCurrency, formatNumber, formatPercent } from "@/src/lib/utils/format";

export function QuotePreviewClient({ scenarioId, initialScenario }: { scenarioId: string; initialScenario?: PricedScenario | null }) {
  const [request, setRequest] = useState<StoredRequest | null>(null);
  const [scenario, setScenario] = useState<PricedScenario | null>(initialScenario ?? null);

  useEffect(() => {
    if (initialScenario) {
      // Cerca la richiesta in localStorage per il titolo/summary, se disponibile
      const found = findStoredScenario(scenarioId);
      setRequest(found?.request ?? null);
      // Il scenario viene dalla fonte di verità del server — non sovrascrivere
    } else {
      const found = findStoredScenario(scenarioId);
      setRequest(found?.request ?? null);
      setScenario(found?.scenario ?? null);
    }
  }, [scenarioId, initialScenario]);

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

  if (!request || !scenario) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <Alert title="Preventivo non trovato" variant="warning">
          Lo scenario non e' disponibile nello storage locale.
        </Alert>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <div className="no-print sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--primary)]">Italians quote it better - Preview</p>
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

      <article className="mx-auto max-w-5xl px-5 py-10 text-slate-900 sm:px-8">
        <section className="min-h-[60vh] border-b border-slate-200 pb-10">
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{scenario.scenarioType}</Badge>
            <Badge variant="neutral">IVA esclusa</Badge>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-normal sm:text-5xl">
            {request.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            {scenario.description}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold">{module.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {module.description}
                      </p>
                    </div>
                    <p className="font-bold">{formatCurrency(module.subtotalEur)}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="avoid-break border-t border-slate-200 py-10">
          <h2 className="text-2xl font-bold">Breakdown economico</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-slate-300 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Ruolo</th>
                  <th className="py-3">Ore</th>
                  <th className="py-3">Tariffa</th>
                  <th className="py-3 text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                {scenario.roleBreakdown.map((row) => (
                  <tr key={row.roleRateCardId} className="border-b border-slate-100">
                    <td className="py-3 font-semibold">
                      {row.roleName} <span className="font-normal text-slate-500">{row.seniority}</span>
                    </td>
                    <td className="py-3">{formatNumber(row.hours)}h</td>
                    <td className="py-3">{formatCurrency(row.hourlyRateEur)}/h</td>
                    <td className="py-3 text-right font-semibold">
                      {formatCurrency(row.costEur)}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-slate-100">
                  <td className="py-3 font-semibold">Product Manager / Agile Coach</td>
                  <td className="py-3">{scenario.totals.pmHours}h</td>
                  <td className="py-3">Quota 10%</td>
                  <td className="py-3 text-right font-semibold">
                    {formatCurrency(scenario.totals.pmCostEur)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-8 border-t border-slate-200 py-10 lg:grid-cols-2">
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
          <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-3">
            <li className="rounded-lg border border-slate-200 p-4">Conferma perimetro e moduli inclusi.</li>
            <li className="rounded-lg border border-slate-200 p-4">Workshop tecnico di dettaglio.</li>
            <li className="rounded-lg border border-slate-200 p-4">Kickoff e pianificazione sprint.</li>
          </ol>
        </section>
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
