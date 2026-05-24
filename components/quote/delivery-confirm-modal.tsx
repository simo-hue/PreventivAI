"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Clock, ArrowRight, Loader2 } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl transition-all duration-300 scale-100 animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4 ring-4 ring-amber-50 dark:bg-amber-950/30 dark:ring-amber-950/10">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Conferma Consegna Progetto</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Stai per segnare questa richiesta come completata e consegnata, accettando il preventivo approvato dal cliente.
          </p>
        </div>

        <div className="rounded-md bg-amber-50 p-4 my-6 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">Verifica le stime</h3>
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-300/80">
                <p>
                  Hai verificato se le ore stimate dall'AI per questo preventivo sono corrette e fattibili per il team?
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <ButtonLink 
            href={`/admin/requests/${requestId}/scenarios/${scenarioId}`} 
            variant="secondary"
            className="w-full sm:w-auto flex-1 justify-center"
          >
            Modifica Ore
          </ButtonLink>
          <Button 
            onClick={onConfirm} 
            disabled={isPending}
            className="w-full sm:w-auto flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 text-white border-transparent focus:ring-emerald-500"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            {isPending ? "Consegna in corso..." : "Conferma e Consegna"}
          </Button>
        </div>
      </div>
    </div>
  );
}
