# PreventivAI — Specifiche tecniche e istruzioni per Coding Agent

**Versione:** 1.0  
**Data:** 2026-05-23  
**Ruolo richiesto:** Senior Software Developer
**Output atteso:** web app interna per generare preventivi tecnico-economici da richieste cliente testuali o audio, con stime supportate da storico lavori aziendali, tariffario Supabase e AI via OpenRouter.

---

## 1. Contesto e obiettivo

L'azienda è una software house che riceve richieste cliente spesso vaghe o incomplete. L'obiettivo di PreventivAI è trasformare queste richieste in un **preventivo tecnico analitico, modulare, verificabile e presentabile al cliente**, riducendo il rischio di scope creep.

La web app deve permettere a un account/project manager interno di:

1. Inserire una richiesta cliente come testo libero.
2. Caricare un file audio e trascriverlo tramite API ElevenLabs.
3. Analizzare la richiesta con un agente AI via OpenRouter.
4. Individuare requisiti, vincoli, assumptions, rischi, moduli e task.
5. Recuperare dallo storico progetti aziendale casi simili per stimare ore in modo coerente.
6. Generare uno o più scenari di preventivo quando esistono assunzioni alternative.
7. Bloccare la generazione se mancano informazioni critiche e produrre domande per il cliente.
8. Inserire risposte del cliente e rilanciare l'analisi.
9. Accendere/spegnere moduli opzionali e vedere prezzo e rischio aggiornati in tempo reale.
10. Generare una pagina web cliente e scaricarla in PDF.

Principio chiave: **l'LLM propone analisi, task e ore; il calcolo economico deve essere deterministico, tracciabile e calcolato dal codice applicativo usando esclusivamente il tariffario nel database.**

---

## 2. Analisi degli allegati

### 2.1 Requisiti funzionali derivati dal brief

Il brief richiede un assistente AI per Agenzie Digitali e Software House capace di:

- analizzare input da prompt, audio o documento;
- capire macro-requisiti di progetto software/digital;
- scomporre la richiesta in User Stories o task concreti;
- associare figure professionali corrette e ore necessarie;
- usare la Rate Card ufficiale per i calcoli;
- gestire scope fluido con dashboard modulare;
- permettere l'attivazione/disattivazione di funzionalità;
- aggiornare il prezzo totale in tempo reale;
- evidenziare rischi di budget e pianificazione;
- generare preventivo finale PDF o pagina web;
- includere assumptions per confinare lo scope.

### 2.2 Vincoli obbligatori

- Prototipo funzionante e utilizzabile in demo live.
- Almeno input testuale funzionante.
- Calcolo basato **solo** sulla Rate Card ufficiale.
- Calcolo matematicamente corretto e verificabile.
- Output esportabile: PDF, pagina web stampabile o download.
- Demo su locale o URL pubblico, non screenshot statici.
- Repository Git con README e variabili ambiente senza chiavi reali.
- Output di esempio usando il testo del brief.
- Slide di presentazione separate: fuori scope di questo file, ma il preventivo deve avere qualità visiva sufficiente per essere presentabile.

### 2.3 Rate Card ufficiale estratta dall'XLSX

Questa tabella deve essere il seed iniziale del database. Non hardcodare nel codice business: importarla in Supabase tramite migration/seed.

| Ruolo professionale | Seniority | Tariffa oraria €/h | Ambito principale |
|---|---:|---:|---|
| Product Manager / Agile Coach | Senior | 85 | Gestione progetto, roadmap, definizione requisiti |
| UX/UI Designer | Senior | 75 | Wireframe, user flow, design interfaccia |
| UX/UI Designer | Junior | 45 | Declinazione grafiche, adattamenti, icone |
| Software Architect | Specialist | 95 | Progettazione database, infrastruttura cloud, sicurezza |
| Full-Stack / Backend Developer | Senior | 70 | Logica core, API, integrazioni complesse |
| Frontend Developer | Mid | 55 | Interfaccia web/mobile, animazioni, reattività |
| QA / Tester Engineer | Mid | 50 | Test automatizzati, bug hunting, controllo qualità |
| DevOps Engineer | Senior | 80 | Deploy, CI/CD, ottimizzazione server |

Nota di modellazione: l'utente ha richiesto un tariffario per ogni dipendente. Poiché l'allegato contiene tariffe per ruolo/seniority, il database deve supportare entrambi:
- **role_rate_cards** come rate card ufficiale per ruolo;
- **employee_rate_cards** opzionale per persone reali, collegate a ruolo/seniority, mantenendo il billing rate coerente con la rate card ufficiale salvo approvazione amministrativa.

---

## 3. Stack tecnologico consigliato per il 2026

### 3.1 Scelta principale

Usare una full-stack web app TypeScript moderna:

- **Next.js App Router** per UI, server rendering, route handlers e server-side business logic.
- **React Server Components** per pagine data-driven e Client Components solo dove servono interazioni.
- **TypeScript strict** end-to-end.
- **Supabase Postgres** come database primario.
- **Supabase Auth** per accesso interno.
- **Supabase Storage** per audio upload, documenti e PDF generati.
- **Supabase pgvector + full text search** per RAG sullo storico lavori.
- **OpenRouter API** per chiamate LLM.
- **ElevenLabs Speech to Text** per trascrizione audio.
- **Tailwind CSS + shadcn/ui** per UI veloce, accessibile e professionale.
- **Zod** per validazione input, output LLM e API contracts.
- **TanStack Query** solo nei Client Components con stato interattivo complesso; altrimenti preferire Server Components.
- **Playwright** per rendering server-side del PDF dalla pagina preventivo, con fallback `window.print()`.
- **Vitest** per unit/integration test.
- **Playwright E2E** per test flussi principali.
- **Biome** oppure ESLint + Prettier per lint/format.
- **pnpm** come package manager.
- **Supabase CLI** per migrations, local dev e seed.

