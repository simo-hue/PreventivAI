import { NextResponse } from "next/server";
import { z } from "zod";
import {
  analyzeQuoteRequest,
  createInputHash,
  createPromptContext,
  QUOTE_ANALYSIS_PROMPT_VERSION,
} from "@/src/lib/ai/quote-agent";
import { DEFAULT_PM_PERCENTAGE, officialRateCards } from "@/src/lib/demo/rate-card";
import { priceScenarios } from "@/src/lib/quotes/pricing-engine";
import { requireUser } from "@/src/lib/auth/require-user";
import { getSimilarHistoricalProjects } from "@/src/server/repositories/history-repository";
import { createQuoteRun } from "@/src/server/repositories/quote-repository";

const AnalyzeRequestSchema = z.object({
  requestText: z.string().min(20),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await request.json();
  const parsed = AnalyzeRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Testo richiesta troppo corto.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const user = await requireUser();
    const similarHistoricalProjects = await getSimilarHistoricalProjects({
      organizationId: user.organizationId,
      requestText: parsed.data.requestText,
    });
    const context = createPromptContext({
      requestText: parsed.data.requestText,
      rateCards: officialRateCards,
      similarHistoricalProjects,
      pmPercentage: DEFAULT_PM_PERCENTAGE,
    });
    const analysis = await analyzeQuoteRequest(context);
    const pricedAnalysis = {
      ...analysis,
      scenarios: analysis.shouldGenerateQuote
        ? priceScenarios({
            scenarios: analysis.scenarios,
            rateCards: officialRateCards,
            pmPercentage: DEFAULT_PM_PERCENTAGE,
          })
        : [],
    };
    const quoteRun = await createQuoteRun(pricedAnalysis);

    return NextResponse.json({
      requestId: id,
      quoteRunId: quoteRun.id,
      inputHash: createInputHash(parsed.data.requestText),
      promptVersion: QUOTE_ANALYSIS_PROMPT_VERSION,
      rateCards: officialRateCards,
      pmPercentage: DEFAULT_PM_PERCENTAGE,
      analysis: pricedAnalysis,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Analisi preventivo non riuscita.",
      },
      { status: 500 },
    );
  }
}
