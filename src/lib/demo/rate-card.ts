import type { RateCard } from "@/src/lib/quotes/types";

export const DEMO_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_PM_PERCENTAGE = 0.1;

export const officialRateCards: RateCard[] = [
  {
    id: "rate-pm-senior",
    roleName: "Product Manager / Agile Coach",
    seniority: "Senior",
    hourlyRateEur: 85,
    competenceScope: "Gestione progetto, roadmap, definizione requisiti.",
  },
  {
    id: "rate-ux-senior",
    roleName: "UX/UI Designer",
    seniority: "Senior",
    hourlyRateEur: 75,
    competenceScope: "Wireframe, user flow, design dell'interfaccia.",
  },
  {
    id: "rate-ux-junior",
    roleName: "UX/UI Designer",
    seniority: "Junior",
    hourlyRateEur: 45,
    competenceScope: "Declinazione grafiche, piccoli adattamenti, icone.",
  },
  {
    id: "rate-architect-specialist",
    roleName: "Software Architect",
    seniority: "Specialist",
    hourlyRateEur: 95,
    competenceScope: "Progettazione database, infrastruttura Cloud, sicurezza.",
  },
  {
    id: "rate-backend-senior",
    roleName: "Full-Stack / Backend Developer",
    seniority: "Senior",
    hourlyRateEur: 70,
    competenceScope: "Sviluppo logica core, API, integrazioni complesse.",
  },
  {
    id: "rate-frontend-mid",
    roleName: "Frontend Developer",
    seniority: "Mid",
    hourlyRateEur: 55,
    competenceScope: "Sviluppo interfaccia web/mobile, animazioni, reattivita'.",
  },
  {
    id: "rate-qa-mid",
    roleName: "QA / Tester Engineer",
    seniority: "Mid",
    hourlyRateEur: 50,
    competenceScope: "Test automatizzati, bug hunting, controllo qualita'.",
  },
  {
    id: "rate-devops-senior",
    roleName: "DevOps Engineer",
    seniority: "Senior",
    hourlyRateEur: 80,
    competenceScope: "Deploy su AWS/Azure, CI/CD pipelines, ottimizzazione server.",
  },
];
