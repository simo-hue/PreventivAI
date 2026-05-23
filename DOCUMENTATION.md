- [2026-05-23 13:12:51 CEST]: PreventivAI MVP Bootstrap
  - *Details*: Implementata una web app Next.js/TypeScript per generare preventivi tecnico-economici da input testuale o audio, con demo end-to-end locale. Il flusso include intake richiesta, fallback trascrizione audio, analisi AI/mock validata con Zod, scenari multipli, domande di chiarimento, dashboard scenario, toggle moduli opzionali, preview cliente print-ready e export PDF. Il pricing e' deterministico e calcolato dal codice usando una rate card passata come input.
  - *Tech Notes*: Aggiunti Next.js App Router, React, Tailwind CSS v4, Supabase client/server/admin, Zod, OpenAI SDK compatibile OpenRouter, ElevenLabs STT server-side, pdf-lib, Vitest, ESLint e pnpm. Aggiunte route `/api/requests`, `/api/requests/[id]/analyze`, `/api/transcribe`, `/api/quote-scenarios/[id]/recalculate`, `/api/quote-scenarios/[id]/export-pdf`; pagine dashboard `/requests`, `/requests/new`, `/requests/[id]`, `/requests/[id]/scenarios/[scenarioId]`, admin rate card/history/settings e preview `/quotes/[scenarioId]/preview`. Aggiunta migration Supabase con schema core, RLS, storico lavori, storage bucket e seed rate card ufficiale. Verifica completata con `pnpm verify`.

- [2026-05-23 13:18:00 CEST]: Git Conflict Resolution & Repository Sync
  - *Details*: Risolto il conflitto di merge su README.md. Il codice e la struttura del progetto sono stati allineati a quanto presente sul repository online (origin/main), ad eccezione del file README.md (e di README_ESTESO.md) di cui è stata mantenuta la versione locale custom, come richiesto.
  - *Tech Notes*: Eseguito merge di 'origin/main' in 'main', risolvendo il conflitto su 'README.md' mantenendo la versione locale ('--ours'). Aggiunti tutti i file della codebase del repository remoto (79 file) mantenendo la coerenza con il codice online.

- [2026-05-23 14:37:00 CEST]: Fix OpenAI Structured Outputs Zod schema error
  - *Details*: Risolto l'errore generato dall'utilizzo di campi `.optional()` senza `.nullable()` nello schema Zod, che causava un errore API con OpenAI Structured Outputs.
  - *Tech Notes*: Sostituito `.optional()` con `.optional().nullable()` nello schema Zod in `src/lib/ai/schemas.ts` per i campi `description`, `userStory`, `dependencyNotes`, `riskNotes` e `answer`.

- [2026-05-23 14:43:00 CEST]: Debugging for OpenRouter JSON Parsing
  - *Details*: Aggiunti log di errore dettagliati in `quote-agent.ts` per indagare sui fallimenti di parsing e validazione Zod dell'output JSON restituito da OpenRouter.
  - *Tech Notes*: Intercettata l'eccezione di `JSON.parse` e stampato `parsed.error.format()` di Zod nella console server per facilitare il debug.

- [2026-05-23 14:49:00 CEST]: Migrate to Vercel AI SDK generateObject
  - *Details*: Sostituita l'implementazione grezza del parsing JSON con Vercel AI SDK per garantire la massima robustezza e gestire i formati malformati.
  - *Tech Notes*: Installati i pacchetti `ai` e `@openrouter/ai-sdk-provider`. Modificato `src/lib/ai/quote-agent.ts` per usare `generateObject` che possiede correzione nativa da blocchi markdown e logica di retry automatica incorporata. Impostato `maxRetries: 3`.
- [2026-05-23 14:53:00 CEST]: Preventivo Generation Progressive Stepper Loader
  - *Details*: Aggiunto uno stepper di avanzamento deterministico a 5 step per arricchire l'esperienza visiva dell'utente durante l'analisi e la generazione del preventivo tecnico-economico.
  - *Tech Notes*: Modificato `components/requests/request-form.tsx`. Introdotto un timer progressivo sul client per gestire in modo fluido gli stati degli step (`pending`, `loading`, `completed`, `error`) e sincronizzarsi con l'esito della chiamata API. Implementata la logica di fast-forward al successo dell'analisi per una transizione immediata, pulita ed estremamente soddisfacente, e un gestore degli errori con bottone di reset all'interno dell'overlay modale. Validato con `pnpm verify`.
- [2026-05-23 14:56:00 CEST]: Progressive Stepper Loader Refinements
  - *Details*: Perfezionato il comportamento dello stepper del caricamento progressivo in base al feedback dell'utente: allungata la stima del tempo di caricamento complessivo a 10 secondi ed introdotta una pausa visiva tra i vari step deterministici, mostrando il segno di spunta ("checkmark") verde prima di avviare il caricamento del passaggio successivo.
  - *Tech Notes*: Modificato `components/requests/request-form.tsx`. Tarato l'intervallo a 105ms per incrementare la percentuale dallo 0% al 95% in esattamente 10 secondi (95 * 105ms = 9975ms). Suddivisi gli stadi del caricamento introducendo gap percentuali in cui lo step precedente è 'completed' mentre quello successivo rimane ancora 'pending', creando una transizione a spunta progressiva estremamente curata. Validato con `pnpm verify`.
