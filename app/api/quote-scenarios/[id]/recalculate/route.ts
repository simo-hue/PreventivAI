import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_PM_PERCENTAGE } from "@/src/lib/demo/rate-card";
import { getActiveRateCards } from "@/src/server/repositories/rate-card-repository";
import { recalculateScenario } from "@/src/lib/quotes/pricing-engine";
import type { PricedScenario } from "@/src/lib/quotes/types";

const RecalculateSchema = z.object({
  scenario: z.custom<PricedScenario>(),
  moduleInclusionOverrides: z.record(z.string(), z.boolean()).default({}),
  riskBufferPercentage: z.number().min(0).max(1).default(0),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = RecalculateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload ricalcolo non valido.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const activeRateCards = await getActiveRateCards();

  const scenario = recalculateScenario(
    parsed.data.scenario,
    activeRateCards,
    DEFAULT_PM_PERCENTAGE,
    parsed.data.moduleInclusionOverrides,
    parsed.data.riskBufferPercentage,
  );

  return NextResponse.json({ scenario });
}
