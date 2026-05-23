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

- [2026-05-23 14:57:00 CEST]: Update LLM Model for Complex JSON
  - *Details*: Aggiornato il modello in `.env.local` perché `gpt-oss-120b:free` non era in grado di generare JSON annidati complessi (ignorava l'array scenarios).
  - *Tech Notes*: Sostituito `OPENROUTER_MODEL` con `google/gemini-2.0-flash-lite-preview-02-05:free` e il fallback con `meta-llama/llama-3.3-70b-instruct:free`.

- [2026-05-23 15:06:00 CEST]: Switch provider from OpenRouter to Google Gemini
  - *Details*: Sostituito OpenRouter con Google AI Studio come provider AI globale come richiesto dall'utente, puntando al modello specificato (`gemini-3.5-flash`).
  - *Tech Notes*: Disinstallato `@openrouter/ai-sdk-provider` e installato `@ai-sdk/google`. Modificato `src/lib/ai/quote-agent.ts` per istanziare `createGoogleGenerativeAI` tramite la variabile ambiente `GEMINI_API_KEY`. Aggiornato il file `.env.local` rimpiazzando le vecchie chiavi OpenRouter con quelle Google e inserita un'azione manuale in `TO_SIMO_DO.md`.

- [2026-05-23 15:15:00 CEST]: Fix Vercel AI SDK Zod Intersection parsing issue
  - *Details*: Risolto un grave bug per cui il modello (anche Gemini) produceva JSON invalidi dimenticandosi di generare le stime temporali per i singoli ruoli all'interno del preventivo.
  - *Tech Notes*: Nel file `src/lib/ai/schemas.ts`, lo schema `RoleEffortSchema` faceva uso di una intersezione Zod (`.and(effortBounds)`). Vercel AI SDK fatica a compilare le intersezioni in un JSON Schema "Strict" (`allOf`), confondendo l'LLM che di conseguenza ometteva quei campi (`estimatedHoursExpected`, ecc.). L'oggetto è stato appiattito nativamente, risolvendo istantaneamente la mancata generazione dei campi. Validato con `test-gemini.ts` isolato.

- [2026-05-23 14:53:00 CEST]: Preventivo Generation Progressive Stepper Loader
  - *Details*: Aggiunto uno stepper di avanzamento deterministico a 5 step per arricchire l'esperienza visiva dell'utente durante l'analisi e la generazione del preventivo tecnico-economico.
  - *Tech Notes*: Modificato `components/requests/request-form.tsx`. Introdotto un timer progressivo sul client per gestire in modo fluido gli stati degli step (`pending`, `loading`, `completed`, `error`) e sincronizzarsi con l'esito della chiamata API. Implementata la logica di fast-forward al successo dell'analisi per una transizione immediata, pulita ed estremamente soddisfacente, e un gestore degli errori con bottone di reset all'interno dell'overlay modale. Validato con `pnpm verify`.

- [2026-05-23 14:56:00 CEST]: Progressive Stepper Loader Refinements
  - *Details*: Perfezionato il comportamento dello stepper del caricamento progressivo in base al feedback dell'utente: allungata la stima del tempo di caricamento complessivo a 10 secondi ed introdotta una pausa visiva tra i vari step deterministici, mostrando il segno di spunta ("checkmark") verde prima di avviare il caricamento del passaggio successivo.
  - *Tech Notes*: Modificato `components/requests/request-form.tsx`. Tarato l'intervallo a 105ms per incrementare la percentuale dallo 0% al 95% in esattamente 10 secondi (95 * 105ms = 9975ms). Suddivisi gli stadi del caricamento introducendo gap percentuali in cui lo step precedente è 'completed' mentre quello successivo rimane ancora 'pending', creando una transizione a spunta progressiva estremamente curata. Validato con `pnpm verify`.
- [2026-05-23 15:08:00 CEST]: Settings Read-Only Mode and Modifica Button
  - *Details*: Perfezionata la pagina settings (`app/(dashboard)/admin/settings/page.tsx`) introducendo una modalità di sola lettura predefinita ed un pulsante "Modifica" per abilitare il form, come da feedback utente.
  - *Tech Notes*: Aggiunto lo stato `isEditing` e `originalSettings` per memorizzare la configurazione caricata inizialmente. Disegnato un layout di visualizzazione a card ad alto impatto visivo con icone e hover effects. Aggiunti i bottoni "Annulla" e "Salva impostazioni" con ripristino istantaneo dello stato in caso di annullamento o completamento con successo. Validato con `pnpm verify`.
- [2026-05-23 15:09:00 CEST]: Settings Read-Only Text Color Contrast Fix
  - *Details*: Risolto il problema di contrasto visivo in cui i valori della griglia di sola lettura (PM percentage, Valuta, Risk Buffer) risultavano quasi invisibili (testo bianco su sfondo chiaro) in modalità dark mode a causa dell'applicazione indiscriminata del selettore `dark:text-slate-100` su contenitori a sfondo statico chiaro (`bg-[var(--surface-strong)]`).
  - *Tech Notes*: Modificato `app/(dashboard)/admin/settings/page.tsx`. Rimosse le classi `dark:text-slate-100` e `dark:border-slate-800` per i contenitori interni. Forzato il colore del testo a `text-slate-900` e il bordo a `border-[var(--border)]` per garantire un contrasto elevato, leggibile e del tutto coerente con il design system globale dell'applicazione. Validato con `pnpm verify`.
