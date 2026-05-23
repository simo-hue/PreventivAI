import "server-only";

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createHash } from "node:crypto";
import { AnalysisOutputSchema } from "@/src/lib/ai/schemas";
import {
  QUOTE_ANALYSIS_PROMPT_VERSION,
  QUOTE_ANALYSIS_SYSTEM_PROMPT,
} from "@/src/lib/ai/prompts/quote-analysis.v1";
import {
  buildBlockingClarificationAnalysis,
  demoAnalysis,
  shouldUseDemoAnalysis,
} from "@/src/lib/demo/sample-analysis";
import type { RateCard } from "@/src/lib/quotes/types";
// createOpenRouterClient is no longer used here as we use Vercel AI SDK directly

export type PromptContext = {
  requestText: string;
  rateCard: Array<{
    roleName: string;
    seniority: string;
    competenceScope: string;
  }>;
  similarHistoricalProjects: Array<{
    projectName: string;
    clientIndustry?: string;
    projectType?: string;
    description: string;
    initialRequest?: string;
    deliveredScope?: string;
    tags?: string[];
    modules: Array<{
      moduleName: string;
      description?: string;
      complexity?: string;
      actualHoursByRole: Record<string, number>;
      notes?: string;
    }>;
    totalActualHours?: number;
    deliveryWeeks?: number;
    riskNotes?: string;
  }>;
  organizationDefaults: {
    pmPercentage: number;
    currency: "EUR";
  };
};

export async function analyzeQuoteRequest(context: PromptContext) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return shouldUseDemoAnalysis(context.requestText)
      ? demoAnalysis
      : buildBlockingClarificationAnalysis(context.requestText);
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  const modelId = process.env.AI_MODEL ?? "gemini-3.5-flash";

  try {
    const { object } = await generateObject({
      model: google(modelId),
      schema: AnalysisOutputSchema,
      system: QUOTE_ANALYSIS_SYSTEM_PROMPT,
      prompt: JSON.stringify(context),
      temperature: 0.2,
      maxRetries: 3,
    });

    return object;
  } catch (error) {
    console.error("[QuoteAgent] Vercel AI SDK generation failed:", error);
    throw new Error("Generazione del preventivo fallita: il modello non ha restituito un JSON valido. Riprova.");
  }
}

export function createPromptContext(args: {
  requestText: string;
  rateCards: RateCard[];
  similarHistoricalProjects: PromptContext["similarHistoricalProjects"];
  pmPercentage: number;
}): PromptContext {
  return {
    requestText: args.requestText,
    rateCard: args.rateCards.map((rateCard) => ({
      roleName: rateCard.roleName,
      seniority: rateCard.seniority,
      competenceScope: rateCard.competenceScope,
    })),
    similarHistoricalProjects: args.similarHistoricalProjects,
    organizationDefaults: {
      pmPercentage: args.pmPercentage,
      currency: "EUR",
    },
  };
}

export function createInputHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export { QUOTE_ANALYSIS_PROMPT_VERSION };
