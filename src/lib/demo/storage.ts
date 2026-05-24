"use client";

import type { PricedAnalysisOutput, PricedScenario } from "@/src/lib/quotes/types";
import { demoAnalysis } from "@/src/lib/demo/sample-analysis";
import { DEFAULT_PM_PERCENTAGE, officialRateCards } from "@/src/lib/demo/rate-card";
import { priceScenarios } from "@/src/lib/quotes/pricing-engine";

const STORAGE_KEY = "preventivai.requests";

export type StoredRequest = {
  id: string;
  title: string;
  rawText: string;
  sourceType: "text" | "audio" | "document" | "mixed";
  status: "draft" | "analyzing" | "needs_clarification" | "quoted" | "delivered" | "error";
  createdAt: string;
  updatedAt: string;
  analysis?: PricedAnalysisOutput;
  isApproved?: boolean;
  quoteRunId?: string;
  promptVersion?: string;
  isManualCreation?: boolean;
};

export function getStoredRequests(): StoredRequest[] {
  return [];
}

export function saveStoredRequests(requests: StoredRequest[]) {
  // Disabilitato - usiamo solo Supabase
}

export function upsertStoredRequest(request: StoredRequest) {
  const requests = getStoredRequests();
  const next = [
    request,
    ...requests.filter((item) => item.id !== request.id),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveStoredRequests(next);
  return next;
}

export function getStoredRequest(id: string) {
  return getStoredRequests().find((request) => request.id === id) ?? null;
}

export function findStoredScenario(scenarioId: string) {
  for (const request of getStoredRequests()) {
    const scenario = request.analysis?.scenarios.find(
      (item) => item.id === scenarioId || item.slug === scenarioId,
    );

    if (scenario) {
      return {
        request,
        scenario,
      };
    }
  }

  return null;
}

export function buildDemoStoredRequest(): StoredRequest {
  const now = new Date().toISOString();
  return {
    id: "demo-delivery-pet-food",
    title: "MVP delivery cibo per animali",
    rawText:
      "Ciao! Vogliamo lanciare una piattaforma MVP per la nostra startup di Delivery di cibo per animali a domicilio. Budget massimo intorno ai 25.000€ e dobbiamo essere online entro 3 mesi.",
    sourceType: "text",
    status: "quoted",
    createdAt: now,
    updatedAt: now,
    analysis: {
      ...demoAnalysis,
      scenarios: priceScenarios({
        scenarios: demoAnalysis.scenarios,
        rateCards: officialRateCards,
        pmPercentage: DEFAULT_PM_PERCENTAGE,
      }),
    },
    quoteRunId: "demo-run",
    promptVersion: "quote-analysis.v1",
  };
}

export function replaceScenarioInRequest(
  request: StoredRequest,
  scenario: PricedScenario,
) {
  if (!request.analysis) {
    return request;
  }

  return {
    ...request,
    updatedAt: new Date().toISOString(),
    analysis: {
      ...request.analysis,
      scenarios: request.analysis.scenarios.map((item) =>
        item.id === scenario.id ? scenario : item,
      ),
    },
  };
}