### 3.2 Motivazioni

- Next.js consente di tenere segreti API e business logic lato server, riducendo superfici d'attacco.
- Supabase offre Postgres, RLS, Storage, Auth e vector search nello stesso ecosistema.
- pgvector permette di usare lo storico lavori come base RAG senza introdurre un vector DB separato.
- OpenRouter permette di cambiare modello senza cambiare architettura applicativa.
- Zod + structured outputs riducono gli errori di parsing e rendono l'AI testabile.
- PDF generato dalla stessa pagina web riduce duplicazioni tra output HTML e PDF.

### 3.3 Dipendenze suggerite

```bash
pnpm add @supabase/supabase-js @supabase/ssr zod openai
pnpm add react-hook-form @hookform/resolvers
pnpm add lucide-react clsx tailwind-merge
pnpm add date-fns
pnpm add playwright
pnpm add server-only
pnpm add pino
pnpm add nanoid
pnpm add @tanstack/react-query
pnpm add -D typescript vitest @vitest/coverage-v8 playwright @playwright/test
pnpm add -D eslint prettier
```

Nota: il pacchetto `openai` può essere usato con OpenRouter perché OpenRouter espone un'API compatibile con Chat Completions. Configurare `baseURL` su OpenRouter e non su OpenAI.

---

## 4. Architettura logica

```text
[Account Manager]
      |
      v
[Next.js Web App]
      |
      |-- Text input / Audio upload / Optional document upload
      |
      |-- /api/transcribe ---------------> [ElevenLabs STT]
      |
      |-- /api/quote/analyze ------------> [OpenRouter LLM]
      |          |
      |          +------------------------> [Supabase: rate card]
      |          +------------------------> [Supabase: storico lavori + pgvector]
      |
      |-- Deterministic Quote Engine
      |          |
      |          +---- validates LLM JSON
      |          +---- maps roles to official rates
      |          +---- computes costs, PM %, margins, totals
      |          +---- flags risks and blocking questions
      |
      v
[Dashboard preventivo modulare]
      |
      |-- toggle optional modules
      |-- compare scenarios
      |-- answer clarification questions
      |-- regenerate estimate
      |
      v
[Client-facing Quote Page] ---> [Download PDF]
```

---

## 5. Regole prodotto fondamentali

### 5.1 Ambiguità non bloccante

Se il cliente è vago ma la stima è possibile con assunzioni ragionevoli, il sistema deve generare più scenari.

Esempi:
- database custom in Supabase vs Airtable/servizio esterno;
- app mobile nativa vs PWA;
- integrazione custom Stripe Billing vs configurazione standard;
- mappa rider interna custom vs integrazione servizio terzo;
- modulo social incluso vs opzionale.

Ogni scenario deve avere:
- nome;
- descrizione;
- assumptions;
- moduli inclusi;
- moduli esclusi;
- rischio budget;
- rischio timeline;
- costo totale;
- timeline stimata;
- confidenza.

### 5.2 Ambiguità bloccante

Se manca un'informazione che rende impossibile una stima responsabile, non generare un preventivo finale. Generare invece domande per il cliente.

Esempi:
- cliente non indica se serve app mobile pubblicata sugli store o web app;
- dati sensibili/regolamentati senza requisiti privacy;
- integrazione con gestionale proprietario senza API/documentazione;
- vincolo di go-live incompatibile con scope minimo;
- mancanza di pagamento o modello di subscription quando è core business.

La UI deve mostrare stato `Needs clarification` e un form per inserire la risposta. Dopo l'inserimento risposta, rilanciare il processo mantenendo audit trail.

### 5.3 Calcolo economico

L'LLM non deve calcolare il prezzo finale. Deve produrre:
- moduli;
- task;
- ruoli necessari;
- ore stimate min/expected/max;
- confidence;
- motivazione.

Il codice deve:
1. leggere tariffe correnti dal DB;
2. validare che ogni ruolo stimato esista nella rate card;
3. moltiplicare ore x tariffa;
4. calcolare PM/Agile Coach come quota configurabile;
5. calcolare totale scenario;
6. esporre dettaglio verificabile.

Formula base:

```text
task_role_cost = estimated_hours * hourly_rate
module_cost = sum(task_role_cost)
scenario_subtotal = sum(included_module_cost)
pm_hours = ceil(non_pm_hours * pm_percentage)
pm_cost = pm_hours * pm_hourly_rate
qa_cost = sum(QA hours * QA rate) se stimato separatamente
risk_buffer = visible_optional_percentage * subtotal, mai nascosto
scenario_total = scenario_subtotal + pm_cost + risk_buffer
```

Default:
- `pm_percentage = 0.10`, configurabile da tabella `app_settings`;
- `risk_buffer = 0` nel preventivo base, ma può essere suggerito come riga opzionale e trasparente;
- importi IVA esclusa;
- arrotondamento finale al più vicino multiplo di 50 € solo se esplicitamente mostrato.

---

## 6. Modello dati Supabase

### 6.1 Estensioni Postgres

```sql
create extension if not exists vector;
create extension if not exists pg_trgm;
create extension if not exists unaccent;
```

### 6.2 Tabelle core

```sql
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
```

### 6.3 Storico lavori e RAG

