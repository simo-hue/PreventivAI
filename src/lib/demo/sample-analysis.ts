import { AnalysisOutputSchema } from "@/src/lib/ai/schemas";
import type { AnalysisOutput } from "@/src/lib/quotes/types";

export const DEMO_BRIEF_TEXT = `Ciao! Vogliamo lanciare una piattaforma MVP per la nostra startup di Delivery di cibo per animali a domicilio. Gli utenti devono registrare il proprio animale, ricevere consigli per il piano alimentare, abbonarsi al cibo con pagamenti ricorrenti e tracciare le consegne. Ci piacerebbe anche una parte social per pet owners. Budget massimo intorno ai 25.000€ e dobbiamo essere online tassativamente entro 3 mesi.`;

const baseModules = [
  {
    name: "Onboarding utente e profilo animale",
    description:
      "Registrazione, login, profilo proprietario, anagrafica animale e preferenze alimentari.",
    complexity: "medium" as const,
    isOptional: false,
    isIncludedByDefault: true,
    tasks: [
      {
        title: "Flusso di registrazione e profilo animale",
        description:
          "User flow, schermate principali, modelli dati e API per gestire utenti e animali.",
        userStory:
          "Come pet owner voglio registrare il mio animale per ricevere piani e consegne coerenti.",
        acceptanceCriteria: [
          "L'utente puo' creare e modificare un profilo animale.",
          "I campi minimi per taglia, eta' e preferenze sono validati.",
        ],
        efforts: [
          {
            roleName: "UX/UI Designer",
            seniority: "Senior",
            estimatedHoursMin: 10,
            estimatedHoursExpected: 14,
            estimatedHoursMax: 18,
            rationale: "Definizione user flow e wireframe principali.",
          },
          {
            roleName: "Full-Stack / Backend Developer",
            seniority: "Senior",
            estimatedHoursMin: 18,
            estimatedHoursExpected: 24,
            estimatedHoursMax: 32,
            rationale: "API auth, profili, validazioni e persistenza.",
          },
          {
            roleName: "Frontend Developer",
            seniority: "Mid",
            estimatedHoursMin: 18,
            estimatedHoursExpected: 26,
            estimatedHoursMax: 34,
            rationale: "Implementazione schermate responsive e stati form.",
          },
        ],
      },
    ],
  },
  {
    name: "Abbonamento e pagamenti ricorrenti Stripe",
    description:
      "Catalogo MVP, piano alimentare non clinico, subscription checkout e webhook Stripe Billing.",
    complexity: "high" as const,
    isOptional: false,
    isIncludedByDefault: true,
    dependencyNotes:
      "La logica nutrizionale deve essere fornita dal cliente o limitata a regole editoriali non cliniche.",
    riskNotes:
      "Scope e compliance cambiano se il consiglio alimentare diventa medico/veterinario.",
    tasks: [
      {
        title: "Configurazione subscription commerce",
        description:
          "Piani, checkout, customer portal, webhook e stato abbonamento.",
        userStory:
          "Come cliente voglio sottoscrivere un piano ricorrente e aggiornare il metodo di pagamento.",
        acceptanceCriteria: [
          "Il checkout Stripe crea un abbonamento ricorrente.",
          "I webhook aggiornano lo stato ordine/abbonamento.",
          "Il cliente puo' consultare il piano attivo.",
        ],
        efforts: [
          {
            roleName: "Software Architect",
            seniority: "Specialist",
            estimatedHoursMin: 6,
            estimatedHoursExpected: 8,
            estimatedHoursMax: 12,
            rationale:
              "Disegno dati, sicurezza webhook e confini tra catalogo e subscription.",
          },
          {
            roleName: "Full-Stack / Backend Developer",
            seniority: "Senior",
            estimatedHoursMin: 28,
            estimatedHoursExpected: 38,
            estimatedHoursMax: 52,
            rationale: "Integrazione Stripe Billing, webhook, API e stati ordine.",
          },
          {
            roleName: "Frontend Developer",
            seniority: "Mid",
            estimatedHoursMin: 14,
            estimatedHoursExpected: 20,
            estimatedHoursMax: 28,
            rationale: "Checkout handoff, area abbonamento e stati pagamento.",
          },
        ],
      },
    ],
  },
  {
    name: "Dashboard operativa rider e consegne",
    description:
      "Vista interna per ordini, assegnazione consegne, stato delivery e link a mappe esterne.",
    complexity: "high" as const,
    isOptional: false,
    isIncludedByDefault: true,
    dependencyNotes:
      "La mappa e il tracking real-time sono basati su provider esterno nel perimetro MVP.",
    tasks: [
      {
        title: "Backoffice consegne MVP",
        description:
          "Lista ordini, cambio stato, assegnazione rider e link di navigazione.",
        acceptanceCriteria: [
          "Un operatore vede ordini aperti e storico essenziale.",
          "Un ordine puo' passare tra stati operativi tracciati.",
          "Il rider riceve un indirizzo o link mappa.",
        ],
        efforts: [
          {
            roleName: "UX/UI Designer",
            seniority: "Senior",
            estimatedHoursMin: 8,
            estimatedHoursExpected: 12,
            estimatedHoursMax: 16,
            rationale: "Flusso operativo e schermate dense per backoffice.",
          },
          {
            roleName: "Full-Stack / Backend Developer",
            seniority: "Senior",
            estimatedHoursMin: 24,
            estimatedHoursExpected: 34,
            estimatedHoursMax: 46,
            rationale: "Workflow stati, permessi, query operative e audit minimo.",
          },
          {
            roleName: "Frontend Developer",
            seniority: "Mid",
            estimatedHoursMin: 22,
            estimatedHoursExpected: 32,
            estimatedHoursMax: 44,
            rationale: "Dashboard operativa responsive e filtri.",
          },
        ],
      },
    ],
  },
  {
    name: "QA, deploy e hardening demo",
    description:
      "Test principali, controllo regressioni, deploy applicativo e monitoraggio base.",
    complexity: "medium" as const,
    isOptional: false,
    isIncludedByDefault: true,
    tasks: [
      {
        title: "Qualita' e go-live MVP",
        description:
          "Test funzionali, fix bug, pipeline deploy e configurazione ambiente.",
        acceptanceCriteria: [
          "Flussi critici testati end-to-end.",
          "Ambiente production configurato con variabili segrete.",
          "Runbook minimo di go-live disponibile.",
        ],
        efforts: [
          {
            roleName: "QA / Tester Engineer",
            seniority: "Mid",
            estimatedHoursMin: 18,
            estimatedHoursExpected: 26,
            estimatedHoursMax: 36,
            rationale: "Test dei flussi account, checkout, subscription e backoffice.",
          },
          {
            roleName: "DevOps Engineer",
            seniority: "Senior",
            estimatedHoursMin: 8,
            estimatedHoursExpected: 12,
            estimatedHoursMax: 18,
            rationale: "Deploy, env, storage, monitoraggio e backup base.",
          },
        ],
      },
    ],
  },
];

