create extension if not exists pg_trgm;
create extension if not exists unaccent;
create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  full_name text,
  role text not null check (role in ('admin', 'pm', 'sales', 'viewer')),
  created_at timestamptz not null default now()
);

create table public.role_rate_cards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  role_name text not null,
  seniority text not null,
  hourly_rate_eur numeric(10,2) not null check (hourly_rate_eur >= 0),
  competence_scope text,
  source text not null default 'official_rate_card',
  active boolean not null default true,
  valid_from date not null default current_date,
  valid_to date,
  created_at timestamptz not null default now(),
  unique (organization_id, role_name, seniority, valid_from)
);

create table public.role_aliases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  alias_role_name text not null,
  alias_seniority text not null,
  role_rate_card_id uuid not null references public.role_rate_cards(id),
  unique (organization_id, alias_role_name, alias_seniority)
);

create table public.employee_rate_cards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  employee_name text not null,
  employee_email text,
  role_rate_card_id uuid not null references public.role_rate_cards(id),
  hourly_rate_eur numeric(10,2) not null check (hourly_rate_eur >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  pm_percentage numeric(5,4) not null default 0.10 check (pm_percentage >= 0 and pm_percentage <= 1),
  currency text not null default 'EUR',
  risk_buffer_percentage numeric(5,4) not null default 0 check (risk_buffer_percentage >= 0 and risk_buffer_percentage <= 1),
  updated_at timestamptz not null default now()
);

create table public.client_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  created_by uuid references public.profiles(id),
  title text not null,
  raw_text text,
  normalized_text text,
  source_type text not null check (source_type in ('text', 'audio', 'document', 'mixed')),
  status text not null default 'draft' check (
    status in ('draft', 'transcribing', 'analyzing', 'needs_clarification', 'quoted', 'archived', 'error')
  ),
  client_budget_eur numeric(12,2),
  client_deadline date,
  client_timeline_text text,
  language text default 'it',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.request_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_request_id uuid not null references public.client_requests(id) on delete cascade,
  asset_type text not null check (asset_type in ('audio', 'document', 'generated_pdf')),
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  transcript_text text,
  created_at timestamptz not null default now()
);

create table public.historical_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  project_name text not null,
  client_industry text,
  project_type text,
  description text not null,
  initial_request text,
  delivered_scope text,
  excluded_scope text,
  total_estimated_hours numeric(10,2),
  total_actual_hours numeric(10,2),
  total_quoted_eur numeric(12,2),
  total_actual_cost_eur numeric(12,2),
  delivery_weeks numeric(6,2),
  success_notes text,
  risk_notes text,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

create table public.historical_project_modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  historical_project_id uuid not null references public.historical_projects(id) on delete cascade,
  module_name text not null,
  module_description text,
  complexity text check (complexity in ('low', 'medium', 'high', 'unknown')),
  actual_hours_by_role jsonb not null default '{}'::jsonb,
  quoted_hours_by_role jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table public.quote_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_request_id uuid not null references public.client_requests(id) on delete cascade,
  status text not null check (
    status in ('running', 'needs_clarification', 'completed', 'failed')
  ),
  model_provider text not null default 'openrouter',
  model_name text not null,
  prompt_version text not null,
  retrieved_history_ids uuid[] default '{}',
  llm_raw_response jsonb,
  validation_errors jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.clarification_questions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_request_id uuid not null references public.client_requests(id) on delete cascade,
  quote_run_id uuid references public.quote_runs(id) on delete set null,
  question text not null,
  reason text not null,
  impact text not null,
  priority text not null check (priority in ('blocking', 'important', 'nice_to_have')),
  answer text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.quote_scenarios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_request_id uuid not null references public.client_requests(id) on delete cascade,
  quote_run_id uuid not null references public.quote_runs(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null,
  scenario_type text not null check (scenario_type in ('base', 'alternative', 'premium', 'lean')),
  assumptions text[] not null default '{}',
  exclusions text[] not null default '{}',
  risks jsonb not null default '[]'::jsonb,
  confidence numeric(4,3) check (confidence >= 0 and confidence <= 1),
  estimated_weeks_min numeric(6,2),
  estimated_weeks_expected numeric(6,2),
  estimated_weeks_max numeric(6,2),
  subtotal_eur numeric(12,2) not null default 0,
  pm_cost_eur numeric(12,2) not null default 0,
  risk_buffer_eur numeric(12,2) not null default 0,
  total_eur numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (quote_run_id, slug)
);

create table public.quote_modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  quote_scenario_id uuid not null references public.quote_scenarios(id) on delete cascade,
  name text not null,
  description text not null,
  complexity text not null check (complexity in ('low', 'medium', 'high')),
  is_optional boolean not null default false,
  is_included boolean not null default true,
  dependency_notes text,
  risk_notes text,
  order_index int not null default 0,
  subtotal_eur numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.quote_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  quote_module_id uuid not null references public.quote_modules(id) on delete cascade,
  title text not null,
  description text,
  user_story text,
  acceptance_criteria text[] default '{}',
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table public.quote_task_efforts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  quote_task_id uuid not null references public.quote_tasks(id) on delete cascade,
  role_rate_card_id uuid not null references public.role_rate_cards(id),
  estimated_hours_min numeric(10,2) not null check (estimated_hours_min >= 0),
  estimated_hours_expected numeric(10,2) not null check (estimated_hours_expected >= 0),
  estimated_hours_max numeric(10,2) not null check (estimated_hours_max >= 0),
  hourly_rate_eur numeric(10,2) not null check (hourly_rate_eur >= 0),
  cost_eur numeric(12,2) generated always as (estimated_hours_expected * hourly_rate_eur) stored,
  rationale text,
  created_at timestamptz not null default now()
);

