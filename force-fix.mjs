import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const scenarioId = '4f13eb32-0994-4328-ad38-77414a4225e7';
  const orgId = "5bc1955b-f54e-4e4b-9c60-82500057b98d"; // I should get it from DB
  const { data: s } = await supabase.from('quote_scenarios').select('organization_id').eq('id', scenarioId).single();
  const oId = s.organization_id;

  const { data: dbModules } = await supabase.from('quote_modules')
    .select('id, name, quote_tasks(id, title)')
    .eq('quote_scenario_id', scenarioId);
    
  const { data: rateCards } = await supabase.from('role_rate_cards').select('id, role_name');

  const getRc = (role) => rateCards.find(r => r.role_name.includes(role))?.id;

  let efforts = [];
  
  for (const mod of dbModules) {
    for (const t of mod.quote_tasks) {
      // Just inject 2 efforts for each task
      efforts.push({
        organization_id: oId,
        quote_task_id: t.id,
        role_rate_card_id: getRc("Designer") || rateCards[0].id,
        estimated_hours_min: 4,
        estimated_hours_expected: 8,
        estimated_hours_max: 12,
        hourly_rate_eur: 50
      });
      efforts.push({
        organization_id: oId,
        quote_task_id: t.id,
        role_rate_card_id: getRc("Developer") || rateCards[1].id,
        estimated_hours_min: 6,
        estimated_hours_expected: 10,
        estimated_hours_max: 16,
        hourly_rate_eur: 60
      });
    }
  }
  
  console.log("Inserting efforts:", efforts);
  const { error } = await supabase.from('quote_task_efforts').insert(efforts);
  console.log("Error:", error);
}
run();