```sql
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

create table public.historical_project_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  historical_project_id uuid not null references public.historical_projects(id) on delete cascade,
  content text not null,
  content_tsv tsvector generated always as (
    to_tsvector('simple', coalesce(content, ''))
  ) stored,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index historical_project_chunks_embedding_idx
on public.historical_project_chunks
using hnsw (embedding vector_cosine_ops);

create index historical_project_chunks_tsv_idx
on public.historical_project_chunks
using gin (content_tsv);
```

Nota: `vector(1536)` deve corrispondere alla dimensione del modello embedding scelto. Se si sceglie un provider con dimensioni diverse, aggiornare migration e tipi.

### 6.4 Preventivi

```sql
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
```

### 6.5 Audit AI

```sql
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
```

### 6.6 Row Level Security

Abilitare RLS su tutte le tabelle applicative.

Policy pattern:

```sql
alter table public.client_requests enable row level security;

create policy "Users can read own organization client requests"
on public.client_requests
for select
using (
  organization_id in (
    select organization_id from public.profiles where id = auth.uid()
  )
);

create policy "PM and admin can insert client requests"
on public.client_requests
for insert
with check (
  organization_id in (
    select organization_id from public.profiles
    where id = auth.uid() and role in ('admin', 'pm', 'sales')
  )
);
```

Implementare policy equivalenti per update/delete. Per operazioni server-side con service role:
- usare service role solo in route handler/server action;
- mai esporre service role al client;
- mantenere audit log;
- validare sempre l'organizzazione dell'utente.

---

## 7. Ricerca nello storico lavori

### 7.1 Strategia RAG

Quando arriva una richiesta, creare query di recupero da:
- testo normalizzato;
- settore;
- tipo progetto;
- moduli individuati;
- vincoli budget/timeline;
- parole chiave tecniche.

Usare retrieval ibrido:
1. semantic search su embedding;
2. full-text search su `content_tsv`;
3. filtro organizzazione;
4. ranking finale combinato;
5. passare all'LLM solo i top N chunk con metadati e ore effettive.

### 7.2 Funzione SQL indicativa

```sql
create or replace function public.match_historical_project_chunks(
  query_embedding vector(1536),
  query_text text,
  match_count int,
  org_id uuid
)
returns table (
  id uuid,
  historical_project_id uuid,
  content text,
  similarity float,
  text_rank float,
  combined_score float,
  metadata jsonb
)
language sql stable
as $$
  with semantic_matches as (
    select
      c.id,
      c.historical_project_id,
      c.content,
      1 - (c.embedding <=> query_embedding) as similarity,
      ts_rank(c.content_tsv, plainto_tsquery('simple', query_text)) as text_rank,
      c.metadata
    from public.historical_project_chunks c
    where c.organization_id = org_id
  )
  select
    id,
    historical_project_id,
    content,
    similarity,
    text_rank,
    (0.70 * similarity + 0.30 * text_rank) as combined_score,
    metadata
  from semantic_matches
  order by combined_score desc
  limit match_count;
$$;
```

### 7.3 Ingestion storico

Creare una pagina admin `/admin/history/import` o uno script CLI per importare CSV/JSON con lavori passati.

Formato minimo:

```json
{
  "project_name": "Marketplace B2B",
  "client_industry": "Retail",
  "project_type": "Web app",
  "description": "Marketplace multi-vendor con pagamenti Stripe Connect",
  "modules": [
    {
      "module_name": "Onboarding venditori",
      "complexity": "medium",
      "actual_hours_by_role": {
        "UX/UI Designer|Senior": 12,
        "Full-Stack / Backend Developer|Senior": 28,
        "Frontend Developer|Mid": 24
      }
    }
  ],
  "total_actual_hours": 220,
  "delivery_weeks": 10,
  "tags": ["marketplace", "stripe", "b2b"]
}
```

---

## 8. Flusso AI end-to-end

### 8.1 Pipeline

```text
1. Intake
   - testo libero oppure audio
   - normalizzazione
   - salvataggio request

2. Trascrizione audio
   - upload audio
   - invio a ElevenLabs STT
   - salvataggio transcript
   - possibilità di editing manuale transcript

3. Requirement extraction
   - OpenRouter LLM con output strutturato
   - estrazione: obiettivo, target utenti, feature, vincoli, budget, deadline, rischi

4. Ambiguity classification
   - divide dubbi in blocking / non-blocking
   - blocking => domande cliente
   - non-blocking => scenari alternativi

5. Retrieval storico
   - embedding richiesta
   - match storico lavori
   - passaggio contesto all'LLM

6. Estimation
   - LLM genera moduli, task, ruoli, ore, assumptions
   - output JSON validato

7. Deterministic pricing
   - codice recupera rate card
   - calcola costi
   - salva scenario, moduli, task, effort

8. Review dashboard
   - PM modifica ore/assumptions se necessario
   - toggle moduli opzionali
   - totale aggiornato

9. Client quote
   - pagina web shareable
   - PDF download
```

### 8.2 Regole di sicurezza AI

- Mai fidarsi di JSON LLM senza validazione Zod.
- Mai usare prezzo generato dal LLM.
- Mai usare tariffe generate dal LLM.
- Il modello deve ricevere solo tariffe ufficiali lette dal DB, non dal codice.
- Loggare modello, prompt version, input hash, output, validation errors.
- Inserire retry massimo 2 volte in caso di JSON non valido.
- Se l'output è semanticamente invalido, segnare run failed e mostrare errore interno.
- Eseguire redazione PII se lo storico contiene dati sensibili non necessari.

---

## 9. Structured output LLM

### 9.1 Schema Zod principale

Creare `src/lib/ai/schemas.ts`.

