"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Clock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export function DeliveryConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  requestId,
  scenarioId
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  requestId: string;
  scenarioId: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isPending]);

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
    if (e.target === overlayRef.current && !isPending) {
      onClose();
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
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-100 p-8 shadow-2xl transition-all duration-300 scale-100 animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mb-5 ring-8 ring-amber-50">
            <AlertTriangle className="h-7 w-7 text-amber-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Conferma Consegna</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Stai per segnare questa richiesta come completata e consegnata, accettando il preventivo approvato dal cliente.
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-4 my-8 border border-amber-200/60 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0 mt-0.5">
              <Clock className="h-5 w-5 text-amber-600" aria-hidden="true" />
            </div>
            <div className="ml-3 text-left">
              <h3 className="text-sm font-bold text-amber-900">Verifica le stime</h3>
              <div className="mt-1 text-sm text-amber-800 leading-relaxed">
                <p>
                  Hai verificato se le ore stimate dall'AI per questo preventivo sono corrette e fattibili per il team?
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <ButtonLink 
            href={`/admin/requests/${requestId}/scenarios/${scenarioId}`} 
            variant="secondary"
            className="w-full sm:w-1/2 flex justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold"
          >
            Modifica Ore
          </ButtonLink>
          <Button 
            onClick={onConfirm} 
            disabled={isPending}
            className="w-full sm:w-1/2 flex justify-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            {isPending ? "Consegna in corso..." : "Conferma e Consegna"}
          </Button>
        </div>
      </div>
    </div>
  );
}
