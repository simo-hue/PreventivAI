"use client";

import { useState, useEffect } from "react";
import { Pencil, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { formatCurrency } from "@/src/lib/utils/format";
import type { RateCard } from "@/src/lib/quotes/types";

type EditableRateCard = RateCard & { status: "Attivo" | "Inattivo" };

export default function RateCardPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [originalRates, setOriginalRates] = useState<EditableRateCard[]>([]);
  const [rates, setRates] = useState<EditableRateCard[]>([]);

  useEffect(() => {
    async function loadRateCards() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch("/api/admin/rate-cards");
        if (!response.ok) {
          throw new Error("Impossibile caricare il tariffario dal server.");
        }
        const data = await response.json();
        setOriginalRates(data);
        setRates(data);
      } catch (caught) {
        setErrorMessage(caught instanceof Error ? caught.message : "Errore durante il caricamento.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRateCards();
  }, []);

  const handleRateChange = (id: string, field: keyof EditableRateCard, value: string | number) => {
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleCancel = () => {
    setRates(originalRates);
    setIsEditing(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/rate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Errore durante il salvataggio.");
      }

      const updated = await response.json();
      setOriginalRates(updated);
      setRates(updated);
      setSuccessMessage("Tariffario aggiornato correttamente nel database.");
      setIsEditing(false);
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Impossibile salvare il tariffario.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <p className="text-sm font-semibold text-[var(--muted)]">Caricamento tariffario in corso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-normal">Tariffario ufficiale</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Il pricing usa queste tariffe come input. In produzione vengono lette
          da Supabase e salvate come snapshot negli effort del preventivo.
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

      <div className="space-y-6">
        <Card>
          <CardHeader 
            title="Tariffario" 
            description="Seed iniziale estratto dalle specifiche." 
            action={
              !isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
                  <Pencil className="h-4 w-4" />
                  Modifica
                </Button>
              ) : undefined
            }
          />
          <CardBody className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
                <tr>
                  <th className="py-3">Ruolo</th>
                  <th className="py-3">Seniority</th>
                  <th className="py-3">Tariffa</th>
                  <th className="py-3">Ambito</th>
                  <th className="py-3">Stato</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.id} className="border-b border-[var(--border)]">
                    <td className="py-3 font-semibold">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full rounded border border-[var(--border)] bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--primary)]"
                          value={rate.roleName}
                          onChange={(e) => handleRateChange(rate.id, "roleName", e.target.value)}
                        />
                      ) : (
                        rate.roleName
                      )}
                    </td>
                    <td className="py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full rounded border border-[var(--border)] bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--primary)]"
                          value={rate.seniority}
                          onChange={(e) => handleRateChange(rate.id, "seniority", e.target.value)}
                        />
                      ) : (
                        rate.seniority
                      )}
                    </td>
                    <td className="py-3 font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-24 rounded border border-[var(--border)] bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--primary)]"
                          value={rate.hourlyRateEur}
                          onChange={(e) => handleRateChange(rate.id, "hourlyRateEur", parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        `${formatCurrency(rate.hourlyRateEur)}/h`
                      )}
                    </td>
                    <td className="py-3 text-[var(--muted)]">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full rounded border border-[var(--border)] bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--primary)]"
                          value={rate.competenceScope}
                          onChange={(e) => handleRateChange(rate.id, "competenceScope", e.target.value)}
                        />
                      ) : (
                        rate.competenceScope
                      )}
                    </td>
                    <td className="py-3">
                      {isEditing ? (
                        <select
                          className="rounded border border-[var(--border)] bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--primary)]"
                          value={rate.status}
                          onChange={(e) => handleRateChange(rate.id, "status", e.target.value as "Attivo" | "Inattivo")}
                        >
                          <option value="Attivo" className="text-black dark:text-white dark:bg-zinc-900 bg-white">Attivo</option>
                          <option value="Inattivo" className="text-black dark:text-white dark:bg-zinc-900 bg-white">Inattivo</option>
                        </select>
                      ) : (
                        <Badge variant={rate.status === "Attivo" ? "success" : "neutral"}>
                          {rate.status}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {isEditing && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSaving}>
              Annulla
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto flex items-center gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Salvataggio..." : "Salva modifiche"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
