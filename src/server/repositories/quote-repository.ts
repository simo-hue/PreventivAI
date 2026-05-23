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

  // Aggiorna lo stato della richiesta e scrive i dati estratti dall'analisi AI
  const clientRequestUpdate: Record<string, unknown> = {
    status: status === "completed" ? "quoted" : "needs_clarification",
    normalized_text: args.analysis.summary || null,
    updated_at: new Date().toISOString(),
  };

  // Budget rilevato dall'AI
  if (args.analysis.detectedBudgetEur != null) {
    clientRequestUpdate.client_budget_eur = args.analysis.detectedBudgetEur;
  }

  // Deadline rilevata dall'AI (formato ISO date string)
  if (args.analysis.detectedDeadline != null) {
    clientRequestUpdate.client_deadline = args.analysis.detectedDeadline;
  }

  // Timeline testuale rilevata dall'AI
  if (args.analysis.detectedTimelineText != null) {
    clientRequestUpdate.client_timeline_text = args.analysis.detectedTimelineText;
  }

  const { error: updateError } = await admin
    .from("client_requests")
    .update(clientRequestUpdate)
    .eq("id", args.clientRequestId);

  if (updateError) {
    console.error("[QuoteRepo] Errore aggiornamento client_requests:", updateError.message);
  }

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
    // Costruiamo la mappa roleName|seniority → rate_card_id
    // Strategia: SELECT first (i rate card ufficiali sono già nel DB), INSERT solo se mancanti
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

    const rateCardMap = new Map<string, string>();
    for (const r of uniqueRoles) {
      const parts = r.split("|");
      const roleName = parts[0];
      const seniority = parts[1];
      const rate = parseFloat(parts[2]);

      // 1. Cerca il rate card esistente per questa organizzazione
      const { data: existing } = await admin
        .from("role_rate_cards")
        .select("id")
        .eq("organization_id", orgId)
        .eq("role_name", roleName)
        .eq("seniority", seniority)
        .order("valid_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        rateCardMap.set(`${roleName}|${seniority}`, existing.id);
        continue;
      }

      // 2. Non trovato: inserisci un nuovo rate card
      const { data: inserted, error: insertErr } = await admin
        .from("role_rate_cards")
        .insert({
          organization_id: orgId,
          role_name: roleName,
          seniority,
          hourly_rate_eur: rate,
        })
        .select("id")
        .single();

      if (insertErr) {
        console.error(`[QuoteRepo] Impossibile creare rate card per ${roleName}|${seniority}:`, insertErr.message);
      } else if (inserted?.id) {
        rateCardMap.set(`${roleName}|${seniority}`, inserted.id);
      }
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
            const rcId = rateCardMap.get(`${effort.roleName}|${effort.seniority}`);
            if (!rcId) {
              console.warn(`[QuoteRepo] Nessun rate card per ${effort.roleName}|${effort.seniority} — effort saltato`);
              continue; // Salta questo effort invece di far fallire tutto il batch
            }
            effortsToInsert.push({
              organization_id: orgId,
              quote_task_id: taskId,
              role_rate_card_id: rcId,
              estimated_hours_min: effort.estimatedHoursMin,
              estimated_hours_expected: effort.estimatedHoursExpected,
              estimated_hours_max: effort.estimatedHoursMax,
              hourly_rate_eur: effort.hourlyRateEur,
              // NOTA: cost_eur è GENERATED ALWAYS in Postgres — NON inserire
              rationale: effort.rationale,
            });
          }
        }
      }
    }

    if (scenariosToInsert.length > 0) {
      const { error } = await admin.from("quote_scenarios").insert(scenariosToInsert);
      if (error) console.error("[QuoteRepo] Errore insert scenari:", error.message);
    }
    if (modulesToInsert.length > 0) {
      const { error } = await admin.from("quote_modules").insert(modulesToInsert);
      if (error) console.error("[QuoteRepo] Errore insert moduli:", error.message);
    }
    if (tasksToInsert.length > 0) {
      const { error } = await admin.from("quote_tasks").insert(tasksToInsert);
      if (error) console.error("[QuoteRepo] Errore insert task:", error.message);
    }
    if (effortsToInsert.length > 0) {
      const { error } = await admin.from("quote_task_efforts").insert(effortsToInsert);
      if (error) console.error("[QuoteRepo] Errore insert efforts:", error.message);
    }
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
        pmHours: 0, // verrà calcolato dopo
        nonPmHours: 0, // verrà calcolato dopo
      },
      roleBreakdown: [], // verrà popolato dopo se necessario
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
        tasks: (m.quote_tasks || []).sort((a: any, b: any) => a.order_index - b.order_index).map((t: any) => {
          const efforts = (t.quote_task_efforts || []).map((e: any) => ({
            id: e.id,
            roleRateCardId: e.role_rate_cards.id,
            roleName: e.role_rate_cards.role_name,
            seniority: e.role_rate_cards.seniority,
            estimatedHoursMin: e.estimated_hours_min,
            estimatedHoursExpected: e.estimated_hours_expected,
            estimatedHoursMax: e.estimated_hours_max,
            hourlyRateEur: e.hourly_rate_eur,
            costEur: e.cost_eur ?? Math.round((e.estimated_hours_expected * e.hourly_rate_eur) * 100) / 100,
            rationale: e.rationale,
          }));
          const subtotalEur = Math.round(efforts.reduce((sum: number, e: any) => sum + e.costEur, 0) * 100) / 100;
          return {
            id: t.id,
            title: t.title,
            description: t.description,
            userStory: t.user_story,
            acceptanceCriteria: t.acceptance_criteria,
            subtotalEur,
            efforts,
          };
        })
      })),
    }));

    // Ricalcola pmHours e nonPmHours dai moduli caricati dal DB
    for (const mapped of mappedScenarios) {
      const includedModules = mapped.modules.filter((m: any) => m.isIncluded);
      const nonPmHours = Math.round(
        includedModules.reduce((sum: number, m: any) =>
          sum + m.tasks.reduce((tSum: number, t: any) =>
            tSum + t.efforts
              .filter((e: any) => !e.roleName.trim().toLowerCase().includes('product manager'))
              .reduce((eSum: number, e: any) => eSum + e.estimatedHoursExpected, 0)
          , 0)
        , 0) * 100) / 100;
      const pmPercentageRaw = mapped.totals.pmCostEur > 0 && nonPmHours > 0
        ? mapped.totals.pmCostEur / (mapped.totals.totalEur - mapped.totals.pmCostEur - mapped.totals.riskBufferEur)
        : 0;
      const pmHours = Math.ceil(nonPmHours * (pmPercentageRaw || 0.1));
      mapped.totals.nonPmHours = nonPmHours;
      mapped.totals.pmHours = pmHours;
    }

    runData.llm_raw_response.scenarios = mappedScenarios;
  }

  return runData;
}

