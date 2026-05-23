# PreventivAI

Web app interna per software house che trasforma richieste cliente in preventivi tecnici modulari, verificabili ed esportabili.

Documentazione completa: **[README_ESTESO.md](./README_ESTESO.md)**

## Funzionalità

- Input richiesta cliente via testo o audio.
- Trascrizione audio tramite ElevenLabs.
- Analisi requisiti, vincoli, rischi e assumptions con AI.
- Generazione di uno o più scenari di preventivo.
- Domande bloccanti quando le informazioni non bastano.
- Stima ore per ruolo usando storico lavori su Supabase.
- Calcolo costi deterministico tramite rate card aziendale.
- Dashboard per includere/escludere moduli opzionali.
- Pagina preventivo esportabile in PDF.

## Stack

- Next.js App Router
- Supabase Postgres, Auth e RLS
- OpenRouter API per agente AI
- ElevenLabs API per speech-to-text
- PDF export da pagina web stampabile

## Setup rapido

```bash
git clone <REPOSITORY_URL>
cd preventivai
pnpm install
cp .env.example .env.local
```

Configura `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
ELEVENLABS_API_KEY=
```

Avvia database e app:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Apri `http://localhost:3000`.

## Utilizzo

1. Accedi alla web app.
2. Crea una richiesta di preventivo.
3. Inserisci testo cliente o carica audio.
4. Avvia analisi AI.
5. Rispondi a eventuali domande bloccanti.
6. Scegli lo scenario di preventivo.
7. Attiva/disattiva moduli opzionali.
8. Verifica ore, costi, assumptions e rischi.
9. Genera la pagina preventivo.
10. Scarica il PDF finale.

## Pricing

L’AI non inventa prezzi. Propone moduli, task, ruoli e ore; il backend calcola il costo finale usando solo tariffe e dati presenti su Supabase.

## Script

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm db:migrate
pnpm db:seed
```

## Struttura

```text
src/app
src/components
src/features
src/server
src/lib
supabase
docs
```

## Dettagli tecnici

Per architettura, schema database, RLS, prompt, AI orchestration, retrieval, calcolo preventivo, export PDF, testing, sicurezza e roadmap leggi **[README_ESTESO.md](./README_ESTESO.md)**.
