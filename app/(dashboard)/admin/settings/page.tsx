"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type AppSettings = {
  organizationId: string;
  pmPercentage: number;
  currency: string;
  riskBufferPercentage: number;
};

export default function SettingsPage() {
  const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(null);
  const [pmPercentageInput, setPmPercentageInput] = useState("10");
  const [currencyInput, setCurrencyInput] = useState("EUR");
  const [riskBufferPercentageInput, setRiskBufferPercentageInput] = useState("0");

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carica le impostazioni iniziali dal DB
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) {
          throw new Error("Impossibile caricare le impostazioni dal server.");
        }
        const data = (await response.json()) as AppSettings;
        setOriginalSettings(data);
        setPmPercentageInput(String(Math.round(data.pmPercentage * 100)));
        setCurrencyInput(data.currency);
        setRiskBufferPercentageInput(String(Math.round(data.riskBufferPercentage * 100)));
      } catch (caught) {
        setErrorMessage(caught instanceof Error ? caught.message : "Errore durante il caricamento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Ripristina i valori originari ed esce dalla modifica
  function handleCancel() {
    if (originalSettings) {
      setPmPercentageInput(String(Math.round(originalSettings.pmPercentage * 100)));
      setCurrencyInput(originalSettings.currency);
      setRiskBufferPercentageInput(String(Math.round(originalSettings.riskBufferPercentage * 100)));
    }
    setIsEditing(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  // Salva le impostazioni modificate nel DB
  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSaving(true);

    const pmValue = parseFloat(pmPercentageInput);
    const riskValue = parseFloat(riskBufferPercentageInput);

    if (isNaN(pmValue) || pmValue < 0 || pmValue > 100) {
      setErrorMessage("La percentuale PM deve essere un numero compreso tra 0 e 100.");
      setIsSaving(false);
      return;
    }

    if (isNaN(riskValue) || riskValue < 0 || riskValue > 100) {
      setErrorMessage("Il risk buffer deve essere un numero compreso tra 0 e 100.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pmPercentage: pmValue / 100,
          currency: currencyInput,
          riskBufferPercentage: riskValue / 100,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Errore durante il salvataggio.");
      }

      const updated = (await response.json()) as AppSettings;
      setOriginalSettings(updated);
      setPmPercentageInput(String(Math.round(updated.pmPercentage * 100)));
      setCurrencyInput(updated.currency);
      setRiskBufferPercentageInput(String(Math.round(updated.riskBufferPercentage * 100)));
      setSuccessMessage("Impostazioni di pricing salvate correttamente nel database online.");
      setIsEditing(false); // Ritorna alla visualizzazione di sola lettura dopo il salvataggio
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Impossibile salvare le impostazioni.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="text-sm font-semibold text-[var(--muted)]">Caricamento impostazioni in corso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-normal">Settings</h1>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Parametri dell'organizzazione in tempo reale usati dal motore deterministico di stima.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <Alert title="Attenzione" variant="danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Alert>
      )}

      {!isEditing ? (
        /* Visualizzazione di Sola Lettura (Default) */
        <Card>
          <CardHeader
            title="pricing"
            description="Impostazioni correnti applicate per la generazione automatica dei costi PM e margini di rischio."
            action={
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
                <Pencil className="h-4 w-4" />
                Modifica
              </Button>
            }
          />
          <CardBody className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--surface-strong)] p-5 border border-[var(--border)] transition-all hover:shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                PM Percentage
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {pmPercentageInput}%
              </p>
            </div>
            <div className="rounded-lg bg-[var(--surface-strong)] p-5 border border-[var(--border)] transition-all hover:shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Valuta (Currency)
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {currencyInput}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--surface-strong)] p-5 border border-[var(--border)] transition-all hover:shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Risk Buffer
              </p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {riskBufferPercentageInput}%
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        /* Form di Modifica (Edit Mode) */
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader
              title="modifica pricing"
              description="Fattori percentuali utilizzati per calcolare Project Management, contingency e la valuta predefinita di tutti gli scenari."
            />
            <CardBody className="grid gap-6 sm:grid-cols-3">
              {/* Input PM Percentage */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200" htmlFor="pm-percent">
                  PM Percentage (%)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="pm-percent"
                    min="0"
                    max="100"
                    step="0.5"
                    value={pmPercentageInput}
                    onChange={(e) => setPmPercentageInput(e.target.value)}
                    className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 pr-8 text-sm focus-visible:outline-[var(--primary)]"
                    placeholder="10"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-sm text-[var(--muted)]">%</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Percentuale di Project Management calcolata sull'effort totale dei task.
                </p>
              </div>

              {/* Input Valuta */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200" htmlFor="currency">
                  Valuta (Currency)
                </label>
                <select
                  id="currency"
                  value={currencyInput}
                  onChange={(e) => setCurrencyInput(e.target.value)}
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm focus-visible:outline-[var(--primary)]"
                  required
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <p className="text-xs text-[var(--muted)]">
                  Valuta principale per la visualizzazione e per i preventivi generati.
                </p>
              </div>

              {/* Input Risk Buffer */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200" htmlFor="risk-buffer">
                  Risk Buffer (%)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="risk-buffer"
                    min="0"
                    max="100"
                    step="0.5"
                    value={riskBufferPercentageInput}
                    onChange={(e) => setRiskBufferPercentageInput(e.target.value)}
                    className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 pr-8 text-sm focus-visible:outline-[var(--primary)]"
                    placeholder="0"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-sm text-[var(--muted)]">%</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Margine di contingenza aggiunto al subtotale dei moduli per coprire rischi.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Bottoni per salvare o annullare */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSaving}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto flex items-center gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Salvataggio..." : "Salva impostazioni"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
