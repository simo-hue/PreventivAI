import { describe, expect, it } from "vitest";
import { AnalysisOutputSchema } from "@/src/lib/ai/schemas";
import { demoAnalysis } from "@/src/lib/demo/sample-analysis";

describe("AnalysisOutputSchema", () => {
  it("accepts a valid demo analysis", () => {
    expect(AnalysisOutputSchema.parse(demoAnalysis)).toBeTruthy();
  });

  it("rejects quote generation without scenarios", () => {
    const parsed = AnalysisOutputSchema.safeParse({
      ...demoAnalysis,
      shouldGenerateQuote: true,
      scenarios: [],
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid effort bounds", () => {
    const invalid = structuredClone(demoAnalysis);
    invalid.scenarios[0].modules[0].tasks[0].efforts[0].estimatedHoursMin = 20;
    invalid.scenarios[0].modules[0].tasks[0].efforts[0].estimatedHoursExpected = 10;

    expect(AnalysisOutputSchema.safeParse(invalid).success).toBe(false);
  });
});
