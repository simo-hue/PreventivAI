/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import crypto from "crypto";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { PricedAnalysisOutput } from "@/src/lib/quotes/types";
import { requireUser } from "@/src/lib/auth/require-user";

export async function createQuoteRun(args: {
  clientRequestId: string;
  analysis: PricedAnalysisOutput;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase non configurato");

  const user = await requireUser();
  const orgId = user.organizationId;
  const quoteRunId = crypto.randomUUID();

  // 1. Assicura che l'organizzazione esista (mock per demo e RLS)
  await admin.from("organizations").upsert({ id: orgId, name: "Demo Organization" });

  // 2. Inserimento Quote Run
  const status = args.analysis.shouldGenerateQuote ? "completed" : "needs_clarification";
  await admin.from("quote_runs").insert({
    id: quoteRunId,
    organization_id: orgId,
    client_request_id: args.clientRequestId,
    status,
    model_provider: "google",
    model_name: process.env.AI_MODEL ?? "gemini-3.5-flash",
    prompt_version: "quote-analysis.v1",
    llm_raw_response: args.analysis as any, // Salvataggio raw per sicurezza/debug
    completed_at: new Date().toISOString(),
  });

  // Aggiorna lo stato della richiesta
  await admin.from("client_requests").update({ 
    status: status === "completed" ? "quoted" : "needs_clarification" 
  }).eq("id", args.clientRequestId);

  // 3. Domande di chiarimento
  const questions = [
    ...args.analysis.blockingQuestions,
    ...args.analysis.importantQuestions,
  ];
  
  if (questions.length > 0) {
    const qInserts = questions.map(q => ({
      organization_id: orgId,
      client_request_id: args.clientRequestId,
      quote_run_id: quoteRunId,
      question: q.question,
      reason: q.reason,
      impact: q.impact,
      priority: args.analysis.blockingQuestions.includes(q) ? "blocking" : "important",
    }));
    await admin.from("clarification_questions").insert(qInserts);
  }

  // 4. Inserimento Scenari, Moduli, Task, Efforts in batch
  if (args.analysis.shouldGenerateQuote && args.analysis.scenarios.length > 0) {
    const uniqueRoles = new Set<string>();
    args.analysis.scenarios.forEach(s => 
      s.modules.forEach(m => 
        m.tasks.forEach(t => 
          t.efforts.forEach(e => 
            uniqueRoles.add(`${e.roleName}|${e.seniority}|${e.hourlyRateEur}`)
          )
        )
      )
    );
    
    // Upsert rate cards (per soddisfare la Foreign Key)
    const rateCardMap = new Map<string, string>();
    for (const r of uniqueRoles) {
      const [roleName, seniority, rate] = r.split("|");
      const { data } = await admin.from("role_rate_cards").upsert({
        organization_id: orgId,
        role_name: roleName,
        seniority,
        hourly_rate_eur: parseFloat(rate),
      }, { onConflict: 'organization_id, role_name, seniority, valid_from' }).select('id').single();
      if (data) rateCardMap.set(`${roleName}|${seniority}`, data.id);
    }

    const scenariosToInsert: any[] = [];
    const modulesToInsert: any[] = [];
    const tasksToInsert: any[] = [];
    const effortsToInsert: any[] = [];

    for (const scenario of args.analysis.scenarios) {
      const scenarioId = crypto.randomUUID();
      scenariosToInsert.push({
        id: scenarioId,
        organization_id: orgId,
        client_request_id: args.clientRequestId,
        quote_run_id: quoteRunId,
        name: scenario.name,
        slug: scenario.slug,
        description: scenario.description,
        scenario_type: scenario.scenarioType,
        assumptions: scenario.assumptions,
        exclusions: scenario.exclusions,
        risks: scenario.risks,
        confidence: scenario.confidence,
        estimated_weeks_min: scenario.estimatedWeeksMin,
        estimated_weeks_expected: scenario.estimatedWeeksExpected,
        estimated_weeks_max: scenario.estimatedWeeksMax,
        subtotal_eur: scenario.totals.subtotalEur,
        pm_cost_eur: scenario.totals.pmCostEur,
        risk_buffer_eur: scenario.totals.riskBufferEur,
        total_eur: scenario.totals.totalEur,
      });

      for (const [modIdx, mod] of scenario.modules.entries()) {
        const moduleId = crypto.randomUUID();
        modulesToInsert.push({
          id: moduleId,
          organization_id: orgId,
          quote_scenario_id: scenarioId,
          name: mod.name,
          description: mod.description,
          complexity: mod.complexity,
          is_optional: mod.isOptional,
          is_included: mod.isIncludedByDefault,
          dependency_notes: mod.dependencyNotes,
          risk_notes: mod.riskNotes,
          order_index: modIdx,
          subtotal_eur: mod.subtotalEur,
        });

        for (const [taskIdx, task] of mod.tasks.entries()) {
          const taskId = crypto.randomUUID();
          tasksToInsert.push({
            id: taskId,
            organization_id: orgId,
            quote_module_id: moduleId,
            title: task.title,
            description: task.description,
            user_story: task.userStory,
            acceptance_criteria: task.acceptanceCriteria,
            order_index: taskIdx,
          });

          for (const effort of task.efforts) {
            effortsToInsert.push({
              organization_id: orgId,
              quote_task_id: taskId,
              role_rate_card_id: rateCardMap.get(`${effort.roleName}|${effort.seniority}`),
              estimated_hours_min: effort.estimatedHoursMin,
              estimated_hours_expected: effort.estimatedHoursExpected,
              estimated_hours_max: effort.estimatedHoursMax,
              hourly_rate_eur: effort.hourlyRateEur,
              rationale: effort.rationale,
            });
          }
        }
      }
    }

    if (scenariosToInsert.length > 0) await admin.from("quote_scenarios").insert(scenariosToInsert);
    if (modulesToInsert.length > 0) await admin.from("quote_modules").insert(modulesToInsert);
    if (tasksToInsert.length > 0) await admin.from("quote_tasks").insert(tasksToInsert);
    if (effortsToInsert.length > 0) await admin.from("quote_task_efforts").insert(effortsToInsert);
  }

  return { id: quoteRunId };
}

export async function getQuoteRunForRequest(clientRequestId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  // Carichiamo l'ultimo quote run completato
  const { data: runData } = await admin
    .from("quote_runs")
    .select("*")
    .eq("client_request_id", clientRequestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!runData) return null;
  
  // Ricarichiamo gli scenari direttamente dalle tabelle relazionali per supportare le modifiche manuali
  const { data: dbScenarios } = await admin
    .from("quote_scenarios")
    .select(`
      id, name, slug, description, scenario_type, assumptions, exclusions, risks,
      confidence, estimated_weeks_min, estimated_weeks_expected, estimated_weeks_max,
      subtotal_eur, pm_cost_eur, risk_buffer_eur, total_eur,
      quote_modules(
        id, name, description, complexity, is_optional, is_included, dependency_notes, risk_notes, subtotal_eur, order_index,
        quote_tasks(
          id, title, description, user_story, acceptance_criteria, order_index,
          quote_task_efforts(
            id, estimated_hours_min, estimated_hours_expected, estimated_hours_max, hourly_rate_eur, cost_eur, rationale,
            role_rate_cards(id, role_name, seniority)
          )
        )
      )
    `)
    .eq("quote_run_id", runData.id)
    .order('created_at', { ascending: true });

  if (dbScenarios && runData.llm_raw_response) {
    // Mappa i dati dal DB al formato TypeScript PricedScenario
    const mappedScenarios = dbScenarios.map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      scenarioType: s.scenario_type,
      description: s.description,
      assumptions: s.assumptions,
      exclusions: s.exclusions,
      risks: s.risks,
      confidence: s.confidence,
      estimatedWeeksMin: s.estimated_weeks_min,
      estimatedWeeksExpected: s.estimated_weeks_expected,
      estimatedWeeksMax: s.estimated_weeks_max,
      totals: {
        subtotalEur: s.subtotal_eur,
        pmCostEur: s.pm_cost_eur,
        riskBufferEur: s.risk_buffer_eur,
        totalEur: s.total_eur,
        pmHours: 0, // Calcolabile o mock per ora
        nonPmHours: 0,
      },
      roleBreakdown: [], // Mock per ora
      modules: (s.quote_modules || []).sort((a: any, b: any) => a.order_index - b.order_index).map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        complexity: m.complexity,
        isOptional: m.is_optional,
        isIncluded: m.is_included,
        isIncludedByDefault: m.is_included,
        dependencyNotes: m.dependency_notes,
        riskNotes: m.risk_notes,
        subtotalEur: m.subtotal_eur,
        tasks: (m.quote_tasks || []).sort((a: any, b: any) => a.order_index - b.order_index).map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          userStory: t.user_story,
          acceptanceCriteria: t.acceptance_criteria,
          subtotalEur: 0, // Mock, verra ricalcolato
          efforts: (t.quote_task_efforts || []).map((e: any) => ({
            id: e.id,
            roleRateCardId: e.role_rate_cards.id,
            roleName: e.role_rate_cards.role_name,
            seniority: e.role_rate_cards.seniority,
            estimatedHoursMin: e.estimated_hours_min,
            estimatedHoursExpected: e.estimated_hours_expected,
            estimatedHoursMax: e.estimated_hours_max,
            hourlyRateEur: e.hourly_rate_eur,
            costEur: e.cost_eur,
            rationale: e.rationale,
          }))
        }))
      }))
    }));

    runData.llm_raw_response.scenarios = mappedScenarios;
  }

  return runData;
}
