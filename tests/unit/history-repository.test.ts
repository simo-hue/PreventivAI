import { describe, expect, it, vi } from "vitest";
import { demoHistoricalProjects } from "@/src/lib/demo/history";
import {
  getSimilarHistoricalProjects,
  normalizeHistoricalProjectsForPrompt,
} from "@/src/server/repositories/history-repository";

vi.mock("server-only", () => ({}));

describe("history-repository", () => {
  it("falls back to demo fixtures when Supabase is not configured", async () => {
    const projects = await getSimilarHistoricalProjects({
      organizationId: "00000000-0000-0000-0000-000000000001",
      requestText: "Marketplace B2B con pagamenti Stripe Connect",
      limit: 1,
      supabase: null,
    });

    expect(projects).toHaveLength(1);
    expect(projects[0]?.projectName).toBe(demoHistoricalProjects[0].projectName);
  });

  it("normalizes historical rows into the compact prompt payload", () => {
    const projects = normalizeHistoricalProjectsForPrompt(
      [
        {
          id: "history-1",
          project_name: "  CRM sanitario  ",
          client_industry: "Healthcare",
          project_type: "Web app",
          description: " CRM per gestione appuntamenti e cartelle pazienti. ",
          initial_request: "Serve un CRM per una clinica.",
          delivered_scope: "Dashboard, auth, calendario e report.",
          total_actual_hours: "123.5",
          total_quoted_eur: 90000,
          delivery_weeks: "8",
          risk_notes: "Integrazione gestionale da chiarire.",
          tags: ["crm", "healthcare"],
          created_at: "2026-05-01T00:00:00.000Z",
          historical_project_modules: [
            {
              module_name: "  Calendario visite ",
              module_description: "Slot, disponibilita' e notifiche.",
              complexity: "medium",
              actual_hours_by_role: {
                "Frontend Developer|Mid": "18",
                "Full-Stack / Backend Developer|Senior": 26,
                "Invalid Role": -3,
              },
              notes: "Le notifiche hanno richiesto discovery.",
            },
          ],
        },
      ],
      { requestText: "CRM healthcare calendario", limit: 5 },
    );

    expect(projects).toEqual([
      {
        projectName: "CRM sanitario",
        clientIndustry: "Healthcare",
        projectType: "Web app",
        description: "CRM per gestione appuntamenti e cartelle pazienti.",
        initialRequest: "Serve un CRM per una clinica.",
        deliveredScope: "Dashboard, auth, calendario e report.",
        tags: ["crm", "healthcare"],
        modules: [
          {
            moduleName: "Calendario visite",
            description: "Slot, disponibilita' e notifiche.",
            complexity: "medium",
            actualHoursByRole: {
              "Frontend Developer|Mid": 18,
              "Full-Stack / Backend Developer|Senior": 26,
            },
            notes: "Le notifiche hanno richiesto discovery.",
          },
        ],
        totalActualHours: 123.5,
        deliveryWeeks: 8,
        riskNotes: "Integrazione gestionale da chiarire.",
      },
    ]);
    expect("totalQuotedEur" in (projects[0] as Record<string, unknown>)).toBe(false);
  });

  it("limits the number of historical projects passed to the prompt", () => {
    const rows = Array.from({ length: 8 }, (_, index) => ({
      id: `history-${index}`,
      project_name: `CRM ${index}`,
      description: "Gestionale CRM con dashboard e report.",
      client_industry: index === 7 ? "Healthcare" : "Retail",
      project_type: "Web app",
      created_at: `2026-05-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
      historical_project_modules: [],
    }));

    const projects = normalizeHistoricalProjectsForPrompt(rows, {
      requestText: "CRM retail dashboard",
      limit: 3,
    });

    expect(projects).toHaveLength(3);
  });
});
