insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Demo Software House')
on conflict do nothing;

insert into public.app_settings (organization_id, pm_percentage, currency, risk_buffer_percentage)
values ('00000000-0000-0000-0000-000000000001', 0.10, 'EUR', 0)
on conflict (organization_id) do update set
  pm_percentage = excluded.pm_percentage,
  currency = excluded.currency,
  risk_buffer_percentage = excluded.risk_buffer_percentage,
  updated_at = now();

insert into public.role_rate_cards
(organization_id, role_name, seniority, hourly_rate_eur, competence_scope)
values
('00000000-0000-0000-0000-000000000001', 'Product Manager / Agile Coach', 'Senior', 85, 'Gestione progetto, roadmap, definizione requisiti.'),
('00000000-0000-0000-0000-000000000001', 'UX/UI Designer', 'Senior', 75, 'Wireframe, user flow, design dell''interfaccia.'),
('00000000-0000-0000-0000-000000000001', 'UX/UI Designer', 'Junior', 45, 'Declinazione grafiche, piccoli adattamenti, icone.'),
('00000000-0000-0000-0000-000000000001', 'Software Architect', 'Specialist', 95, 'Progettazione database, infrastruttura Cloud, sicurezza.'),
('00000000-0000-0000-0000-000000000001', 'Full-Stack / Backend Developer', 'Senior', 70, 'Sviluppo logica core, API, integrazioni complesse.'),
('00000000-0000-0000-0000-000000000001', 'Frontend Developer', 'Mid', 55, 'Sviluppo interfaccia web/mobile, animazioni, reattivita''.'),
('00000000-0000-0000-0000-000000000001', 'QA / Tester Engineer', 'Mid', 50, 'Test automatizzati, bug hunting, controllo qualita''.'),
('00000000-0000-0000-0000-000000000001', 'DevOps Engineer', 'Senior', 80, 'Deploy su AWS/Azure, CI/CD pipelines, ottimizzazione server.')
on conflict (organization_id, role_name, seniority, valid_from) do nothing;

with rates as (
  select id, role_name, seniority
  from public.role_rate_cards
  where organization_id = '00000000-0000-0000-0000-000000000001'
)
insert into public.role_aliases
(organization_id, alias_role_name, alias_seniority, role_rate_card_id)
values
('00000000-0000-0000-0000-000000000001', 'Backend Sr', 'Senior', (select id from rates where role_name = 'Full-Stack / Backend Developer' and seniority = 'Senior')),
('00000000-0000-0000-0000-000000000001', 'Architect', 'Specialist', (select id from rates where role_name = 'Software Architect' and seniority = 'Specialist')),
('00000000-0000-0000-0000-000000000001', 'UX Designer Sr', 'Senior', (select id from rates where role_name = 'UX/UI Designer' and seniority = 'Senior'))
on conflict (organization_id, alias_role_name, alias_seniority) do nothing;

insert into public.historical_projects
(organization_id, project_name, client_industry, project_type, description, total_actual_hours, delivery_weeks, risk_notes, tags)
values
(
  '00000000-0000-0000-0000-000000000001',
  'Subscription food delivery',
  'Food',
  'PWA + backend',
  'MVP subscription commerce con catalogo, Stripe Billing, area cliente e pannello operativo.',
  190,
  9,
  'Catalogo prodotti e regole di ricorrenza devono essere definite presto.',
  array['subscription', 'stripe', 'delivery', 'pwa']
),
(
  '00000000-0000-0000-0000-000000000001',
  'Marketplace B2B',
  'Retail',
  'Web app',
  'Marketplace multi-vendor con onboarding venditori, pagamenti Stripe Connect e dashboard amministrativa.',
  220,
  10,
  'Le regole KYC hanno richiesto discovery aggiuntiva.',
  array['marketplace', 'stripe', 'b2b']
);
