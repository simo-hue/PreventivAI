"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  findStoredScenario,
  replaceScenarioInRequest,
  upsertStoredRequest,
  type StoredRequest,
} from "@/src/lib/demo/storage";
import { DEFAULT_PM_PERCENTAGE, officialRateCards } from "@/src/lib/demo/rate-card";
import { recalculateScenario } from "@/src/lib/quotes/pricing-engine";
import type { PricedScenario } from "@/src/lib/quotes/types";
import { formatCurrency, formatNumber, formatPercent } from "@/src/lib/utils/format";

export function ScenarioDetailClient({
  scenarioId,
}: {
  scenarioId: string;
}) {
  const [request, setRequest] = useState<StoredRequest | null>(null);
  const [scenario, setScenario] = useState<PricedScenario | null>(null);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [pricingSettings, setPricingSettings] = useState<{
    pmPercentage: number;
    currency: string;
    riskBufferPercentage: number;
  } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setPricingSettings(data);
        }
      } catch (error) {
        console.error("Impossibile caricare le impostazioni nella pagina dettaglio", error);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    const found = findStoredScenario(scenarioId);
    setRequest(found?.request ?? null);
    setScenario(found?.scenario ?? null);
    setOverrides(
      Object.fromEntries(
        found?.scenario.modules.map((module) => [module.id, module.isIncluded]) ?? [],
      ),
    );
  }, [scenarioId]);

  const recalculated = useMemo(() => {
    if (!scenario) {
      return null;
    }

    return recalculateScenario(
      scenario,
      officialRateCards,
      pricingSettings?.pmPercentage ?? DEFAULT_PM_PERCENTAGE,
      overrides,
      pricingSettings?.riskBufferPercentage ?? 0,
    );
  }, [scenario, overrides, pricingSettings]);

  async function exportPdf() {
    if (!request || !recalculated) {
      return;
    }

    const response = await fetch(`/api/quote-scenarios/${recalculated.id}/export-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestTitle: request.title,
        scenario: recalculated,
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
    anchor.download = `${recalculated.slug}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function updateModuleInclusion(moduleId: string, included: boolean) {
    const nextOverrides = {
      ...overrides,
      [moduleId]: included,
    };
    setOverrides(nextOverrides);

    if (!request || !scenario) {
      return;
    }

    const nextScenario = recalculateScenario(
      scenario,
      officialRateCards,
      pricingSettings?.pmPercentage ?? DEFAULT_PM_PERCENTAGE,
      nextOverrides,
      pricingSettings?.riskBufferPercentage ?? 0,
    );
    const nextRequest = replaceScenarioInRequest(request, nextScenario);
    upsertStoredRequest(nextRequest);
    setRequest(nextRequest);
    setScenario(nextScenario);
  }

  if (!request || !scenario || !recalculated) {
    return (
      <Alert title="Scenario non trovato" variant="warning">
        Torna alla richiesta e seleziona uno scenario disponibile.
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href={`/requests/${request.id}`} className="text-sm font-semibold text-[var(--primary)]">
            Torna alla richiesta
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-normal">{recalculated.name}</h1>
            <Badge variant="info">{recalculated.scenarioType}</Badge>
          </div>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--muted)]">
            {recalculated.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/quotes/${recalculated.id}/preview`} variant="secondary">
            <ExternalLink className="size-4" aria-hidden="true" />
            Preview
          </ButtonLink>
          <Button onClick={exportPdf}>
            <Download className="size-4" aria-hidden="true" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Totale" value={formatCurrency(recalculated.totals.totalEur, pricingSettings?.currency)} />
        <Metric label="Subtotal" value={formatCurrency(recalculated.totals.subtotalEur, pricingSettings?.currency)} />
        <Metric label="PM" value={`${recalculated.totals.pmHours}h / ${formatCurrency(recalculated.totals.pmCostEur, pricingSettings?.currency)}`} />
        <Metric label="Confidenza" value={formatPercent(recalculated.confidence)} />
      </div>

      <Card>
        <CardHeader title="Moduli" description="I moduli opzionali aggiornano il totale in tempo reale." />
        <CardBody className="space-y-4">
          {recalculated.modules.map((module) => (
            <div key={module.id} className="rounded-lg border border-[var(--border)]">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{module.name}</h2>
                    <Badge variant={module.isOptional ? "warning" : "success"}>
                      {module.isOptional ? "Optional" : "Core"}
                    </Badge>
                    <Badge variant="neutral">{module.complexity}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {module.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <p className="text-right font-bold">{formatCurrency(module.subtotalEur, pricingSettings?.currency)}</p>
                  {module.isOptional ? (
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={overrides[module.id] ?? module.isIncluded}
                        onChange={(event) =>
                          updateModuleInclusion(module.id, event.target.checked)
                        }
                        className="size-4"
                      />
                      Incluso
                    </label>
                  ) : null}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[var(--surface-strong)] text-xs uppercase text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3">Task</th>
                      <th className="px-4 py-3">Ruolo</th>
                      <th className="px-4 py-3">Ore</th>
                      <th className="px-4 py-3">Tariffa</th>
                      <th className="px-4 py-3 text-right">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {module.tasks.flatMap((task) =>
                      task.efforts.map((effort, index) => (
                        <tr key={`${task.title}-${effort.roleRateCardId}`} className="border-t border-[var(--border)]">
                          <td className="px-4 py-3">
                            {index === 0 ? (
                              <div>
                                <p className="font-semibold">{task.title}</p>
                                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                  {task.description}
                                </p>
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            {effort.roleName} <span className="text-[var(--muted)]">{effort.seniority}</span>
                          </td>
                          <td className="px-4 py-3">
                            {formatNumber(effort.estimatedHoursExpected)}h
                          </td>
                          <td className="px-4 py-3">
                            {formatCurrency(effort.hourlyRateEur, pricingSettings?.currency)}/h
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(effort.costEur, pricingSettings?.currency)}
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Assumptions" items={recalculated.assumptions} />
        <ListCard title="Exclusions" items={recalculated.exclusions} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody>
        <ul className="space-y-2 text-sm leading-6 text-slate-700">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
