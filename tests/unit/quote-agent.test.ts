import { describe, expect, it, vi } from "vitest";
import { createPromptContext } from "@/src/lib/ai/quote-agent";
import { DEFAULT_PM_PERCENTAGE, officialRateCards } from "@/src/lib/demo/rate-card";

vi.mock("server-only", () => ({}));

describe("createPromptContext", () => {
  it("keeps pricing inputs out of the LLM prompt context", () => {
    const context = createPromptContext({
      requestText: "Richiesta cliente per MVP marketplace B2B con checkout.",
      rateCards: officialRateCards,
      similarHistoricalProjects: [],
      pmPercentage: DEFAULT_PM_PERCENTAGE,
    });

    expect(context.rateCard[0]).not.toHaveProperty("hourlyRateEur");
  });
});
