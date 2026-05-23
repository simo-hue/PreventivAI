import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { PricedScenario } from "@/src/lib/quotes/types";
import crypto from "crypto";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  
  try {
    const payload = await request.json();
    const scenario: PricedScenario = payload.scenario;
    if (!scenario || scenario.id !== id) {
      return NextResponse.json({ error: "Dati non validi." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase error" }, { status: 500 });
    }

    // Aggiorniamo i totali dello scenario
    await admin.from("quote_scenarios").update({
      subtotal_eur: scenario.totals.subtotalEur,
      pm_cost_eur: scenario.totals.pmCostEur,
      risk_buffer_eur: scenario.totals.riskBufferEur,
      total_eur: scenario.totals.totalEur,
    }).eq("id", id);

    // Poiche' le dipendenze (moduli -> task -> effort) possono essere alterate 
    // l'approccio piu sicuro per l'MVP e' eliminare i vecchi moduli e ricrearli.
    // Il cascade delete di postgres (se configurato) o Supabase si occupera' dei children.
    // MA per sicurezza eseguiamo i delete in ordine inverso se non c'e' il cascade.
    
    // Otteniamo l'ID dell'organizzazione
    const { data: scenarioRow } = await admin.from("quote_scenarios").select("organization_id").eq("id", id).single();
    const orgId = scenarioRow?.organization_id;

    // Per semplificare, eliminiamo tutti i moduli e figli associati per ricrearli aggiornati
    const { data: modules } = await admin.from("quote_modules").select("id").eq("quote_scenario_id", id);
    const moduleIds = modules?.map(m => m.id) || [];
    if (moduleIds.length > 0) {
      const { data: tasks } = await admin.from("quote_tasks").select("id").in("quote_module_id", moduleIds);
      const taskIds = tasks?.map(t => t.id) || [];
      if (taskIds.length > 0) {
        await admin.from("quote_task_efforts").delete().in("quote_task_id", taskIds);
        await admin.from("quote_tasks").delete().in("id", taskIds);
      }
      await admin.from("quote_modules").delete().in("id", moduleIds);
    }

    const modulesToInsert: any[] = [];
    const tasksToInsert: any[] = [];
    const effortsToInsert: any[] = [];

    // Ricostruiamo le righe
    for (const [modIdx, mod] of scenario.modules.entries()) {
      const moduleId = mod.id || crypto.randomUUID(); // riusa l'ID se presente per mantenere stabilita
      modulesToInsert.push({
        id: moduleId,
        organization_id: orgId,
        quote_scenario_id: id,
        name: mod.name,
        description: mod.description,
        complexity: mod.complexity,
        is_optional: mod.isOptional,
        is_included: mod.isIncluded,
        dependency_notes: mod.dependencyNotes,
        risk_notes: mod.riskNotes,
        order_index: modIdx,
        subtotal_eur: mod.subtotalEur,
      });

      for (const [taskIdx, task] of mod.tasks.entries()) {
        const taskId = task.id || crypto.randomUUID();
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
            id: effort.id || crypto.randomUUID(),
            organization_id: orgId,
            quote_task_id: taskId,
            role_rate_card_id: effort.roleRateCardId,
            estimated_hours_min: effort.estimatedHoursMin,
            estimated_hours_expected: effort.estimatedHoursExpected,
            estimated_hours_max: effort.estimatedHoursMax,
            hourly_rate_eur: effort.hourlyRateEur,
            cost_eur: effort.costEur,
            rationale: effort.rationale,
          });
        }
      }
    }

    if (modulesToInsert.length > 0) await admin.from("quote_modules").insert(modulesToInsert);
    if (tasksToInsert.length > 0) await admin.from("quote_tasks").insert(tasksToInsert);
    if (effortsToInsert.length > 0) await admin.from("quote_task_efforts").insert(effortsToInsert);

    return NextResponse.json({ saved: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
