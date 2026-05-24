"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PricedScenario } from "@/src/lib/quotes/types";

export function DeliveryConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  requestId,
  scenarioId,
  scenario,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  requestId: string;
  scenarioId: string;
  scenario?: PricedScenario;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [editedScenario, setEditedScenario] = useState<PricedScenario | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pricingSettings, setPricingSettings] = useState<{
    pmPercentage: number;
    currency: string;
    riskBufferPercentage: number;
  } | null>(null);

  const [isLoadingScenario, setIsLoadingScenario] = useState(false);

  // Fetch full scenario from DB when modal opens
  useEffect(() => {
    if (isOpen && !editedScenario && !isLoadingScenario) {
      setIsLoadingScenario(true);
      fetch(`/api/quote-scenarios/${scenarioId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.scenario) {
            setEditedScenario(data.scenario);
          } else if (scenario) {
            setEditedScenario(JSON.parse(JSON.stringify(scenario)));
          }
        })
        .catch((e) => {
          console.error("[DeliveryConfirmModal] fetch error:", e);
          if (scenario) {
            setEditedScenario(JSON.parse(JSON.stringify(scenario)));
          }
        })
        .finally(() => {
          setIsLoadingScenario(false);
        });
    }
    
    if (!isOpen) {
      setEditedScenario(null);
    }
  }, [isOpen, scenarioId, scenario, editedScenario, isLoadingScenario]);

  useEffect(() => {
    if (isOpen && !pricingSettings) {
      fetch("/api/admin/settings")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data) setPricingSettings(data); })
        .catch(() => { });
    }
  }, [isOpen, pricingSettings]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isPending, isSaving]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isPending && !isSaving) {
      onClose();
    }
  };

  const updateEffortHours = (moduleId: string, taskId: string, effortId: string, newHours: number) => {
    if (!editedScenario) return;
    const nextScenario = JSON.parse(JSON.stringify(editedScenario)) as PricedScenario;
    const mod = nextScenario.modules.find((m) => m.id === moduleId);
    const tsk = mod?.tasks.find((t) => t.id === taskId);
    const eff = tsk?.efforts.find((e) => e.id === effortId);
    if (eff) {
      eff.estimatedHoursExpected = newHours;
      eff.estimatedHoursMin = Math.min(eff.estimatedHoursMin, newHours);
      eff.estimatedHoursMax = Math.max(eff.estimatedHoursMax, newHours);
    }
    setEditedScenario(nextScenario);
  };

  const handleSaveAndConfirm = async () => {
    if (!editedScenario) {
      onConfirm();
      return;
    }

    setIsSaving(true);
    try {
      // Passiamo direttamente l'editedScenario che contiene già le ore modificate nel suo state
      // (evitiamo recalculateScenario che sovrascrive i roleRateCardId con gli ID fake locali).
      const response = await fetch(`/api/quote-scenarios/${editedScenario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: editedScenario }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore durante il salvataggio");
      }

      onConfirm();
    } catch (e: any) {
      console.error(e);
      alert(`Errore: ${e.message}`);
      setIsSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-2xl transition-all duration-300 scale-100 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* HEADER MODALE */}
        <div className="flex flex-col items-center text-center p-8 pb-4 shrink-0">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Conferma e Modifica Ore
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Controlla le stime orarie ed effettua eventuali modifiche prima di consegnare definitivamente il preventivo al cliente.
          </p>
        </div>

        {/* CONTENT MODALE */}
        <div className="p-8 pt-0 overflow-y-auto flex-1 custom-scrollbar">
          {isLoadingScenario ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {editedScenario?.modules.map((module) => (
                <div key={module.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="font-bold text-sm text-slate-800">{module.name}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {module.tasks.flatMap((task) =>
                      task.efforts.map((effort, index) => (
                        <div key={`${task.id}-${effort.id}-${index}`} className="p-3 px-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="flex-1 pr-4">
                            {index === 0 && <p className="text-sm font-semibold text-slate-900 mb-1">{task.title}</p>}
                            <p className="text-xs text-slate-500">
                              <span className="font-medium">{effort.roleName}</span> ({effort.seniority})
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              min="0"
                              className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-sm font-medium text-right focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                            <span className="text-sm font-medium text-slate-500 w-4">h</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER MODALE */}
        <div className="p-8 pt-4 border-t border-slate-100 shrink-0 bg-slate-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="secondary"
              onClick={onClose}
              disabled={isSaving || isPending}
              className="w-full sm:w-1/3 flex justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Annulla
            </Button>
            <Button 
              onClick={handleSaveAndConfirm} 
              disabled={isSaving || isPending}
              className="w-full sm:w-2/3 flex justify-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
            >
              {(isSaving || isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              {(isSaving || isPending) ? "Salvataggio e Consegna..." : "Salva e Consegna"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