create table public.quote_exports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  quote_scenario_id uuid not null references public.quote_scenarios(id) on delete cascade,
  format text not null check (format in ('html', 'pdf')),
  storage_bucket text,
  storage_path text,
  public_share_token text unique,
  created_at timestamptz not null default now()
);

create table public.ai_call_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_request_id uuid references public.client_requests(id) on delete set null,
  quote_run_id uuid references public.quote_runs(id) on delete set null,
  provider text not null,
  model text not null,
  purpose text not null,
  prompt_version text not null,
  input_hash text not null,
  output_json jsonb,
  latency_ms int,
  token_usage jsonb,
  error text,
  created_at timestamptz not null default now()
);

create or replace function public.current_organization_id()
returns uuid
language sql stable
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text
language sql stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.can_read_org_row(row_org_id uuid)
returns boolean
language sql stable
as $$
  select row_org_id = public.current_organization_id()
$$;

create or replace function public.can_write_org_row(row_org_id uuid)
returns boolean
language sql stable
as $$
  select row_org_id = public.current_organization_id()
    and public.current_user_role() in ('admin', 'pm', 'sales')
$$;

create or replace function public.can_admin_org_row(row_org_id uuid)
returns boolean
language sql stable
as $$
  select row_org_id = public.current_organization_id()
    and public.current_user_role() = 'admin'
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.role_rate_cards enable row level security;
alter table public.role_aliases enable row level security;
alter table public.employee_rate_cards enable row level security;
alter table public.app_settings enable row level security;
alter table public.client_requests enable row level security;
alter table public.request_assets enable row level security;
alter table public.historical_projects enable row level security;
alter table public.historical_project_modules enable row level security;
alter table public.quote_runs enable row level security;
alter table public.clarification_questions enable row level security;
alter table public.quote_scenarios enable row level security;
alter table public.quote_modules enable row level security;
alter table public.quote_tasks enable row level security;
alter table public.quote_task_efforts enable row level security;
alter table public.quote_exports enable row level security;
alter table public.ai_call_logs enable row level security;

create policy "Users can read own organization"
on public.organizations for select
using (id = public.current_organization_id());

create policy "Users can read profiles in own organization"
on public.profiles for select
using (organization_id = public.current_organization_id());

create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Read own org rate cards"
on public.role_rate_cards for select
using (public.can_read_org_row(organization_id));

create policy "Admin writes rate cards"
on public.role_rate_cards for all
using (public.can_admin_org_row(organization_id))
with check (public.can_admin_org_row(organization_id));

create policy "Read own org role aliases"
on public.role_aliases for select
using (public.can_read_org_row(organization_id));

create policy "Admin writes role aliases"
on public.role_aliases for all
using (public.can_admin_org_row(organization_id))
with check (public.can_admin_org_row(organization_id));

create policy "Read own org employee cards"
on public.employee_rate_cards for select
using (public.can_read_org_row(organization_id));

create policy "Admin writes employee cards"
on public.employee_rate_cards for all
using (public.can_admin_org_row(organization_id))
with check (public.can_admin_org_row(organization_id));

create policy "Read own org settings"
on public.app_settings for select
using (public.can_read_org_row(organization_id));

create policy "Admin writes settings"
on public.app_settings for all
using (public.can_admin_org_row(organization_id))
with check (public.can_admin_org_row(organization_id));

create policy "Read own org requests"
on public.client_requests for select
using (public.can_read_org_row(organization_id));

create policy "Create own org requests"
on public.client_requests for insert
with check (public.can_write_org_row(organization_id));

create policy "Update own org requests"
on public.client_requests for update
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Delete own org requests"
on public.client_requests for delete
using (public.can_admin_org_row(organization_id));

create policy "Read own org request assets"
on public.request_assets for select
using (public.can_read_org_row(organization_id));

create policy "Write own org request assets"
on public.request_assets for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org history"
on public.historical_projects for select
using (public.can_read_org_row(organization_id));

create policy "Write own org history"
on public.historical_projects for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org history modules"
on public.historical_project_modules for select
using (public.can_read_org_row(organization_id));

create policy "Write own org history modules"
on public.historical_project_modules for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org quote runs"
on public.quote_runs for select
using (public.can_read_org_row(organization_id));

create policy "Write own org quote runs"
on public.quote_runs for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org clarification questions"
on public.clarification_questions for select
using (public.can_read_org_row(organization_id));

create policy "Write own org clarification questions"
on public.clarification_questions for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org quote scenarios"
on public.quote_scenarios for select
using (public.can_read_org_row(organization_id));

create policy "Write own org quote scenarios"
on public.quote_scenarios for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org quote modules"
on public.quote_modules for select
using (public.can_read_org_row(organization_id));

create policy "Write own org quote modules"
on public.quote_modules for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org quote tasks"
on public.quote_tasks for select
using (public.can_read_org_row(organization_id));

create policy "Write own org quote tasks"
on public.quote_tasks for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org quote efforts"
on public.quote_task_efforts for select
using (public.can_read_org_row(organization_id));

create policy "Write own org quote efforts"
on public.quote_task_efforts for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org quote exports"
on public.quote_exports for select
using (public.can_read_org_row(organization_id));

create policy "Write own org quote exports"
on public.quote_exports for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

create policy "Read own org ai logs"
on public.ai_call_logs for select
using (public.can_read_org_row(organization_id));

create policy "Write own org ai logs"
on public.ai_call_logs for all
using (public.can_write_org_row(organization_id))
with check (public.can_write_org_row(organization_id));

insert into storage.buckets (id, name, public)
values
  ('request-assets', 'request-assets', false),
  ('quote-exports', 'quote-exports', false)
on conflict (id) do nothing;
