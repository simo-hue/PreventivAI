export type DemoHistoricalProject = {
  projectName: string;
  clientIndustry: string;
  projectType: string;
  description: string;
  modules: Array<{
    moduleName: string;
    complexity: string;
    actualHoursByRole: Record<string, number>;
    notes?: string;
  }>;
  totalActualHours: number;
  deliveryWeeks: number;
  riskNotes: string;
};

export const demoHistoricalProjects: DemoHistoricalProject[] = [
  {
    projectName: "Marketplace B2B",
    clientIndustry: "Retail",
    projectType: "Web app",
    description:
      "Marketplace multi-vendor con onboarding venditori, pagamenti Stripe Connect e dashboard amministrativa.",
    modules: [
      {
        moduleName: "Onboarding venditori",
        complexity: "medium",
        actualHoursByRole: {
          "UX/UI Designer|Senior": 12,
          "Full-Stack / Backend Developer|Senior": 28,
          "Frontend Developer|Mid": 24,
        },
      },
      {
        moduleName: "Pagamenti Stripe Connect",
        complexity: "high",
        actualHoursByRole: {
          "Software Architect|Specialist": 8,
          "Full-Stack / Backend Developer|Senior": 36,
          "QA / Tester Engineer|Mid": 12,
        },
      },
    ],
    totalActualHours: 220,
    deliveryWeeks: 10,
    riskNotes: "Le regole KYC hanno richiesto discovery aggiuntiva.",
  },
  {
    projectName: "Subscription food delivery",
    clientIndustry: "Food",
    projectType: "PWA + backend",
    description:
      "MVP subscription commerce con catalogo, Stripe Billing, area cliente e pannello operativo.",
    modules: [
      {
        moduleName: "Subscription e checkout",
        complexity: "medium",
        actualHoursByRole: {
          "Full-Stack / Backend Developer|Senior": 34,
          "Frontend Developer|Mid": 22,
          "QA / Tester Engineer|Mid": 10,
        },
      },
      {
        moduleName: "Pannello operativo",
        complexity: "medium",
        actualHoursByRole: {
          "UX/UI Designer|Senior": 10,
          "Full-Stack / Backend Developer|Senior": 26,
          "Frontend Developer|Mid": 28,
        },
      },
    ],
    totalActualHours: 190,
    deliveryWeeks: 9,
    riskNotes: "Catalogo prodotti e regole di ricorrenza devono essere definite presto.",
  },
];
