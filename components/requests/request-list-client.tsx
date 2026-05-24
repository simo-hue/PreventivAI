"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Plus, Trash2, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/src/lib/utils/format";
import { deleteRequestAction } from "@/app/(dashboard)/admin/requests/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const statusLabel: Record<string, string> = {
  draft: "In elaborazione",
  analyzing: "In elaborazione",
  needs_clarification: "Richiede chiarimenti",
  quoted: "Preventivato",
  delivered: "Consegnato",
  error: "Errore",
};

import type { StoredRequest } from "@/src/lib/demo/storage";

export function RequestListClient({
  initialRequests,
  title = "Richieste",
  description = "Intake, analisi AI e preventivi modulari per il team interno.",
  showNewButton = true,
  customAction,
}: {
  initialRequests: StoredRequest[];
  title?: string;
  description?: string;
  showNewButton?: boolean;
  customAction?: React.ReactNode;
}) {
  const router = useRouter();
  const requests = initialRequests;
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setRequestToDelete({ id, title });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!requestToDelete) return;
    setDeletingId(requestToDelete.id);
    startTransition(async () => {
      try {
        await deleteRequestAction(requestToDelete.id);
        setIsConfirmOpen(false);
        setRequestToDelete(null);
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">{title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {customAction}
          <Button variant="secondary" onClick={handleRefresh} disabled={isRefreshing} title="Aggiorna stato">
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          {showNewButton && (
            <ButtonLink href="/admin/requests/new">
              <Plus className="size-4" aria-hidden="true" />
              Nuova richiesta
            </ButtonLink>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => {
          const bestScenario = request.analysis?.scenarios[0];
          const isProcessing = request.status === "draft" || request.status === "analyzing";
          const isApproved = request.isApproved || request.analysis?.scenarios?.some((s: any) => s.isApproved);
          return (
            <Card 
              key={request.id}
              className={isApproved ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-1 ring-emerald-500/20" : ""}
            >
              <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="size-4 text-[var(--primary)]" aria-hidden="true" />
                    <h2 className="font-semibold">{request.title}</h2>
                    <Badge
                      variant={
                        isApproved
                          ? "success"
                          : request.status === "delivered"
                            ? "success"
                            : request.status === "quoted"
                              ? "success"
                              : request.status === "needs_clarification"
                                ? "warning"
                                : "neutral"
                      }
                    >
                      {isApproved ? "Confermato" : statusLabel[request.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                    {request.analysis?.summary ?? request.rawText}
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-6 lg:justify-end">
                  {bestScenario ? (
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                        Da
                      </p>
                      <p className="text-lg font-bold">
                        {formatCurrency(bestScenario.totals.totalEur)}
                      </p>
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(request.id, request.title)}
                      disabled={isPending && deletingId === request.id}
                      title="Elimina richiesta"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                    {isProcessing ? (
                      <Button variant="secondary" disabled>
                        Apri
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Button>
                    ) : (
                      <ButtonLink href={`/admin/requests/${request.id}`} variant="secondary">
                        Apri
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </ButtonLink>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Elimina richiesta"
        description={requestToDelete ? `Sei sicuro di voler eliminare la richiesta "${requestToDelete.title}"? Questa azione è irreversibile e tutti i preventivi associati verranno cancellati definitivamente.` : ""}
        confirmText="Sì, elimina"
        cancelText="Annulla"
        isPending={isPending}
        variant="danger"
      />
    </div>
  );
}
