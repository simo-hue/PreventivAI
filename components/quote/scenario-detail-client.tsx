"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Loader2, Send } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DEFAULT_PM_PERCENTAGE, officialRateCards } from "@/src/lib/demo/rate-card";
import { recalculateScenario } from "@/src/lib/quotes/pricing-engine";
import type { PricedScenario } from "@/src/lib/quotes/types";
import { formatCurrency, formatNumber, formatPercent } from "@/src/lib/utils/format";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type RequestInfo = {
  id: string;
  title: string;
};

export function ScenarioDetailClient({
  scenarioId,
  requestId,
  initialScenario,
  requestInfo,
}: {
  scenarioId: string;
  requestId: string;
  initialScenario: PricedScenario | null;
  requestInfo: RequestInfo | null;
}) {
  const [scenario, setScenario] = useState<PricedScenario | null>(initialScenario);
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      initialScenario?.modules.map((m) => [m.id, m.isIncluded]) ?? [],
    ),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingToChat, setIsSendingToChat] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const router = useRouter();
  const [pricingSettings, setPricingSettings] = useState<{
    pmPercentage: number;
    currency: string;
    riskBufferPercentage: number;
  } | null>(null);

  // Carica le impostazioni di pricing dal server
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setPricingSettings(data); })
      .catch(() => {});
  }, []);

  // Se non arrivano dal server, tenta di ricaricare dal DB via API
  useEffect(() => {
    if (initialScenario) {
      setScenario(initialScenario);
      setOverrides(
        Object.fromEntries(initialScenario.modules.map((m) => [m.id, m.isIncluded])),
      );
      return;
    }
    // Fallback: fetch dalla API
    fetch(`/api/quote-scenarios/${scenarioId}`, { method: "GET" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.scenario) {
          setScenario(data.scenario);
          setOverrides(
            Object.fromEntries(data.scenario.modules.map((m: { id: string; isIncluded: boolean }) => [m.id, m.isIncluded])),
          );
        }
      })
      .catch(() => {});
  }, [scenarioId, initialScenario]);

  const { recalculated, recalcError } = useMemo(() => {
    if (!scenario) return { recalculated: null, recalcError: null };
    try {
      const recalculated = recalculateScenario(
        scenario,
        officialRateCards,
        pricingSettings?.pmPercentage ?? DEFAULT_PM_PERCENTAGE,
        overrides,
        pricingSettings?.riskBufferPercentage ?? 0,
      );
      return { recalculated, recalcError: null };
    } catch (err) {
      // Se il ricalcolo fallisce (es. ruolo non presente in rate card), usa il scenario as-is
      console.warn("[ScenarioDetail] recalculateScenario fallback:", err);
      // Restituisce il scenario originale con i totali già calcolati dal DB
      return {
        recalculated: { ...scenario },
        recalcError: err instanceof Error ? err.message : String(err),
      };
    }
  }, [scenario, overrides, pricingSettings]);

  async function exportPdf() {
    if (!recalculated) return;
    const response = await fetch(`/api/quote-scenarios/${recalculated.id}/export-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestTitle: requestInfo?.title ?? recalculated.name,
        scenario: recalculated,
      }),
    });
    if (!response.ok) { window.print(); return; }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${recalculated.slug}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function updateModuleInclusion(moduleId: string, included: boolean) {
    const nextOverrides = { ...overrides, [moduleId]: included };
    setOverrides(nextOverrides);
    if (!scenario) return;
    try {
      const nextScenario = recalculateScenario(
        scenario,
        officialRateCards,
        pricingSettings?.pmPercentage ?? DEFAULT_PM_PERCENTAGE,
        nextOverrides,
        pricingSettings?.riskBufferPercentage ?? 0,
      );
      setScenario(nextScenario);
    } catch {
      // aggiorna solo gli override se il ricalcolo fallisce
    }
  }

  function updateEffortHours(moduleId: string, taskId: string, effortId: string, newHours: number) {
    if (!scenario) return;
    const nextScenario = JSON.parse(JSON.stringify(scenario)) as PricedScenario;
    const mod = nextScenario.modules.find((m) => m.id === moduleId);
    const tsk = mod?.tasks.find((t) => t.id === taskId);
    const eff = tsk?.efforts.find((e) => e.id === effortId);
    if (eff) {
      eff.estimatedHoursExpected = newHours;
      // Prevent PricingError: min <= expected <= max is required
      eff.estimatedHoursMin = Math.min(eff.estimatedHoursMin, newHours);
      eff.estimatedHoursMax = Math.max(eff.estimatedHoursMax, newHours);
    }
    setScenario(nextScenario);
  }

  function updateTaskTitle(moduleId: string, taskId: string, newTitle: string) {
    if (!scenario) return;
    const nextScenario = JSON.parse(JSON.stringify(scenario)) as PricedScenario;
    const mod = nextScenario.modules.find((m) => m.id === moduleId);
    const tsk = mod?.tasks.find((t) => t.id === taskId);
    if (tsk) tsk.title = newTitle;
    setScenario(nextScenario);
  }

  async function saveEdits() {
    if (!recalculated) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/quote-scenarios/${recalculated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: recalculated }),
      });
      if (response.ok) {
        setIsEditing(false);
      } else {
        alert("Errore durante il salvataggio.");
      }
    } catch {
      alert("Errore di rete.");
    } finally {
      setIsSaving(false);
    }
  }

  async function sendToChat() {
    const display = recalculated ?? scenario;
    if (!display) return;
    setIsSendingToChat(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           content: `Ti ho inviato il preventivo **${display.name}**. Puoi visualizzarlo o scaricarlo in PDF cliccando sui pulsanti qui sotto.`,
           metadata: {
              type: "quote_share",
              scenarioId: display.id,
              scenarioName: display.name,
              requestTitle: requestInfo?.title || display.name
           }
        }),
      });
      if (response.ok) {
        setShowSuccessDialog(true);
      } else {
        alert("Errore durante l'invio in chat.");
      }
    } catch {
      alert("Errore di rete.");
    } finally {
      setIsSendingToChat(false);
    }
  }

  // Loading state
  if (scenario === null && initialScenario === null) {
    return (
      <div className="flex items-center gap-3 text-[var(--muted)]">
        <Loader2 className="size-5 animate-spin" />
        <span>Caricamento scenario…</span>
      </div>
    );
  }

  // Scenario non trovato
  if (!scenario) {
    return (
      <Alert title="Scenario non trovato" variant="warning">
        Lo scenario non esiste o non è accessibile. Torna alla lista richieste.
      </Alert>
    );
  }

  // Il display usa recalculated se disponibile, altrimenti il scenario grezzo dal DB
  const display = recalculated ?? scenario;

  return (
    <div className="space-y-5">
      {recalcError && (
        <Alert title="Avviso prezzi" variant="warning">
          {recalcError} — I totali mostrati sono quelli salvati nel database.
        </Alert>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <Link
            href={`/admin/requests/${requestId}`}
            className="mb-4 inline-block text-sm font-semibold text-[var(--primary)]"
          >
            ← Torna alla richiesta
          </Link>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <h1 className="text-3xl font-bold tracking-normal text-slate-900">{display.name}</h1>
            <Badge variant="info" className="text-sm">
              {display.scenarioType === "lean" ? "Essenziale" : display.scenarioType === "premium" ? "Premium" : "Bilanciato"}
            </Badge>
          </div>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-600">
            {display.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-5 shadow-sm">
          {isEditing ? (
            <Button onClick={saveEdits} disabled={isSaving}>
              {isSaving ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Modifica Preventivo
            </Button>
          )}
          <ButtonLink href={`/quotes/${display.id}/preview`} variant="secondary">
            <ExternalLink className="size-4 mr-2" aria-hidden="true" />
            Preview
          </ButtonLink>
          <Button variant="secondary" onClick={exportPdf}>
            <Download className="size-4 mr-2" aria-hidden="true" />
            PDF
          </Button>
          <Button onClick={sendToChat} disabled={isSendingToChat || isEditing}>
            {isSendingToChat ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Send className="size-4 mr-2" aria-hidden="true" />}
            Invia a cliente
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Totale" value={formatCurrency(display.totals.totalEur, pricingSettings?.currency)} />
        <Metric label="Subtotale" value={formatCurrency(display.totals.subtotalEur, pricingSettings?.currency)} />
        <Metric label="PM" value={`${display.totals.pmHours}h / ${formatCurrency(display.totals.pmCostEur, pricingSettings?.currency)}`} />
        <Metric label="Confidenza" value={formatPercent(display.confidence)} />
      </div>

      {isEditing && (
        <Card>
          <CardHeader title="Impostazioni" description="Opzioni visibili al cliente." />
          <CardBody className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                className="size-4"
                checked={display.displayOptions?.showHours ?? true}
                onChange={(e) => {
                  if (!scenario) return;
                  const nextScenario = { ...scenario };
                  nextScenario.displayOptions = {
                    ...(nextScenario.displayOptions || {}),
                    showHours: e.target.checked,
                  };
                  setScenario(nextScenario);
                }}
              />
              Mostra dettaglio ore stimate
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                className="size-4"
                checked={display.displayOptions?.showHourlyRate ?? true}
                onChange={(e) => {
                  if (!scenario) return;
                  const nextScenario = { ...scenario };
                  nextScenario.displayOptions = {
                    ...(nextScenario.displayOptions || {}),
                    showHourlyRate: e.target.checked,
                  };
                  setScenario(nextScenario);
                }}
              />
              Mostra tariffa oraria
            </label>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Moduli" description="I moduli opzionali aggiornano il totale in tempo reale." />
        <CardBody className="space-y-4">
          {display.modules.map((module) => (
            <div key={module.id} className="rounded-lg border border-[var(--border)]">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{module.name}</h2>
                    <Badge variant={module.isOptional ? "warning" : "success"}>
                      {module.isOptional ? "Opzionale" : "Base"}
                    </Badge>
                    <Badge variant="neutral">{module.complexity}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {module.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <p className="text-right font-bold">
                    {formatCurrency(module.subtotalEur, pricingSettings?.currency)}
                  </p>
                  {module.isOptional ? (
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={overrides[module.id!] ?? module.isIncluded}
                        onChange={(e) => updateModuleInclusion(module.id!, e.target.checked)}
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
                        <tr
                          key={`${task.id}-${effort.roleRateCardId ?? effort.roleName}-${index}`}
                          className="border-t border-[var(--border)]"
                        >
                          <td className="px-4 py-3">
                            {index === 0 ? (
                              <div>
                                {isEditing ? (
                                  <input
                                    className="w-full rounded border border-[var(--border)] px-2 py-1 text-sm font-semibold"
                                    value={task.title}
                                    onChange={(e) =>
                                      updateTaskTitle(module.id!, task.id!, e.target.value)
                                    }
                                  />
                                ) : (
                                  <p className="font-semibold">{task.title}</p>
                                )}
                                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                  {task.description}
                                </p>
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            {effort.roleName}{" "}
                            <span className="text-[var(--muted)]">{effort.seniority}</span>
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-16 rounded border border-[var(--border)] px-2 py-1 text-sm"
                                  value={effort.estimatedHoursExpected}
                                  onChange={(e) =>
                                    updateEffortHours(
                                      module.id!,
                                      task.id!,
                                      effort.id!,
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                                <span>h</span>
                              </div>
                            ) : (
                              <span>{formatNumber(effort.estimatedHoursExpected)}h</span>
                            )}
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
        <ListCard title="Ipotesi / Assunzioni" items={display.assumptions} />
        <ListCard title="Esclusioni" items={display.exclusions} />
      </div>

      <ConfirmDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        onConfirm={() => {
          setShowSuccessDialog(false);
          router.push(`/admin/requests/${requestId}`);
        }}
        title="Preventivo Condiviso"
        description="Il preventivo è stato inviato in chat con successo. Il cliente può ora visualizzarlo o scaricarlo in formato PDF."
        confirmText="Vai alla Chat"
        cancelText="Chiudi"
        variant="success"
      />
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
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