```ts
import { z } from "zod";

export const RoleEffortSchema = z.object({
  roleName: z.string(),
  seniority: z.string(),
  estimatedHoursMin: z.number().nonnegative(),
  estimatedHoursExpected: z.number().nonnegative(),
  estimatedHoursMax: z.number().nonnegative(),
  rationale: z.string().min(1),
});

export const QuoteTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  userStory: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).default([]),
  efforts: z.array(RoleEffortSchema).min(1),
});

export const QuoteModuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  complexity: z.enum(["low", "medium", "high"]),
  isOptional: z.boolean(),
  isIncludedByDefault: z.boolean(),
  dependencyNotes: z.string().optional(),
  riskNotes: z.string().optional(),
  tasks: z.array(QuoteTaskSchema).min(1),
});

export const ClarificationQuestionSchema = z.object({
  question: z.string().min(1),
  reason: z.string().min(1),
  impact: z.string().min(1),
  priority: z.enum(["blocking", "important", "nice_to_have"]),
});

export const QuoteScenarioSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  scenarioType: z.enum(["base", "alternative", "premium", "lean"]),
  description: z.string().min(1),
  assumptions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  risks: z.array(z.object({
    label: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    mitigation: z.string(),
  })).default([]),
  confidence: z.number().min(0).max(1),
  estimatedWeeksMin: z.number().positive(),
  estimatedWeeksExpected: z.number().positive(),
  estimatedWeeksMax: z.number().positive(),
  modules: z.array(QuoteModuleSchema).min(1),
});

export const AnalysisOutputSchema = z.object({
  summary: z.string().min(1),
  detectedBudgetEur: z.number().nullable(),
  detectedDeadline: z.string().nullable(),
  detectedTimelineText: z.string().nullable(),
  blockingQuestions: z.array(ClarificationQuestionSchema).default([]),
  importantQuestions: z.array(ClarificationQuestionSchema).default([]),
  shouldGenerateQuote: z.boolean(),
  scenarios: z.array(QuoteScenarioSchema).default([]),
});
```

### 9.2 Prompt di sistema

Salvare prompt versionati in `src/lib/ai/prompts/quote-analysis.v1.ts`.

```text
Sei un senior solution architect e project manager IT per una software house.
Devi analizzare richieste cliente vaghe e trasformarle in preventivi tecnici modulari.
Rispondi solo nel formato JSON richiesto.

Regole non negoziabili:
- Non calcolare prezzi finali.
- Non inventare tariffe orarie.
- Usa solo i ruoli disponibili nella rate card fornita.
- Stima ore min/expected/max per ruolo.
- Se un dubbio è bloccante, genera domanda e imposta shouldGenerateQuote=false.
- Se il dubbio non è bloccante, genera scenari alternativi con assumptions chiare.
- Evidenzia budget, deadline, rischi e scope creep.
- Se una feature è opzionale o fuori budget, marcarla come optional.
- Includi assumptions ed exclusions in modo leggibile per il cliente.
```

### 9.3 Contesto runtime passato al modello

```ts
type PromptContext = {
  requestText: string;
  rateCard: Array<{
    roleName: string;
    seniority: string;
    hourlyRateEur: number; // solo per contesto, non per calcolo finale
    competenceScope: string;
  }>;
  similarHistoricalProjects: Array<{
    projectName: string;
    projectType?: string;
    description: string;
    modules: Array<{
      moduleName: string;
      complexity?: string;
      actualHoursByRole: Record<string, number>;
      notes?: string;
    }>;
    totalActualHours?: number;
    deliveryWeeks?: number;
    riskNotes?: string;
  }>;
  organizationDefaults: {
    pmPercentage: number;
    currency: "EUR";
  };
};
```

### 9.4 Chiamata OpenRouter

```ts
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { AnalysisOutputSchema } from "./schemas";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.APP_PUBLIC_URL ?? "http://localhost:3000",
    "X-Title": "PreventivAI",
  },
});

export async function analyzeQuoteRequest(context: PromptContext) {
  const response = await openrouter.chat.completions.create({
    model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4.5",
    messages: [
      { role: "system", content: QUOTE_ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(context) },
    ],
    temperature: 0.2,
    response_format: zodResponseFormat(AnalysisOutputSchema, "analysis_output"),
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");

  return AnalysisOutputSchema.parse(JSON.parse(content));
}
```

Nota: verificare il modello scelto nella dashboard OpenRouter. Non tutti i modelli supportano structured outputs allo stesso modo. Implementare smoke test automatico all'avvio o in CI.

---

## 10. Trascrizione audio con ElevenLabs

### 10.1 Flusso

1. Utente carica audio nella UI.
2. Client invia file a route handler server `/api/transcribe`.
3. Server valida:
   - formato MIME;
   - dimensione;
   - durata se disponibile;
   - autenticazione utente.
4. Server salva originale in Supabase Storage bucket `request-assets`.
5. Server invia file a ElevenLabs STT.
6. Server salva transcript in `request_assets.transcript_text`.
7. UI mostra transcript editabile.
8. Utente conferma transcript e avvia analisi.

### 10.2 Route handler indicativo

```ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  // 1. auth + org
  // 2. validate file
  // 3. upload to Supabase Storage
  // 4. call ElevenLabs STT
  // 5. save transcript
  // 6. return transcript JSON
}
```

### 10.3 Best practice

- Non chiamare ElevenLabs dal browser.
- Non salvare API key lato client.
- Consentire editing manuale della trascrizione.
- Conservare audio originale solo se necessario; prevedere retention policy.
- Gestire errori di trascrizione con messaggi chiari e retry manuale.
- Per demo live, supportare anche upload `.mp3`, `.wav`, `.m4a`.

---

## 11. Motore di pricing deterministico

### 11.1 Modulo applicativo

Creare `src/lib/quotes/pricing-engine.ts`.

