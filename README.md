# PreventivAI

PreventivAI e' una web app interna per generare preventivi
tecnico-economici modulari da richieste cliente testuali o audio. Il prototipo
usa Next.js, TypeScript, Tailwind, Zod e un pricing engine deterministico:
l'AI propone moduli, task, ruoli e ore, mentre il codice calcola i costi usando
solo la rate card ufficiale.

## Funzionalita' implementate

- Intake richiesta da testo con demo brief precaricato.
- Upload audio con trascrizione ElevenLabs server-side, o fallback demo senza
  API key.
- Analisi via OpenRouter configurabile, o fallback demo deterministico.
- Scenari multipli con assumptions, exclusions, rischi e timeline.
- Motore pricing testato con PM percentage, rate card snapshot e toggle moduli.
- Dashboard scenario con totale aggiornato in tempo reale.
- Preview cliente print-ready e download PDF.
- Supabase migration con schema, RLS, seed rate card, storico e storage buckets.

## Requisiti

- Node.js 22+
- pnpm 11+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- Supabase CLI opzionale per database locale

## Setup locale

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Apri `http://localhost:3000/requests`.

Senza chiavi reali l'app resta utilizzabile in demo mode:

- OpenRouter usa una risposta demo validata.
- ElevenLabs restituisce una trascrizione demo editabile.
- I dati richiesta sono salvati in `localStorage`.

## Variabili ambiente principali

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5
ELEVENLABS_API_KEY=
ELEVENLABS_STT_MODEL=scribe_v2
```

Non committare mai `.env.local`.

## Comandi

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify
```

## Supabase

La migration e' in `supabase/migrations/20260523120000_initial_schema.sql`.
Il seed iniziale e' in `supabase/seed.sql`.

```bash
pnpm db:start
pnpm db:reset
pnpm db:types
```

## Demo

1. Vai su `/requests`.
2. Apri il demo "MVP delivery cibo per animali" o crea una nuova richiesta.
3. Genera l'analisi.
4. Apri uno scenario e toggla un modulo opzionale.
5. Apri la preview e scarica il PDF.