const socialModule = {
  name: "Community social pet owners",
  description:
    "Feed leggero, profilo pubblico, post con immagini e moderazione base.",
  complexity: "high" as const,
  isOptional: true,
  isIncludedByDefault: false,
  riskNotes:
    "Moderazione, privacy e upload media possono far crescere velocemente lo scope.",
  tasks: [
    {
      title: "Modulo social MVP",
      description:
        "Funzioni minime per pubblicare contenuti e visualizzare un feed.",
      acceptanceCriteria: [
        "Gli utenti possono creare e cancellare un post.",
        "Il feed mostra contenuti recenti con moderazione manuale base.",
      ],
      efforts: [
        {
          roleName: "UX/UI Designer",
          seniority: "Senior",
          estimatedHoursMin: 8,
          estimatedHoursExpected: 12,
          estimatedHoursMax: 18,
          rationale: "Pattern UI social e stati empty/moderazione.",
        },
        {
          roleName: "Full-Stack / Backend Developer",
          seniority: "Senior",
          estimatedHoursMin: 26,
          estimatedHoursExpected: 44,
          estimatedHoursMax: 60,
          rationale: "Post, media, privacy, moderazione e API feed.",
        },
        {
          roleName: "Frontend Developer",
          seniority: "Mid",
          estimatedHoursMin: 22,
          estimatedHoursExpected: 36,
          estimatedHoursMax: 48,
          rationale: "Feed, composer, profilo pubblico e upload UI.",
        },
        {
          roleName: "QA / Tester Engineer",
          seniority: "Mid",
          estimatedHoursMin: 8,
          estimatedHoursExpected: 14,
          estimatedHoursMax: 20,
          rationale: "Test contenuti, permessi e regressioni UI.",
        },
      ],
    },
  ],
};

