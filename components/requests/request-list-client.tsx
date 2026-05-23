"use client";

import { useEffect, useState } from "react";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { getStoredRequests, type StoredRequest } from "@/src/lib/demo/storage";
import { formatCurrency } from "@/src/lib/utils/format";

const statusLabel: Record<StoredRequest["status"], string> = {
  draft: "Draft",
  analyzing: "Analyzing",
  needs_clarification: "Needs clarification",
  quoted: "Quoted",
  error: "Error",
};

export function RequestListClient() {
  const [requests, setRequests] = useState<StoredRequest[]>([]);

  useEffect(() => {
    setRequests(getStoredRequests());
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Richieste</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Intake, analisi AI e preventivi modulari per il team interno.
          </p>
        </div>
        <ButtonLink href="/requests/new">
          <Plus className="size-4" aria-hidden="true" />
          Nuova richiesta
        </ButtonLink>
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
                        request.status === "quoted"
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
                  <ButtonLink href={`/requests/${request.id}`} variant="secondary">
                    Apri
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
