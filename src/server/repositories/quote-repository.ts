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
  
  // Il raw JSON contiene tutta l'analisi generata (che include scenari prezzati). 
  // Per l'MVP e per riutilizzare l'interfaccia UI, ricarichiamo l'analisi dal raw JSON 
  // anziché joinare manualmente 5 tabelle (scenarios, modules, tasks, efforts).
  // Nota: I dati strutturati sono COMUNQUE salvati nel DB e interrogabili via SQL per la BI.
  
  return runData;
}
