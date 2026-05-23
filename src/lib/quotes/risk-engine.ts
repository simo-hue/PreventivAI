import type { PricedScenario } from "./types";

export type RiskSignal = {
  label: string;
  severity: "low" | "medium" | "high";
  detail: string;
};

export function evaluateScenarioRisk(args: {
  scenario: PricedScenario;
  budgetEur: number | null;
  requestedTimelineText: string | null;
}): RiskSignal[] {
  const risks: RiskSignal[] = [];

  if (args.budgetEur && args.scenario.totals.totalEur > args.budgetEur) {
    const delta = args.scenario.totals.totalEur - args.budgetEur;
    risks.push({
      label: "Budget superato",
      severity: delta / args.budgetEur > 0.25 ? "high" : "medium",
      detail: `Lo scenario supera il budget cliente di ${formatDelta(delta)}.`,
    });
  }

  if (args.requestedTimelineText) {
    const monthsMatch = args.requestedTimelineText.match(/(\d+)\s*mesi?/i);
    if (monthsMatch) {
      const requestedWeeks = Number(monthsMatch[1]) * 4;
      if (args.scenario.estimatedWeeksExpected > requestedWeeks) {
        risks.push({
          label: "Timeline aggressiva",
          severity:
            args.scenario.estimatedWeeksExpected > requestedWeeks * 1.3
              ? "high"
              : "medium",
          detail: `La timeline attesa e' ${args.scenario.estimatedWeeksExpected} settimane contro circa ${requestedWeeks} richieste.`,
        });
      }
    }
  }

  if (args.scenario.confidence < 0.65) {
    risks.push({
      label: "Confidenza bassa",
      severity: "medium",
      detail:
        "La richiesta contiene ambiguita' che possono cambiare scope e stima.",
    });
  }

  return risks;
}

function formatDelta(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}
