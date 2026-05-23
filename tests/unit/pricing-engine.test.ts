import { describe, expect, it } from "vitest";
import { demoAnalysis } from "@/src/lib/demo/sample-analysis";
import { DEFAULT_PM_PERCENTAGE, officialRateCards } from "@/src/lib/demo/rate-card";
import { priceScenarios, PricingError } from "@/src/lib/quotes/pricing-engine";

describe("pricing-engine", () => {
  it("calculates scenario totals from included modules and PM percentage", () => {
    const [scenario] = priceScenarios({
      scenarios: [demoAnalysis.scenarios[0]],
      rateCards: officialRateCards,
      pmPercentage: DEFAULT_PM_PERCENTAGE,
    });

    expect(scenario?.totals.subtotalEur).toBeGreaterThan(0);
    expect(scenario?.totals.pmHours).toBe(
      Math.ceil((scenario?.totals.nonPmHours ?? 0) * DEFAULT_PM_PERCENTAGE),
    );
    expect(scenario?.totals.totalEur).toBe(
      (scenario?.totals.subtotalEur ?? 0) + (scenario?.totals.pmCostEur ?? 0),
    );
  });

  it("excludes optional modules by default when not included", () => {
    const premium = priceScenarios({
      scenarios: [demoAnalysis.scenarios[0]],
      rateCards: officialRateCards,
      pmPercentage: DEFAULT_PM_PERCENTAGE,
    })[0];

    const optional = premium?.modules.find((module) => module.isOptional);

    expect(optional?.isIncluded).toBe(false);
    expect(optional?.subtotalEur).toBeGreaterThan(0);
    expect(premium?.totals.totalEur).toBeLessThan(
      (premium?.totals.subtotalEur ?? 0) +
        (premium?.totals.pmCostEur ?? 0) +
        (optional?.subtotalEur ?? 0),
    );
  });

  it("updates totals when an optional module is toggled on", () => {
    const baseline = priceScenarios({
      scenarios: [demoAnalysis.scenarios[0]],
      rateCards: officialRateCards,
      pmPercentage: DEFAULT_PM_PERCENTAGE,
    })[0];
    const optional = baseline?.modules.find((module) => module.isOptional);

    const [withOptional] = priceScenarios({
      scenarios: [demoAnalysis.scenarios[0]],
      rateCards: officialRateCards,
      pmPercentage: DEFAULT_PM_PERCENTAGE,
      moduleInclusionOverrides: optional ? { [optional.id!]: true } : {},
    });

    expect(withOptional?.totals.totalEur).toBeGreaterThan(
      baseline?.totals.totalEur ?? 0,
    );
  });

  it("fails when a role is not mapped in the rate card", () => {
    expect(() =>
      priceScenarios({
        scenarios: [
          {
            ...demoAnalysis.scenarios[0],
            modules: [
              {
                ...demoAnalysis.scenarios[0].modules[0],
                tasks: [
                  {
                    ...demoAnalysis.scenarios[0].modules[0].tasks[0],
                    efforts: [
                      {
                        roleName: "Invented Role",
                        seniority: "Senior",
                        estimatedHoursMin: 1,
                        estimatedHoursExpected: 2,
                        estimatedHoursMax: 3,
                        rationale: "Should fail",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        rateCards: officialRateCards,
        pmPercentage: DEFAULT_PM_PERCENTAGE,
      }),
    ).toThrow(PricingError);
  });
});
