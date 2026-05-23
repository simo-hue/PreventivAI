import { describe, expect, it } from "vitest";
import { demoAnalysis } from "@/src/lib/demo/sample-analysis";
import { DEFAULT_PM_PERCENTAGE, officialRateCards } from "@/src/lib/demo/rate-card";
import { priceScenarios } from "@/src/lib/quotes/pricing-engine";
import { evaluateScenarioRisk } from "@/src/lib/quotes/risk-engine";

describe("risk-engine", () => {
  it("flags budget overrun", () => {
    const [scenario] = priceScenarios({
      scenarios: [demoAnalysis.scenarios[2]],
      rateCards: officialRateCards,
      pmPercentage: DEFAULT_PM_PERCENTAGE,
    });

    const risks = evaluateScenarioRisk({
      scenario,
      budgetEur: 25000,
      requestedTimelineText: "3 mesi",
    });

    expect(risks.some((risk) => risk.label === "Budget superato")).toBe(true);
  });

  it("flags low confidence", () => {
    const [scenario] = priceScenarios({
      scenarios: [demoAnalysis.scenarios[2]],
      rateCards: officialRateCards,
      pmPercentage: DEFAULT_PM_PERCENTAGE,
    });

    const risks = evaluateScenarioRisk({
      scenario,
      budgetEur: null,
      requestedTimelineText: null,
    });

    expect(risks.some((risk) => risk.label === "Confidenza bassa")).toBe(true);
  });
});
