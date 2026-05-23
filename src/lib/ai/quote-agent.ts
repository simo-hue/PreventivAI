import "server-only";

import { zodResponseFormat } from "openai/helpers/zod";
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
import { createOpenRouterClient } from "./openrouter-client";

export type PromptContext = {
  requestText: string;
  rateCard: Array<{
    roleName: string;
    seniority: string;
    hourlyRateEur: number;
    competenceScope: string;
  }>;
  similarHistoricalProjects: Array<{
    projectName: string;
    projectType?: string;
    description: string;
    modules: Array<{
      moduleName: string;
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
  const client = createOpenRouterClient();

  if (!client) {
    return shouldUseDemoAnalysis(context.requestText)
      ? demoAnalysis
      : buildBlockingClarificationAnalysis(context.requestText);
  }

  const model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4.5";
  const payload = JSON.stringify(context);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: QUOTE_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: payload },
      ],
      temperature: 0.2,
      response_format: zodResponseFormat(
        AnalysisOutputSchema,
        "analysis_output",
      ),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      continue;
    }

    const parsed = AnalysisOutputSchema.safeParse(JSON.parse(content));
    if (parsed.success) {
      return parsed.data;
    }
  }

  throw new Error("OpenRouter returned invalid quote analysis JSON twice.");
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
      hourlyRateEur: rateCard.hourlyRateEur,
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