export const demoAnalysis: AnalysisOutput = AnalysisOutputSchema.parse({
  summary:
    "La richiesta descrive un MVP subscription commerce per delivery di cibo per animali con profilo animale, pagamenti ricorrenti, backoffice consegne e possibile community social. Budget e timeline sono stretti: conviene separare un perimetro lean presentabile da estensioni custom.",
  detectedBudgetEur: 25000,
  detectedDeadline: null,
  detectedTimelineText: "3 mesi",
  blockingQuestions: [],
  importantQuestions: [
    {
      question:
        "E' accettabile una PWA responsive per l'MVP o serve pubblicazione su App Store e Play Store?",
      reason: "La scelta cambia costi, tempi di QA e processo di rilascio.",
      impact:
        "App native o store submission possono richiedere budget e timeline aggiuntivi.",
      priority: "important",
    },
    {
      question:
        "Chi fornisce catalogo prodotti e regole nutrizionali per il piano alimentare?",
      reason:
        "La logica nutrizionale non puo' essere inventata senza responsabilita' di dominio.",
      impact:
        "Se serve algoritmo clinico certificato, lo scope diventa specialistico.",
      priority: "important",
    },
    {
      question:
        "Esiste gia' un sistema logistico/rider da integrare o il backoffice va creato da zero?",
      reason: "Integrazioni proprietarie senza API possono diventare bloccanti.",
      impact: "La stima lean assume backoffice interno semplice.",
      priority: "important",
    },
  ],
  shouldGenerateQuote: true,
  scenarios: [
    {
      name: "MVP Lean PWA",
      slug: "mvp-lean-pwa",
      scenarioType: "lean",
      description:
        "Perimetro essenziale per andare online entro 3 mesi usando PWA, Stripe Billing standard e backoffice operativo minimo.",
      assumptions: [
        "App cross-platform come PWA responsive, non due native separate.",
        "Design system essenziale e componenti riusabili.",
        "Stripe Billing standard senza logiche fiscali custom complesse.",
        "Mappe e navigazione tramite provider esterno.",
        "La sezione social e' esclusa dal lancio iniziale.",
      ],
      exclusions: [
        "Algoritmo nutrizionale clinico certificato.",
        "Tracking rider real-time proprietario.",
        "App native iOS/Android e submission store.",
      ],
      risks: [
        {
          label: "Budget e timeline stretti",
          severity: "medium",
          mitigation:
            "Bloccare lo scope MVP e gestire social/tracking avanzato come fase 2.",
        },
      ],
      confidence: 0.74,
      estimatedWeeksMin: 8,
      estimatedWeeksExpected: 11,
      estimatedWeeksMax: 13,
      modules: [...baseModules, socialModule],
    },
    {
      name: "MVP Custom Operations",
      slug: "mvp-custom-operations",
      scenarioType: "base",
      description:
        "Include maggiore robustezza backend e backoffice piu' completo per gestire catalogo, ordini, consegne e audit operativo.",
      assumptions: [
        "PWA responsive con architettura pronta a future app native.",
        "Backoffice creato da zero con ruoli e permessi interni.",
        "Integrazione Stripe Billing standard.",
        "Community social esclusa dal go-live.",
      ],
      exclusions: [
        "Ottimizzazione route rider avanzata.",
        "Moderazione social e upload media community.",
        "Integrazioni con gestionali proprietari non documentati.",
      ],
      risks: [
        {
          label: "Possibile extra scope operativo",
          severity: "medium",
          mitigation:
            "Formalizzare stati consegna e responsabilita' operative prima dello sviluppo.",
        },
      ],
      confidence: 0.68,
      estimatedWeeksMin: 10,
      estimatedWeeksExpected: 13,
      estimatedWeeksMax: 16,
      modules: [
        ...baseModules,
        {
          name: "Permessi e audit operativo avanzato",
          description:
            "Ruoli interni, log modifiche su ordini e controlli per operazioni customer care.",
          complexity: "medium" as const,
          isOptional: true,
          isIncludedByDefault: true,
          tasks: [
            {
              title: "Controlli operativi avanzati",
              description:
                "Ruoli, permessi, audit log e viste di controllo per ordini critici.",
              acceptanceCriteria: [
                "I ruoli interni limitano accesso e azioni.",
                "Le modifiche di stato sono tracciate.",
              ],
              efforts: [
                {
                  roleName: "Software Architect",
                  seniority: "Specialist",
                  estimatedHoursMin: 4,
                  estimatedHoursExpected: 6,
                  estimatedHoursMax: 10,
                  rationale: "Modello permessi e audit trail.",
                },
                {
                  roleName: "Full-Stack / Backend Developer",
                  seniority: "Senior",
                  estimatedHoursMin: 18,
                  estimatedHoursExpected: 26,
                  estimatedHoursMax: 36,
                  rationale: "Policy backend, API e log operativi.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Premium con Community",
      slug: "premium-community",
      scenarioType: "premium",
      description:
        "Scenario completo con MVP commerce, backoffice e community social inclusa nel primo rilascio.",
      assumptions: [
        "Timeline estesa o team parallelo per gestire social e moderazione.",
        "Policy contenuti e privacy definite prima dello sviluppo.",
        "Storage media e moderazione manuale base inclusi.",
      ],
      exclusions: [
        "Moderazione AI avanzata.",
        "Marketplace tra utenti.",
        "App native separate.",
      ],
      risks: [
        {
          label: "Scope creep community",
          severity: "high",
          mitigation:
            "Separare social in milestone autonoma con criteri di accettazione rigidi.",
        },
      ],
      confidence: 0.6,
      estimatedWeeksMin: 13,
      estimatedWeeksExpected: 17,
      estimatedWeeksMax: 21,
      modules: [...baseModules, { ...socialModule, isIncludedByDefault: true }],
    },
  ],
});

export function buildBlockingClarificationAnalysis(requestText: string): AnalysisOutput {
  return AnalysisOutputSchema.parse({
    summary:
      "La richiesta contiene segnali di progetto software ma mancano decisioni critiche che impediscono una stima responsabile.",
    detectedBudgetEur: detectBudget(requestText),
    detectedDeadline: null,
    detectedTimelineText: detectTimeline(requestText),
    blockingQuestions: [
      {
        question:
          "Il prodotto deve essere una web app/PWA o una app mobile pubblicata sugli store?",
        reason:
          "Canale e distribuzione determinano architettura, QA e processo di rilascio.",
        impact:
          "Senza questa scelta la stima puo' variare in modo sostanziale.",
        priority: "blocking",
      },
      {
        question:
          "Sono presenti dati sensibili, pagamenti, dati sanitari o vincoli privacy specifici?",
        reason:
          "I requisiti compliance possono cambiare architettura, sicurezza e tempi.",
        impact: "Serve chiarire prima di generare un preventivo finale.",
        priority: "blocking",
      },
    ],
    importantQuestions: [],
    shouldGenerateQuote: false,
    scenarios: [],
  });
}

export function shouldUseDemoAnalysis(text: string) {
  const normalized = text.toLowerCase();
  return (
    normalized.includes("animali") ||
    normalized.includes("pet") ||
    normalized.includes("delivery") ||
    normalized.includes("stripe") ||
    normalized.includes("abbon")
  );
}

function detectBudget(text: string) {
  const match = text.match(/(\d{1,3}(?:[.\s]\d{3})+|\d+)\s*(?:€|eur|euro)/i);
  if (!match) {
    return null;
  }

  return Number(match[1].replace(/[.\s]/g, ""));
}

function detectTimeline(text: string) {
  const match = text.match(/(\d+)\s*(mesi?|settimane?|weeks?)/i);
  return match ? match[0] : null;
}