Responsabilità:
- validare che tutti i ruoli LLM siano nella rate card;
- usare `role_name + seniority` come matching primario;
- calcolare costi per task, modulo, scenario;
- calcolare PM %;
- generare breakdown pronto per DB;
- segnalare mismatch o ruoli non riconosciuti.

### 11.2 Matching ruoli

Implementare mapping robusto:

```ts
function normalizeRoleKey(roleName: string, seniority: string) {
  return `${roleName.trim().toLowerCase()}|${seniority.trim().toLowerCase()}`;
}
```

Aggiungere alias controllati in DB:

```sql
create table public.role_aliases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  alias_role_name text not null,
  alias_seniority text not null,
  role_rate_card_id uuid not null references public.role_rate_cards(id),
  unique (organization_id, alias_role_name, alias_seniority)
);
```

Esempi alias:
- `Backend Sr` → `Full-Stack / Backend Developer | Senior`
- `Architect` → `Software Architect | Specialist`
- `UX Designer Sr` → `UX/UI Designer | Senior`

### 11.3 Funzione di calcolo

```ts
export type PricingInput = {
  scenarios: QuoteScenarioFromAi[];
  rateCards: RateCard[];
  pmPercentage: number;
};

export function priceScenarios(input: PricingInput): PricedScenario[] {
  // 1. build rate card map
  // 2. loop scenarios/modules/tasks/efforts
  // 3. compute role effort costs
  // 4. compute PM hours on non-PM expected hours
  // 5. compute totals
  // 6. return priced immutable objects
}
```

### 11.4 Invarianti da testare

- Totale scenario = somma moduli inclusi + PM + buffer.
- Moduli opzionali esclusi non influenzano il totale base.
- Toggle modulo opzionale aggiorna totale in modo deterministico.
- Cambiando tariffa DB, nuovo preventivo usa nuova tariffa.
- Preventivi già generati conservano `hourly_rate_eur` snapshot per audit.
- Ore min <= expected <= max.
- Nessun costo negativo.
- Nessun ruolo non mappato viene salvato in preventivo completato.

---

## 12. UX e pagine

### 12.1 Sitemap interna

```text
/
  redirect a /requests

/login
/requests
/requests/new
/requests/[id]
/requests/[id]/clarifications
/requests/[id]/scenarios/[scenarioId]
/quotes/[scenarioId]/preview
/quotes/[scenarioId]/public/[token]
/admin/rate-card
/admin/history
/admin/history/import
/admin/settings
```

### 12.2 Dashboard richiesta

Sezioni:
1. Header con titolo, stato, data, owner.
2. Input originale e transcript.
3. Summary AI.
4. Budget/deadline rilevati.
5. Alert rischi:
   - budget insufficiente;
   - deadline aggressiva;
   - scope opzionale;
   - informazioni mancanti.
6. Domande cliente se presenti.
7. Scenari generati in card comparabili.
8. CTA:
   - rigenera analisi;
   - rispondi domande;
   - apri preventivo;
   - esporta PDF.

### 12.3 Scenario detail

Componenti:
- riepilogo totale;
- timeline min/expected/max;
- confidence;
- lista assumptions;
- lista exclusions;
- moduli in accordion;
- toggle `included` per optional modules;
- tabella task/ruoli/ore/costi;
- breakdown PM;
- confronto budget cliente;
- pulsante PDF.

### 12.4 Pagina preventivo cliente

Deve essere elegante, leggibile e vendibile.

Struttura consigliata:
1. Cover:
   - nome progetto;
   - cliente;
   - data;
   - logo azienda;
   - scenario selezionato.
2. Executive summary:
   - cosa verrà realizzato;
   - benefici;
   - vincoli chiave.
3. Scope incluso:
   - moduli;
   - deliverable;
   - criteri di accettazione principali.
4. Moduli opzionali:
   - costo;
   - impatto;
   - perché rimandabili.
5. Timeline:
   - fasi: discovery, design, sviluppo, QA, go-live.
6. Breakdown economico:
   - ruoli;
   - ore;
   - tariffa;
   - totale.
7. Assumptions:
   - cosa è incluso/escluso;
   - prerequisiti cliente;
   - dipendenze esterne.
8. Rischi e mitigazioni.
9. Prossimi step:
   - conferma scope;
   - workshop;
   - kickoff;
   - firma proposta.

### 12.5 Design system

- UI pulita, B2B, niente eccessi grafici.
- Colori:
  - neutri per base;
  - rosso/ambra per rischio;
  - verde/blu per stato OK.
- Componenti shadcn/ui:
  - Card;
  - Table;
  - Accordion;
  - Tabs;
  - Badge;
  - Alert;
  - Dialog;
  - DropdownMenu;
  - Button;
  - Textarea;
  - File upload dropzone.
- Accessibilità:
  - labels esplicite;
  - focus visible;
  - contrasto WCAG AA;
  - navigazione da tastiera.

---

## 13. API routes e server actions

### 13.1 Route handlers

| Metodo | Path | Responsabilità |
|---|---|---|
| POST | `/api/transcribe` | upload audio, STT ElevenLabs, salvataggio transcript |
| POST | `/api/requests` | crea richiesta da testo |
| POST | `/api/requests/:id/analyze` | avvia analisi AI e genera run |
| POST | `/api/requests/:id/clarifications` | salva risposte cliente |
| POST | `/api/quote-scenarios/:id/recalculate` | ricalcola dopo toggle modulo |
| POST | `/api/quote-scenarios/:id/export-pdf` | genera PDF e salva in Storage |
| GET | `/api/quote-scenarios/:id/export-pdf` | download PDF se autorizzato |

### 13.2 Server actions