/**
 * Carica un singolo scenario dal DB (per la pagina di dettaglio).
 * Restituisce un oggetto PricedScenario pronto all'uso, con totali corretti.
 */
export async function getScenarioById(scenarioId: string): Promise<any | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data: s, error } = await admin
    .from("quote_scenarios")
    .select(`
      id, name, slug, description, scenario_type, assumptions, exclusions, risks,
      confidence, estimated_weeks_min, estimated_weeks_expected, estimated_weeks_max,
      subtotal_eur, pm_cost_eur, risk_buffer_eur, total_eur,
      client_request_id,
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
    .eq("id", scenarioId)
    .single();

  if (error) {
    console.error("[getScenarioById] Errore Supabase:", error.message, "| scenarioId:", scenarioId);
    return null;
  }
  if (!s) return null;

  const modules = (s.quote_modules || [])
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map((m: any) => {
      const tasks = (m.quote_tasks || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((t: any) => {
          const efforts = (t.quote_task_efforts || [])
            .filter((e: any) => e.role_rate_cards != null) // filtra efforts con FK rotta
            .map((e: any) => ({
              id: e.id,
              roleRateCardId: e.role_rate_cards?.id ?? '',
              roleName: e.role_rate_cards?.role_name ?? 'Sconosciuto',
              seniority: e.role_rate_cards?.seniority ?? '',
              estimatedHoursMin: e.estimated_hours_min,
              estimatedHoursExpected: e.estimated_hours_expected,
              estimatedHoursMax: e.estimated_hours_max,
              hourlyRateEur: e.hourly_rate_eur,
              // cost_eur è GENERATED in DB: estimated_hours_expected * hourly_rate_eur
              costEur: e.cost_eur ?? Math.round((e.estimated_hours_expected * e.hourly_rate_eur) * 100) / 100,
              rationale: e.rationale,
            }));
          const subtotalEur = Math.round(efforts.reduce((sum: number, e: any) => sum + e.costEur, 0) * 100) / 100;
          return {
            id: t.id,
            title: t.title,
            description: t.description,
            userStory: t.user_story,
            acceptanceCriteria: t.acceptance_criteria,
            subtotalEur,
            efforts,
          };
        });
      return {
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
        tasks,
      };
    });

  // Calcola pmHours e nonPmHours dai dati del DB
  const includedModules = modules.filter((m: any) => m.isIncluded);
  const nonPmHours = Math.round(
    includedModules.reduce((sum: number, m: any) =>
      sum + m.tasks.reduce((tSum: number, t: any) =>
        tSum + t.efforts
          .filter((e: any) => !e.roleName.trim().toLowerCase().includes('product manager'))
          .reduce((eSum: number, e: any) => eSum + e.estimatedHoursExpected, 0)
      , 0)
    , 0) * 100) / 100;
  const pmPercentageRaw = s.pm_cost_eur > 0 && nonPmHours > 0
    ? s.pm_cost_eur / (s.total_eur - s.pm_cost_eur - s.risk_buffer_eur)
    : 0;
  const pmHours = Math.ceil(nonPmHours * (pmPercentageRaw || 0.1));

  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
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
      pmHours,
      nonPmHours,
    },
    roleBreakdown: [],
    modules,
    clientRequestId: s.client_request_id,
  };
}
