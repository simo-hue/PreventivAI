"use client";

import { useState, useTransition } from "react";
import { ArrowRight, FileText, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/src/lib/utils/format";
import { deleteRequestAction } from "@/app/(dashboard)/requests/actions";

const statusLabel: Record<string, string> = {
  draft: "Draft",
  analyzing: "Analyzing",
  needs_clarification: "Needs clarification",
  quoted: "Quoted",
  delivered: "Delivered",
  error: "Error",
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
  const requests = initialRequests;
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa richiesta? L'azione non può essere annullata.")) {
      setDeletingId(id);
      startTransition(async () => {
        try {
          await deleteRequestAction(id);
        } finally {
          setDeletingId(null);
        }
      });
    }
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
          {showNewButton && (
            <ButtonLink href="/requests/new">
              <Plus className="size-4" aria-hidden="true" />
              Nuova richiesta
            </ButtonLink>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => {
          const bestScenario = request.analysis?.scenarios[0];
          return (
            <Card key={request.id}>
              <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="size-4 text-[var(--primary)]" aria-hidden="true" />
                    <h2 className="font-semibold">{request.title}</h2>
                    <Badge
                      variant={
                        request.status === "delivered"
                          ? "success"
                          : request.status === "quoted"
                            ? "success"
                            : request.status === "needs_clarification"
                              ? "warning"
                              : "neutral"
                      }
                    >
                      {statusLabel[request.status]}
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
                      onClick={() => handleDelete(request.id)}
                      disabled={isPending && deletingId === request.id}
                      title="Elimina richiesta"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                    <ButtonLink href={`/requests/${request.id}`} variant="secondary">
                      Apri
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </ButtonLink>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
