export type Seniority =
  | "Junior"
  | "Mid"
  | "Senior"
  | "Specialist"
  | string;

export type RateCard = {
  id: string;
  roleName: string;
  seniority: Seniority;
  hourlyRateEur: number;
  competenceScope: string;
};

export type RoleEffort = {
  roleName: string;
  seniority: Seniority;
  estimatedHoursMin: number;
  estimatedHoursExpected: number;
  estimatedHoursMax: number;
  rationale: string;
};

export type QuoteTask = {
  title: string;
  description?: string | null;
  userStory?: string | null;
  acceptanceCriteria: string[];
  efforts: RoleEffort[];
};

export type QuoteModule = {
  name: string;
  description: string;
  complexity: "low" | "medium" | "high";
  isOptional: boolean;
  isIncludedByDefault: boolean;
  dependencyNotes?: string | null;
  riskNotes?: string | null;
  tasks: QuoteTask[];
};

export type QuoteRisk = {
  label: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
};

export type QuoteScenarioFromAi = {
  name: string;
  slug: string;
  scenarioType: "base" | "alternative" | "premium" | "lean";
  description: string;
  assumptions: string[];
  exclusions: string[];
  risks: QuoteRisk[];
  confidence: number;
  estimatedWeeksMin: number;
  estimatedWeeksExpected: number;
  estimatedWeeksMax: number;
  modules: QuoteModule[];
  displayOptions?: {
    showHours?: boolean;
    showHourlyRate?: boolean;
  };
};

export type PricedEffort = RoleEffort & {
  id?: string;
  roleRateCardId: string;
  hourlyRateEur: number;
  costEur: number;
};

export type PricedTask = Omit<QuoteTask, "efforts"> & {
  id?: string;
  efforts: PricedEffort[];
  subtotalEur: number;
};

export type PricedModule = Omit<QuoteModule, "tasks"> & {
  id?: string;
  isIncluded: boolean;
  tasks: PricedTask[];
  subtotalEur: number;
};

export type ScenarioTotals = {
  subtotalEur: number;
  nonPmHours: number;
  pmHours: number;
  pmCostEur: number;
  riskBufferEur: number;
  totalEur: number;
};

export type PricedScenario = Omit<QuoteScenarioFromAi, "modules"> & {
  id: string;
  modules: PricedModule[];
  totals: ScenarioTotals;
  roleBreakdown: PricedRoleBreakdown[];
  isApproved?: boolean;
  displayOptions?: {
    showHours?: boolean;
    showHourlyRate?: boolean;
  };
};

export type PricedRoleBreakdown = {
  roleRateCardId: string;
  roleName: string;
  seniority: string;
  hours: number;
  hourlyRateEur: number;
  costEur: number;
};

export type ClarificationQuestion = {
  question: string;
  reason: string;
  impact: string;
  priority: "blocking" | "important" | "nice_to_have";
  answer?: string | null;
};

export type AnalysisOutput = {
  summary: string;
  detectedBudgetEur: number | null;
  detectedDeadline: string | null;
  detectedTimelineText: string | null;
  blockingQuestions: ClarificationQuestion[];
  importantQuestions: ClarificationQuestion[];
  shouldGenerateQuote: boolean;
  scenarios: QuoteScenarioFromAi[];
};

export type PricedAnalysisOutput = Omit<AnalysisOutput, "scenarios"> & {
  scenarios: PricedScenario[];
};