Usare server actions per mutazioni UI semplici:
- creare richiesta testuale;
- aggiornare titolo;
- toggle modulo;
- salvare answer;
- archiviare richiesta.

Usare route handlers per:
- upload file;
- integrazioni esterne;
- PDF;
- chiamate potenzialmente lunghe.

---

## 14. Struttura repository

```text
preventivai/
  app/
    (auth)/
      login/
    (dashboard)/
      requests/
      admin/
    quotes/
      [scenarioId]/
        preview/
        public/[token]/
    api/
      transcribe/
      requests/[id]/analyze/
      quote-scenarios/[id]/export-pdf/
  components/
    ui/
    quote/
    requests/
    layout/
  src/
    lib/
      ai/
        openrouter-client.ts
        prompts/
        schemas.ts
        quote-agent.ts
      audio/
        elevenlabs-client.ts
      quotes/
        pricing-engine.ts
        quote-mappers.ts
        risk-engine.ts
      supabase/
        client.ts
        server.ts
        admin.ts
        types.ts
      auth/
        require-user.ts
      pdf/
        render-quote-pdf.ts
      utils/
    server/
      repositories/
        rate-card-repository.ts
        request-repository.ts
        quote-repository.ts
        history-repository.ts
  supabase/
    migrations/
    seed.sql
  tests/
    unit/
    integration/
    e2e/
  docs/
    architecture.md
    demo-script.md
  .env.example
  README.md
```

---

## 15. Environment variables

Creare `.env.example`.

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_PUBLIC_URL=http://localhost:3000
NODE_ENV=development

# Supabase public client
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase server-side only
SUPABASE_SERVICE_ROLE_KEY=

# AI
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5
OPENROUTER_FALLBACK_MODEL=openai/gpt-4.1

# Embeddings
EMBEDDING_PROVIDER=openai
EMBEDDING_API_KEY=
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_STT_MODEL=scribe_v2

# PDF
PDF_BASE_URL=http://localhost:3000
PDF_EXPORT_BUCKET=quote-exports

# Observability
LOG_LEVEL=info
```

Non committare mai `.env.local`.

---

## 16. Seed iniziale Supabase

Creare `supabase/seed.sql`.

```sql
insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Demo Software House')
on conflict do nothing;

