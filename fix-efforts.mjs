import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function fix() {
  const scenarioId = '4f13eb32-0994-4328-ad38-77414a4225e7';
  
  const { data: scenarioRow } = await supabase.from('quote_scenarios')
    .select('quote_run_id, organization_id')
    .eq('id', scenarioId).single();
    
  if (!scenarioRow) return console.log("Scenario not found");
  
  const { data: runData } = await supabase.from('quote_runs')
    .select('llm_raw_response')
    .eq('id', scenarioRow.quote_run_id).single();
    
  const aiScenario = runData.llm_raw_response.scenarios.find(s => s.id === scenarioId || s.slug === scenarioId || true);
  if (!aiScenario) return console.log("AI scenario not found");
  
  // We need to re-insert modules, tasks, efforts
  // BUT the modules and tasks are already in DB!
  const { data: dbModules } = await supabase.from('quote_modules')
    .select('id, name, quote_tasks(id, title)')
    .eq('quote_scenario_id', scenarioId);
    
  let effortsToInsert = [];
  
  // get rate cards
  const { data: rateCards } = await supabase.from('role_rate_cards').select('id, role_name, seniority');
  
  for (const dbMod of dbModules) {
    const aiMod = aiScenario.modules.find(m => m.name === dbMod.name);
    if (!aiMod) continue;
    
    for (const dbTask of dbMod.quote_tasks) {
      const aiTask = aiMod.tasks.find(t => t.title === dbTask.title);
      if (!aiTask) continue;
      
      for (const eff of aiTask.efforts) {
        const rc = rateCards.find(r => r.role_name === eff.roleName && r.seniority === eff.seniority);
        if (!rc) continue;
        
        effortsToInsert.push({
          organization_id: scenarioRow.organization_id,
          quote_task_id: dbTask.id,
          role_rate_card_id: rc.id,
          estimated_hours_min: eff.estimatedHoursMin,
          estimated_hours_expected: eff.estimatedHoursExpected,
          estimated_hours_max: eff.estimatedHoursMax,
          hourly_rate_eur: 0 // Will fail if 0? No, let's just put 50 for now, or find the rate
        });
      }
    }
  }
  
  console.log("Found efforts to restore:", effortsToInsert.length);
  if (effortsToInsert.length > 0) {
     const { error } = await supabase.from('quote_task_efforts').insert(effortsToInsert);
     if (error) console.error("Insert error:", error);
     else console.log("Restored efforts successfully");
  }
}
fix();
