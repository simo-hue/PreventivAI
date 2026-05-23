import "server-only";

import { nanoid } from "nanoid";
import type { PricedAnalysisOutput } from "@/src/lib/quotes/types";

export async function createQuoteRun(analysis: PricedAnalysisOutput) {
  return {
    id: nanoid(12),
    status: analysis.shouldGenerateQuote ? "completed" : "needs_clarification",
    analysis,
    completedAt: new Date().toISOString(),
  };
}