insert into public.role_rate_cards
(organization_id, role_name, seniority, hourly_rate_eur, competence_scope)
values
('00000000-0000-0000-0000-000000000001', 'Product Manager / Agile Coach', 'Senior', 85, 'Gestione progetto, roadmap, definizione requisiti.'),
('00000000-0000-0000-0000-000000000001', 'UX/UI Designer', 'Senior', 75, 'Wireframe, user flow, design dell''interfaccia.'),
('00000000-0000-0000-0000-000000000001', 'UX/UI Designer', 'Junior', 45, 'Declinazione grafiche, piccoli adattamenti, icone.'),
('00000000-0000-0000-0000-000000000001', 'Software Architect', 'Specialist', 95, 'Progettazione database, infrastruttura Cloud, sicurezza.'),
('00000000-0000-0000-0000-000000000001', 'Full-Stack / Backend Developer', 'Senior', 70, 'Sviluppo logica core, API, integrazioni complesse.'),
('00000000-0000-0000-0000-000000000001', 'Frontend Developer', 'Mid', 55, 'Sviluppo interfaccia web/mobile, animazioni, reattività.'),
('00000000-0000-0000-0000-000000000001', 'QA / Tester Engineer', 'Mid', 50, 'Test automatizzati, bug hunting, controllo qualità.'),
('00000000-0000-0000-0000-000000000001', 'DevOps Engineer', 'Senior', 80, 'Deploy su AWS/Azure, CI/CD pipelines, ottimizzazione server.');
```

---

## 17. PDF export

### 17.1 Strategia consigliata

Implementare una pagina `quotes/[scenarioId]/preview` responsive e print-ready. Il PDF deve essere generato dalla stessa pagina per evitare divergenze.

Route:
`POST /api/quote-scenarios/:id/export-pdf`

Flusso:
1. Verifica auth.
2. Genera token interno temporaneo.
3. Playwright apre URL preview server-side.
4. Aspetta network idle.
5. Genera PDF A4.
6. Salva PDF in Supabase Storage.
7. Crea record `quote_exports`.
8. Restituisce URL firmato o download.

### 17.2 CSS print

```css
@media print {
  body {
    background: white;
  }

  .no-print {
    display: none !important;
  }

  .page-break {
    page-break-before: always;
  }

  .avoid-break {
    break-inside: avoid;
  }
}
```

### 17.3 Best practice

- Non generare PDF da DOM client non autenticato.
- Non duplicare layout in librerie diverse se non necessario.
- Per deploy serverless, verificare compatibilità Playwright/Chromium.
- In alternativa production-grade: usare un servizio browserless interno o container Node dedicato.

---

## 18. Esempio di comportamento sul testo demo del brief

Input demo:
```text
Ciao! Vogliamo lanciare una piattaforma MVP per la nostra startup di Delivery di cibo per animali a domicilio...
Budget massimo intorno ai 25.000€ e dobbiamo essere online tassativamente entro 3 mesi.
```

Output atteso:
- budget rilevato: 25.000 €;
- deadline/timeline rilevata: 3 mesi;
- warning: scope ambizioso per MVP;
- moduli base:
  - onboarding utente e profilo animale;
  - abbonamento cibo personalizzato;
  - pagamenti ricorrenti Stripe;
  - dashboard/logica rider con mappa;
  - backend API e DB;
  - QA;
  - deploy.
- modulo opzionale:
  - sezione social pet owners;
  - esclusa da base se sfora budget/timeline.
- scenari:
  1. MVP Lean con PWA/app ibrida e servizi esterni;
  2. MVP Custom con maggiore backend custom;
  3. Premium con social incluso.
- assumptions:
  - app cross-platform, non due native separate;
  - design system essenziale;
  - Stripe Billing standard;
  - mappe tramite provider esterno;
  - no gestionale rider avanzato;
  - no algoritmo nutrizionale clinico certificato salvo specifica.
- domande se bloccanti:
  - è accettabile PWA o serve pubblicazione store iOS/Android?
  - chi fornisce logica nutrizionale e catalogo prodotti?
  - esiste già un sistema logistico/rider da integrare?

---

## 19. Testing strategy

### 19.1 Unit test

- `pricing-engine.test.ts`
  - calcolo task;
  - calcolo modulo;
  - calcolo PM 10%;
  - toggle optional;
  - errore ruolo mancante;
  - snapshot rate card.
- `schemas.test.ts`
  - validazione output LLM valido;
  - rejection output incompleto;
  - bounds ore min/expected/max.
- `risk-engine.test.ts`
  - budget exceeded;
  - aggressive timeline;
  - low confidence.

### 19.2 Integration test

- Supabase local:
  - seed rate card;
  - create request;
  - save quote run;
  - insert scenarios/modules/tasks;
  - enforce RLS.
- AI mock:
  - mock OpenRouter response JSON;
  - mock ElevenLabs transcript.
- PDF:
  - render scenario demo;
  - verifica PDF non vuoto;
  - verifica nome file e storage path.

### 19.3 E2E Playwright

Percorso demo:
1. login;
2. crea nuova richiesta da testo;
3. avvia analisi;
4. visualizza scenari;
5. apri scenario base;
6. toggla modulo opzionale;
7. controlla totale aggiornato;
8. genera PDF;
9. scarica PDF.

---

## 20. Sicurezza e compliance

- Auth obbligatoria per tutte le pagine dashboard.
- Public quote page accessibile solo con token random non indovinabile.
- Rate card editabile solo da admin.
- Storico progetti visibile solo all'organizzazione.
- RLS attivo.
- API key solo server-side.
- File upload con limiti MIME e dimensione.
- Sanitizzare testo cliente in output HTML.
- Non inserire PII non necessaria nei prompt.
- Audit log per tutte le chiamate AI.
- Retention policy per audio.
- Nessuna chiave reale nel repository.
- `.env.example` obbligatorio.
- Errori utente chiari, errori tecnici nei log.

---

## 21. Observability

Implementare logging strutturato con Pino.

Campi minimi:
- `requestId`;
- `organizationId`;
- `userId`;
- `quoteRunId`;
- `provider`;
- `model`;
- `latencyMs`;
- `status`;
- `errorCode`.

Metriche consigliate:
- numero quote generate;
- percentuale run con clarification;
- failure rate LLM;
- costo medio AI per quote;
- tempo medio generazione preventivo;
- scostamento medio stima vs consuntivo quando disponibile.

---

## 22. Implementation plan step-by-step per Coding Agent

### Fase 0 — Bootstrap repository

1. Creare progetto Next.js con TypeScript, App Router, Tailwind.
2. Configurare pnpm.
3. Installare dipendenze principali.
4. Configurare lint, format, typecheck.
5. Creare `.env.example`.
6. Creare README con run locale.
7. Aggiungere script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:start": "supabase start",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --local > src/lib/supabase/types.ts"
  }
}
```

### Fase 1 — Supabase

1. Inizializzare Supabase CLI.
2. Creare migration per schema.
3. Creare RLS policies.
4. Creare seed rate card.
5. Creare bucket Storage:
   - `request-assets`;
   - `quote-exports`.
6. Generare types.
7. Creare client browser/server/admin.
8. Implementare `requireUser()` e `requireOrg()`.

### Fase 2 — Auth e layout

1. Implementare login.
2. Implementare dashboard layout.
3. Proteggere routes dashboard.
4. Creare navbar:
   - Requests;
   - New request;
   - Admin;
   - Settings.
5. Gestire ruoli admin/pm/sales/viewer.

### Fase 3 — Rate card admin

1. Pagina `/admin/rate-card`.
2. Tabella rate card.
3. Read-only per non-admin.
4. Edit controllato per admin.
5. Validazione tariffe.
6. Audit minimo su update.

### Fase 4 — Creazione richiesta

1. Pagina `/requests/new`.
2. Textarea richiesta cliente.
3. Upload audio.
4. Tab transcript editabile.
5. Salvataggio request.
6. Stato request.

### Fase 5 — ElevenLabs STT

1. Implementare `elevenlabs-client.ts`.
2. Implementare route `/api/transcribe`.
3. Validazione file.
4. Storage upload.
5. Salvataggio transcript.
6. UI loading/error.

### Fase 6 — Storico lavori

1. Tabelle storico.
2. Pagina `/admin/history`.
3. Import JSON/CSV.
4. Chunking contenuto.
5. Embedding provider.
6. Funzione match ibrido.
7. Test retrieval.

### Fase 7 — OpenRouter quote agent

1. Definire Zod schema.
2. Definire prompt v1.
3. Implementare client OpenRouter.
4. Implementare `quote-agent.ts`.
5. Implementare retry JSON.
6. Log AI calls.
7. Smoke test modello.

### Fase 8 — Pricing engine

1. Implementare mapping ruoli.
2. Implementare priceScenarios.
3. Salvare snapshot tariffa su effort.
4. Unit test completi.
5. Gestire errori di ruolo non mappato.
6. Implementare PM percentage.

### Fase 9 — Quote persistence

