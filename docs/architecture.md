# PreventivAI Architecture

PreventivAI is implemented as a Next.js App Router application with server-side
API routes for integrations and deterministic pricing.

## Runtime Modes

- Demo mode works without external keys and stores requests in browser
  localStorage.
- Production mode is prepared through Supabase migrations, RLS policies and
  server-only clients.
- OpenRouter and ElevenLabs are called only from server modules when API keys
  are configured.

## Core Boundaries

- `src/lib/ai` validates structured LLM output with Zod and falls back to demo
  analysis when OpenRouter is not configured.
- `src/lib/quotes/pricing-engine.ts` is the only place where costs are
  calculated.
- `src/lib/demo/rate-card.ts` mirrors the Supabase seed for local demo only.
  The engine receives the rate card as input, so replacing it with Supabase data
  does not alter pricing logic.
- `app/api/quote-scenarios/[id]/export-pdf` generates a real downloadable PDF
  from the current priced scenario payload.

## Data Model

The Supabase migration includes organizations, profiles, role and employee rate
cards, request assets, historical projects, quote runs, clarification
questions, scenarios, modules, tasks, effort snapshots, exports and AI call
logs. RLS is enabled for all application tables.
