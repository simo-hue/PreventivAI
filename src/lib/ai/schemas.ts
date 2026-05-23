import { z } from "zod";

export const RoleEffortSchema = z
  .object({
    roleName: z.string().min(1),
    seniority: z.string().min(1),
    rationale: z.string().min(1),
    estimatedHoursMin: z.number().nonnegative(),
    estimatedHoursExpected: z.number().nonnegative(),
    estimatedHoursMax: z.number().nonnegative(),
  })
  .refine(
    (value) =>
      value.estimatedHoursMin <= value.estimatedHoursExpected &&
      value.estimatedHoursExpected <= value.estimatedHoursMax,
    {
      message: "Expected hours must be between min and max hours.",
      path: ["estimatedHoursExpected"],
    },
  );

export const QuoteTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  userStory: z.string().optional().nullable(),
  acceptanceCriteria: z.array(z.string()).default([]),
  efforts: z.array(RoleEffortSchema).default([]),
});

export const QuoteModuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  complexity: z.enum(["low", "medium", "high"]),
  isOptional: z.boolean(),
  isIncludedByDefault: z.boolean(),
  dependencyNotes: z.string().optional().nullable(),
  riskNotes: z.string().optional().nullable(),
  tasks: z.array(QuoteTaskSchema).default([]),
});

export const ClarificationQuestionSchema = z.object({
  question: z.string().min(1),
  reason: z.string().min(1),
  impact: z.string().min(1),
  priority: z.enum(["blocking", "important", "nice_to_have"]),
  answer: z.string().optional().nullable(),
});

export const QuoteScenarioSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    scenarioType: z.enum(["base", "alternative", "premium", "lean"]),
    description: z.string().min(1),
    assumptions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([]),
    risks: z
      .array(
        z.object({
          label: z.string().min(1),
          severity: z.enum(["low", "medium", "high"]),
          mitigation: z.string().min(1),
        }),
      )
      .default([]),
    confidence: z.number().min(0).max(1),
    estimatedWeeksMin: z.number().positive(),
    estimatedWeeksExpected: z.number().positive(),
    estimatedWeeksMax: z.number().positive(),
    modules: z.array(QuoteModuleSchema).default([]),
  })
  .refine(
    (value) =>
      value.estimatedWeeksMin <= value.estimatedWeeksExpected &&
      value.estimatedWeeksExpected <= value.estimatedWeeksMax,
    {
      message: "Expected weeks must be between min and max weeks.",
      path: ["estimatedWeeksExpected"],
    },
  );

export const AnalysisOutputSchema = z
  .object({
    summary: z.string().min(1),
    detectedBudgetEur: z.number().nullable(),
    detectedDeadline: z.string().nullable(),
    detectedTimelineText: z.string().nullable(),
    blockingQuestions: z.array(ClarificationQuestionSchema).default([]),
    importantQuestions: z.array(ClarificationQuestionSchema).default([]),
    shouldGenerateQuote: z.boolean(),
    scenarios: z.array(QuoteScenarioSchema).default([]),
  })
  .superRefine((value, context) => {
    if (value.shouldGenerateQuote && value.scenarios.length === 0) {
      context.addIssue({
        code: "custom",
        message: "At least one scenario is required when quote generation is enabled.",
        path: ["scenarios"],
      });
    }

    if (!value.shouldGenerateQuote && value.blockingQuestions.length === 0) {
      context.addIssue({
        code: "custom",
        message:
          "Blocking questions are required when quote generation is disabled.",
        path: ["blockingQuestions"],
      });
    }
  });

export type AnalysisOutputFromSchema = z.infer<typeof AnalysisOutputSchema>;

export const ValidateReplySchema = z.object({
  isValid: z.boolean().describe("True se il cliente ha risposto alle domande, false se il messaggio è irrilevante o non contiene le risposte necessarie."),
  aiResponse: z.string().describe("Il messaggio che l'AI manderà al cliente. Se isValid è false, spiegherà cosa manca. Se isValid è true, sarà 'Grazie, ora con queste informazioni aggiorno il preventivo'."),
});

export type ValidateReplyOutput = z.infer<typeof ValidateReplySchema>;