1. Repository per quote runs.
2. Persistenza questions.
3. Persistenza scenarios.
4. Persistenza modules/tasks/efforts.
5. Recalculate totals.
6. Transaction DB per salvataggio coerente.

### Fase 10 — Dashboard quote

1. Pagina request detail.
2. Stato needs clarification.
3. Form risposte cliente.
4. Cards scenario.
5. Scenario detail.
6. Toggle moduli opzionali.
7. Totale aggiornato.
8. Badge budget/timeline/risk.

### Fase 11 — Pagina cliente e PDF

1. Pagina preview.
2. Layout print-ready.
3. Public token.
4. Export PDF route.
5. Storage PDF.
6. Download.
7. Test PDF.

### Fase 12 — Demo hardening

1. Seed input demo del brief.
2. Seed storico lavori realistico.
3. Test run demo end-to-end.
4. Gestire fallback se API esterne falliscono:
   - transcript manuale;
   - mock LLM opzionale in dev;
   - messaggi errore.
5. README con istruzioni.
6. Script demo.

---

## 23. Acceptance criteria

La web app è accettabile se:

- Un utente interno autenticato può creare una richiesta da testo.
- Un utente può caricare audio e ottenere transcript.
- Il sistema genera domande se l'ambiguità è bloccante.
- Il sistema genera almeno 2 scenari se l'ambiguità è non bloccante.
- I moduli sono scomponibili in task.
- Ogni task ha ruoli e ore.
- I costi sono calcolati usando solo tariffe DB.
- Il preventivo mostra assumptions, exclusions, rischi e timeline.
- I moduli opzionali possono essere togglati.
- Il totale cambia in tempo reale e resta verificabile.
- La pagina preventivo è presentabile al cliente.
- Il PDF viene generato e scaricato.
- Il codice passa typecheck, lint e test principali.
- README consente avvio locale senza conoscenza implicita.

---

## 24. Anti-pattern da evitare

- Calcolare prezzi dentro al prompt LLM.
- Hardcodare tariffe nel frontend.
- Esporre service role key.
- Usare un unico componente React enorme.
- Salvare output LLM non validato.
- Non gestire ruoli non mappati.
- Non distinguere assumptions da requirements.
- Non conservare snapshot tariffa del preventivo.
- Generare PDF con layout diverso dalla pagina preview senza motivo.
- Presentare mockup statici come demo funzionante.
- Ignorare RLS perché è “tool interno”.
- Usare storico lavori senza isolamento organizzazione.

---

## 25. Criteri di qualità codice

### 25.1 TypeScript

- `strict: true`.
- No `any` non giustificati.
- Tipi generati da Supabase.
- Zod come boundary validation.
- Business logic in `src/lib`, non nei componenti.

### 25.2 React/Next.js

- Server Components di default.
- Client Components solo per:
  - form interattivi;
  - upload;
  - toggle;
  - stati UI locali.
- Fetch server-side dove possibile.
- Route handlers per integrazioni esterne.
- `server-only` nei moduli con segreti.

### 25.3 Database

- Migrations versionate.
- RLS obbligatoria.
- Query indicizzate.
- Transazioni per salvataggio quote.
- Snapshot economici per audit.

### 25.4 AI

- Prompt versionati.
- Output strutturati.
- Retry limitati.
- Log e audit.
- Test con fixture.
- Modello configurabile via env.
- Fallback model configurabile.

### 25.5 UX

- Loading states reali.
- Empty states.
- Error states.
- Feedback dopo ogni azione.
- Tabelle leggibili.
- PDF print-safe.

---

## 26. Checklist finale per consegna

- [ ] Repository Git aggiornato.
- [ ] README completo.
- [ ] `.env.example` presente.
- [ ] Supabase migrations funzionanti.
- [ ] Seed rate card ufficiale.
- [ ] Input testuale demo funzionante.
- [ ] Upload audio funzionante o fallback chiaro.
- [ ] OpenRouter configurabile.
- [ ] ElevenLabs configurabile.
- [ ] Storico lavori seedato.
- [ ] Preventivo demo generato dal testo del brief.
- [ ] PDF scaricabile.
- [ ] Calcoli verificabili.
- [ ] Test principali verdi.
- [ ] Demo live provata da zero.
- [ ] Nessuna chiave segreta committata.

---

## 27. Riferimenti tecnici da consultare durante l'implementazione

- Next.js App Router e Server Functions: https://nextjs.org/docs/app
- Next.js mutating data / Server Functions: https://nextjs.org/docs/app/getting-started/mutating-data
- Supabase AI & Vectors: https://supabase.com/docs/guides/ai
- Supabase pgvector: https://supabase.com/docs/guides/database/extensions/pgvector
- Supabase hybrid search: https://supabase.com/docs/guides/ai/hybrid-search
- Supabase RAG with permissions/RLS: https://supabase.com/docs/guides/ai/rag-with-permissions
- OpenRouter Structured Outputs: https://openrouter.ai/docs/guides/features/structured-outputs
- OpenRouter API Reference: https://openrouter.ai/docs/api/reference/overview
- ElevenLabs Speech to Text: https://elevenlabs.io/docs/overview/capabilities/speech-to-text
- ElevenLabs realtime STT: https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/client-side-streaming

---

## 28. Nota PM finale

Per massimizzare il punteggio della demo, dare priorità a:

1. Calcolo corretto e dimostrabile.
2. Preventivo esteticamente credibile.
3. Flusso end-to-end stabile.
4. Scenari alternativi e assumptions.
5. Gestione domande bloccanti.
6. Codice semplice, modulare e testato.

Meglio un MVP robusto con 5 feature perfettamente funzionanti che un tool ampio ma fragile.
