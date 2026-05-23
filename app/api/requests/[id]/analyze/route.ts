import { NextResponse } from "next/server";
import { z } from "zod";
import {
  analyzeQuoteRequest,
  createInputHash,
  createPromptContext,
  QUOTE_ANALYSIS_PROMPT_VERSION,
} from "@/src/lib/ai/quote-agent";
import { getActiveRateCards } from "@/src/server/repositories/rate-card-repository";
import { priceScenarios } from "@/src/lib/quotes/pricing-engine";
import { requireUser } from "@/src/lib/auth/require-user";
import { getSimilarHistoricalProjects } from "@/src/server/repositories/history-repository";
import { createQuoteRun } from "@/src/server/repositories/quote-repository";
import { getAppSettings } from "@/src/server/repositories/settings-repository";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

const AnalyzeRequestSchema = z.object({
  requestText: z.string().min(10).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let payload = {};
  try {
    payload = await request.json();
  } catch {
    // Empty payload
  }
  const parsed = AnalyzeRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload non valido.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let requestText = parsed.data.requestText;
  if (!requestText) {
    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase error" }, { status: 500 });
    }
    const { data: clientReq } = await admin.from("client_requests").select("raw_text").eq("id", id).single();
    if (!clientReq?.raw_text) {
      return NextResponse.json({ error: "Testo richiesta non trovato." }, { status: 400 });
    }
    requestText = clientReq.raw_text;
  }
  
  const textToAnalyze = requestText as string;

  try {
    const user = await requireUser();
    const settings = await getAppSettings(user.organizationId);
    
    const similarHistoricalProjects = await getSimilarHistoricalProjects({
      organizationId: user.organizationId,
      requestText: textToAnalyze,
    });
    const activeRateCards = await getActiveRateCards();
    const context = createPromptContext({
      requestText: textToAnalyze,
      rateCards: activeRateCards,
      similarHistoricalProjects,
      pmPercentage: settings.pmPercentage,
    });
    const analysis = await analyzeQuoteRequest(context);
    const pricedAnalysis = {
      ...analysis,
      scenarios: analysis.shouldGenerateQuote
        ? priceScenarios({
            scenarios: analysis.scenarios,
            rateCards: activeRateCards,
            pmPercentage: settings.pmPercentage,
            riskBufferPercentage: settings.riskBufferPercentage,
          })
        : [],
    };
    const quoteRun = await createQuoteRun({
      clientRequestId: id,
      analysis: pricedAnalysis
    });

    return NextResponse.json({
      requestId: id,
      quoteRunId: quoteRun.id,
      inputHash: createInputHash(textToAnalyze),
      promptVersion: QUOTE_ANALYSIS_PROMPT_VERSION,
      rateCards: activeRateCards,
      pmPercentage: settings.pmPercentage,
      riskBufferPercentage: settings.riskBufferPercentage,
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
