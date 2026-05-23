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

- [2026-05-23 15:49:00 CEST]: Supabase Database Persistence Migration
  - *Details*: Migrato l'intero sistema di intake e generazione preventivi dal mock locale (`localStorage`) alla persistenza permanente su database relazionale Supabase.
  - *Tech Notes*: Modificati i file `request-repository.ts` e `quote-repository.ts` per usare il client `SupabaseAdmin` bypassando temporaneamente l'RLS per il salvataggio. L'albero complesso restituito da Gemini viene unrollato in memoria per gli ID generati (`quote_runs`, `quote_scenarios`, `quote_modules`, `quote_tasks`, `quote_task_efforts`) e salvato atomicamente tramite batch insertions sul database, permettendo analytics SQL. Le componenti UI sono state migrate ai React Server Components o alimentate via props. Validazione completa della codebase superata tramite `pnpm verify`.

- [2026-05-23 16:01:00 CEST]: Relaxed AI array schema constraints
  - *Details*: Risolto errore di validazione dell'intelligenza artificiale (`Too small: expected array to have >=1 items`) sostituendo i vincoli minimi sugli array interni con default vuoti.
  - *Tech Notes*: Nel file `src/lib/ai/schemas.ts`, rimossi `.min(1)` da `modules`, `tasks` ed `efforts` e rimpiazzati con `.default([])`. Questo impedisce crash nel momento in cui l'LLM omette o svuota gli array per logiche errate di ragionamento, mantenendo tolleranza agli errori durante il parsing Zod dell'AI SDK. Validato con `pnpm test`.
- [2026-05-23 15:55:00 CEST]: Italians quote it better Rebranding
  - *Details*: Eseguito il rebranding completo e coerente dell'intera web app da "PreventivAI" a "Italians quote it better".
  - *Tech Notes*: Modificati i file `app/layout.tsx` (metadati globali), `components/layout/app-shell.tsx` (logo sidebar e header mobile), `app/(auth)/login/page.tsx` (schermata di login), `components/quote/quote-preview-client.tsx` (subtitle preview cliente), `src/lib/pdf/render-quote-pdf.ts` (intestazione PDF generato), `src/lib/auth/require-user.ts` (domini email fittizi) e `package.json` (nome pacchetto). Validato con successo tramite `pnpm verify`.

- [2026-05-23 16:05:00 CEST]: Extended Quote Generation Stepper Duration
  - *Details*: Esteso il tempo di caricamento dello stepper deterministico di generazione preventivi a 20 secondi, in linea con le richieste dell'utente. In caso di attese più lunghe dell'API, il caricamento continua a bloccarsi all'ultimo step in attesa della risposta.
  - *Tech Notes*: Modificato `components/requests/request-form.tsx`. Aumentato l'intervallo del timer progressivo da 105ms a 210ms per incrementare la percentuale dallo 0% al 95% in circa 20 secondi (95 * 210ms = 19950ms). Il comportamento di blocco a 95% per attese superiori e fast-forward immediato al successo rimangono inalterati. Validato con `pnpm verify`.

- [2026-05-23 16:17:00 CEST]: Interactive Q&A, Manual Quote Editing & Delivered Flow
  - *Details*: Introdotte funzionalità avanzate interattive per il preventivo. Ora le domande di chiarimento possono essere risposte direttamente dalla dashboard: l'inserimento triggera la rigenerazione immediata dello scenario AI tenendo conto del nuovo contesto. È possibile modificare manualmente titoli e ore stimate all'interno di un preventivo generato, e premere "Salva" per renderle persistenti sul database. Introdotto lo stato "Consegnato" per completare il ciclo di vita del preventivo.
  - *Tech Notes*: 
    - **Interactive Q&A**: Aggiunti text input in `QuestionRow`. L'endpoint `POST /api/requests/[id]/clarifications` ora appende le risposte alla `raw_text` ed è possibile invocare un ricalcolo immediato tramite `POST /api/requests/[id]/analyze` senza body payload, che rilegge dal database i nuovi indizi.
    - **Manual Editing**: L'UI in `ScenarioDetailClient` ricalcola in locale totali e sub-totali tramite i toggle e i nuovi campi (usando la non-null assertion per i check di ID su dati già fetchati dal db). L'endpoint `PUT /api/quote-scenarios/[id]` cancella ricorsivamente la vecchia gerarchia (effort, task, module) dello scenario ed inserisce l'albero aggiornato. Per coerenza coi dati del DB, `getQuoteRunForRequest` non legge più dal raw JSON del DB, ma riesegue una mega-join per idratare l'UI sempre con l'ultima verità relazionale.
    - **Delivered**: Aggiunto stato `delivered` agli enum locali. Inserita file di migrazione SQL `20260523141500_add_delivered_status.sql` per far rilasciare il `CHECK` constraint a Postgres. Implementato l'endpoint `PUT /api/requests/[id]/status` per transizionare verso il nuovo stato.
    - **Verifica**: Verificato che i file e i tipi siano allineati, aggiunto `id` mancante in `PricedEffort` e `PricedTask`. Typechecking superato con `pnpm tsc --noEmit`.

- [2026-05-23 16:35:00 CEST]: Fix Totale 0€ e PM 0h dopo risposta a domande di chiarimento
  - *Details*: Risolti tre bug critici che causavano Totale = 0€ e PM = 0h in fase di generazione e aggiornamento del preventivo.
    1. **`cost_eur` mancante nel salvataggio efforts** – Nel `createQuoteRun`, l'insert di `quote_task_efforts` non includeva il campo `cost_eur`, rendendo il valore `null` al reload e azzerando subtotali e totali.
    2. **`pmHours` e `nonPmHours` hardcodati a 0** – Nel `getQuoteRunForRequest` e `getScenarioById`, i campi `pmHours` e `nonPmHours` erano impostati a 0 invece di essere ricalcolati dagli efforts del DB.
    3. **Architettura localStorage-first per scenario/preview** – `ScenarioDetailClient` e `QuotePreviewClient` leggevano solo da `localStorage`, che non veniva aggiornato dopo una ri-analisi post-clarification. Ora i dati arrivano dal Server Component come props `initialScenario`/`initialRequest`, con `localStorage` come fallback solo per la demo.
  - *Tech Notes*:
    - `src/server/repositories/quote-repository.ts`: Aggiunto `cost_eur` nell'insert di `quote_task_efforts`; aggiunta funzione `getScenarioById`; `subtotalEur` dei task ricalcolato dal lato server invece di usare il mock `0`; `pmHours`/`nonPmHours` calcolati dagli efforts del DB (fallback 10% se non rilevabile).
    - `app/(dashboard)/requests/[id]/scenarios/[scenarioId]/page.tsx`: Ora fetcha scenario e request dal DB e li passa come `initialScenario`/`initialRequest` al client.
    - `app/quotes/[scenarioId]/preview/page.tsx`: Ora fetcha lo scenario dal DB e lo passa come `initialScenario` al `QuotePreviewClient`.
    - `components/quote/scenario-detail-client.tsx`: Accetta `initialScenario?` e `initialRequest?` come props dal server; preferisce questi dati se disponibili.
    - `components/quote/quote-preview-client.tsx`: Accetta `initialScenario?` dal server come fonte di verità principale.
    - Build Next.js: ✅ Zero errori TS, zero errori di build.

- [2026-05-23 16:48:00 CEST]: Fix pagina "Dettaglio" preventivo completamente vuota
  - *Details*: La pagina di dettaglio scenario mostrava un alert vuoto a causa di 3 problemi combinati:
    1. Il guard `!request || !scenario || !recalculated` richiedeva `request` (localStorage) per renderizzare — ma `request` era sempre null per scenari dal DB.
    2. `recalculateScenario` poteva lanciare eccezione (role mismatch) dentro `useMemo` senza error handling, rendendo `recalculated` null.
    3. Il componente dipendeva ancora da localStorage anche dopo l'introduzione delle server props.
  - *Tech Notes*:
    - **`components/quote/scenario-detail-client.tsx`**: Refactoring completo. Rimosso `request` come requisito per il rendering. Aggiunto `try/catch` attorno a `recalculateScenario` con fallback al scenario grezzo dal DB. Props semplificate: `scenarioId`, `requestId`, `initialScenario`, `requestInfo`. Aggiunto stato di loading. Nessuna dipendenza da localStorage per i dati di scenario.
    - **`app/(dashboard)/requests/[id]/scenarios/[scenarioId]/page.tsx`**: Aggiornato per passare le nuove props al client component.
    - **`app/api/quote-scenarios/[id]/route.ts`**: Aggiunta `GET` handler che ritorna il scenario completo dal DB — usata come fallback client-side se `initialScenario` è null.
    - Build: ✅ Zero errori TS, zero errori di build.

- [2026-05-23 17:03:00 CEST]: Fix campi null in client_requests (normalized_text, budget, deadline, timeline)
  - *Details*: I campi `normalized_text`, `client_budget_eur`, `client_deadline` e `client_timeline_text` della tabella `client_requests` risultavano sempre `null` perché il codice non scriveva mai questi dati estratti dall'AI sul database. L'analisi AI produce correttamente `summary`, `detectedBudgetEur`, `detectedDeadline` e `detectedTimelineText` ma la funzione `createQuoteRun` aggiornava solo lo `status` della richiesta, ignorando tutti gli altri campi.
  - *Tech Notes*:
    - **`src/server/repositories/quote-repository.ts`**: Aggiornata la funzione `createQuoteRun` per scrivere `normalized_text` (dal campo AI `summary`), `client_budget_eur`, `client_deadline` e `client_timeline_text` nella tabella `client_requests` insieme all'aggiornamento di stato. Aggiunto error logging esplicito.
    - **`src/server/repositories/request-repository.ts`**: Corretto `getAllClientRequests` che restituiva `created_at` come `updatedAt` invece di usare `updated_at`.
    - **`supabase/migrations/20260523170000_backfill_client_request_fields.sql`**: Creata migrazione SQL di backfill che estrae i valori dai `quote_runs.llm_raw_response` (JSON) e li scrive retroattivamente nei campi null delle righe `client_requests` esistenti.
    - Build TypeScript: ✅ Zero errori.

- [2026-05-23 17:40:00 CEST]: Fix Premium Scenario Generation with missing modules
  - *Details*: Risolto il problema per cui lo scenario "Premium" generato dall'AI risultava vuoto (Totale 0€) avendo solo i moduli opzionali aggiuntivi e perdendo i moduli del piano base.
  - *Tech Notes*: Modificato `src/lib/ai/prompts/quote-analysis.v1.ts` per istruire rigorosamente il LLM a generare scenari completi e autonomi, duplicando/riadattando i moduli di base anche nei piani premium e alternative, senza restituire solo un delta differenziale. Aggiornata la versione a `v1.1`.

- [2026-05-23 17:58:00 CEST]: Move Delivered Requests to History Tab
  - *Details*: Implementato il comportamento per cui i preventivi contrassegnati come "Delivered" vengono rimossi dalla vista "Richieste" e inseriti nella tab "History", mantenendo tutte le loro informazioni e possibilità di ispezione.
  - *Tech Notes*: Modificato `src/server/repositories/request-repository.ts` per supportare il filtraggio per stato in `getAllClientRequests`. Aggiornato `app/(dashboard)/requests/page.tsx` per escludere lo stato `delivered`. Refattorizzato `RequestListClient` in `components/requests/request-list-client.tsx` per renderlo riutilizzabile e usato per sovrascrivere la pagina in `app/(dashboard)/admin/history/page.tsx`.

- [2026-05-23 18:01:00 CEST]: Fix Invalid effort bounds error on manual quote editing
  - *Details*: Risolto un bug che causava un crash invisibile del `recalculateScenario` (visibile nella console e come avviso "Avviso prezzi") quando si modificavano manualmente le ore di effort di un task dal pannello di dettaglio.
  - *Tech Notes*: Modificato `updateEffortHours` all'interno di `components/quote/scenario-detail-client.tsx`. Quando viene modificato `estimatedHoursExpected` dalla UI, il sistema ora auto-aggiusta `estimatedHoursMin` e `estimatedHoursMax` per evitare che la validazione `min <= expected <= max` di `assertEffortBounds` (`pricing-engine.ts`) fallisca.

- [2026-05-23 18:05:00 CEST]: Aggiunta eliminazione richiesta preventiva
  - *Details*: Inserito il tasto per eliminare un preventivo direttamente dalla lista "Requests", implementando una logica per cancellarlo dal database in modo sicuro previa conferma utente.
  - *Tech Notes*: Aggiunto bottone in `RequestListClient` (`components/requests/request-list-client.tsx`) usando `lucide-react` e `useTransition`. Creata Server Action `deleteRequestAction` in `app/(dashboard)/requests/actions.ts` che esegue `revalidatePath`. Creata la funzione `deleteClientRequest` in `src/server/repositories/request-repository.ts` per l'eliminazione fisica tramite Supabase Admin.

- [2026-05-23 18:16:00 CEST]: Ammodernamento estetico e traduzione italiana
  - *Details*: Eseguito il restyling globale dell'applicativo usando una palette di colori minimale e professionale (scala di grigi con alto contrasto, no rosso), in linea con le forme del nuovo logo inserito. Tradotta la Navigation Bar, gli stati delle richieste e l'interfaccia utente in lingua italiana.
  - *Tech Notes*: Rimosso tema azzurro/petrolio da `app/globals.css` in favore di variabili per un design dark slate/zinc minimale (`zinc-900` primario). Ridisegnati `components/ui/button.tsx` e `components/ui/card.tsx` introducendo angoli più morbidi (`rounded-xl` e `rounded-lg`), transizioni veloci (`active:scale-[0.98]`) e outline minimal. Rimosso border dai badges. Rinominate tutte le view e i navigation link in `components/layout/app-shell.tsx` e `components/requests/request-list-client.tsx`. Inoltre, caricato `/logo.png` nel layout, impostato altezza contenitore `h-20` (80px) e altezza logo `h-14` per renderlo visivamente più grande e leggibile. Tradotti anche gli stati e le tipologie scenario in `components/quote/scenario-dashboard.tsx` e `components/quote/scenario-detail-client.tsx`.

- [2026-05-23 18:38:00 CEST]: Rimozione voce "Nuova richiesta" dalla sidebar
  - *Details*: Rimossa la voce di navigazione "Nuova richiesta" dalla barra laterale dell'applicazione per semplificare il menu.
  - *Tech Notes*: Modificato `components/layout/app-shell.tsx` per rimuovere la voce `Nuova richiesta` dall'array `navItems` e l'icona inutilizzata `Plus` dalle importazioni di `lucide-react`. Validato superando con successo `pnpm typecheck` e `pnpm test`.

- [2026-05-23 18:47:00 CEST]: Persistenza Tariffario su DB Supabase
  - *Details*: Modificato il funzionamento del sistema dei Rate Card affinché le modifiche fatte dall'interfaccia utente siano definitive e persistenti nel database, anziché resettarsi (per via del precedente array mock).
  - *Tech Notes*: 
    - Implementato `getActiveRateCards` e aggiunto `updateRateCards` in `src/server/repositories/rate-card-repository.ts` per interrogare e aggiornare la tabella `role_rate_cards` tramite Supabase Admin.
    - Sostituiti tutti gli import di `officialRateCards` con la funzione async `getActiveRateCards()` all'interno delle route di backend `app/api/requests/[id]/analyze/route.ts` e `app/api/quote-scenarios/[id]/recalculate/route.ts` (assicurando che l'AI usi i prezzi appena salvati).
    - Creata API Route `app/api/admin/rate-cards/route.ts` con i metodi GET e POST per la gestione.
    - Aggiornata la UI in `RateCardPage` per caricare i dati asincronamente dall'API all'avvio e chiamare l'endpoint POST con i dati modificati salvandoli realmente sul server, con aggiunta di loader e messaggi di successo. Build verificata positivamente.

- [2026-05-23 18:48:00 CEST]: Pop-up Eliminazione Richieste Personalizzato Premium
  - *Details*: Sostituito il pop-up nativo del browser (`window.confirm`) con un modale di conferma personalizzato, moderno e coerente con il design system dell'applicazione per la rimozione delle richieste.
  - *Tech Notes*: Creato un nuovo componente riutilizzabile ed accessibile `<ConfirmDialog>` in `components/ui/confirm-dialog.tsx` con overlay scuro, effetto sfocatura (`backdrop-blur-xs`), icone animate lucide, supporto per la chiusura tramite tasto ESC o clic all'esterno e indicatore di caricamento (`Loader2`) integrato per la disattivazione temporanea dei bottoni durante le eliminazioni server-side. Integrato in `components/requests/request-list-client.tsx` modificando il flusso di gestione degli stati. Superati con successo i controlli con `pnpm typecheck` e `pnpm test`.

- [2026-05-23 19:03:00 CEST]: Risoluzione bug visibilità step attivo in generazione preventivo
  - *Details*: Risolto il bug di contrasto cromatico per cui il titolo dell'operazione corrente, la percentuale di caricamento e lo spinner nel modale di generazione preventivo risultavano invisibili (testo quasi nero su sfondo scuro) in dark mode.
  - *Tech Notes*: Modificato `components/requests/request-form.tsx`. Sostituito l'uso indiscriminato di `text-[var(--primary)]` (che mappa sul colore scuro `#18181b`) per lo step in stato `isLoading` con la combinazione `text-cyan-600 dark:text-cyan-400 font-bold`. Applicata la stessa logica di contrasto elevato con classi Tailwind per l'icona Sparkles, la percentuale progressiva e lo spinner del cerchio di caricamento, migliorando l'accessibilità visiva sia in light mode che in dark mode.


- [2026-05-23T19:22:00+02:00]: Public Home Page and Client Registration Flow
  - *Details*: Added a `/home` public route to act as a landing page for potential clients. This page contains a form to submit a new project request. Submitting the form opens a modal that allows clients to create an account. A database migration was added to include an `is_customer` column in the `profiles` table, which defaults to true, and a trigger to auto-create profiles for new users under the default organization `00000000-0000-0000-0000-000000000001`.
  - *Tech Notes*:
    - Created `app/home/page.tsx`.
    - Created `components/public/client-landing.tsx` and `components/public/signup-modal.tsx`.
    - Modal uses `createSupabaseBrowserClient()` to register the user, then calls `POST /api/requests` and `POST /api/requests/[id]/analyze` to generate the quote immediately.
    - Added migration `20260523191800_add_is_customer_to_profiles.sql` with a Postgres trigger `on_auth_user_created`.

- [2026-05-23T19:31:00+02:00]: Customer Personal Page & Registration Flow Update
  - *Details*: Modified the client registration flow to bypass automatic quote generation UI. Now, upon signup and project submission, clients are immediately redirected to their personal dashboard at `/customer/[id]`. This new page features a split layout (2/3 left for project details and future quotes, 1/3 right for future chat).
  - *Tech Notes*:
    - Removed `/api/requests/[id]/analyze` call and `isGenerating` state from `components/public/signup-modal.tsx`.
    - Created `app/customer/[id]/page.tsx` with a responsive grid layout. Fetches user's latest request via `createSupabaseServerClient`.
    - Typecheck passed successfully (`pnpm typecheck`).

- [2026-05-23T19:34:00+02:00]: Fix Signup Modal Email Already in Use Error
  - *Details*: Fixed a bug where signing up with an already registered email resulted in a "ID non trovato" error. Now, the system detects if the email is already in use and seamlessly attempts to log the user in with the provided password, continuing the flow.
  - *Tech Notes*:
    - Modified `components/public/signup-modal.tsx` to handle `authData.user` being null or having empty identities, triggering a fallback to `supabase.auth.signInWithPassword`.
    - Fixed reference to `user.id` during the redirect.

- [2026-05-23T19:37:00+02:00]: Refactor Auth Flow to Prevent Email Rate Limits
  - *Details*: Resolves the `email rate limit exceeded` error from Supabase during testing with existing emails. The signup modal now proactively attempts to log the user in first. If the login fails due to invalid credentials, it falls back to creating a new account.
  - *Tech Notes*:
    - Inverted the auth logic in `components/public/signup-modal.tsx`: `signInWithPassword` is called first, catching `Invalid login credentials` to trigger `signUp`.
    - Translated the Supabase rate limit error to a friendly Italian message for true new signups.

- [2026-05-23T19:50:00+02:00]: Signup Modal Dark Mode Contrast & Readability Fix
  - *Details*: Resolved visual contrast issues in the `/home` page's project submission/signup modal. The modal background converted to dark mode due to system theme preferences, but text labels, descriptions, and the cancel button remained dark slate, making them completely unreadable.
  - *Tech Notes*:
    - Modified `components/public/signup-modal.tsx` to add proper responsive `dark:` styling.
    - Updated heading `<h2>` to `text-slate-900 dark:text-white`.
    - Updated subtitle `<p>` to `text-slate-600 dark:text-slate-400`.
    - Updated `<label>` components to `text-slate-700 dark:text-slate-300`.
    - Added high-contrast, beautiful dark mode backgrounds, borders, and placeholders to form inputs (`dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100`).
    - Fixed Cancel and Submit buttons to adapt beautifully to dark mode, adding premium hover states and backgrounds.
    - Resolved a pre-existing ESLint `any` error in the `catch` block to ensure the build pipeline remains clean. Verified successfully with `pnpm verify`.


- [2026-05-23T19:55:00+02:00]: Refactor Professional Signup Flow in Modal
  - *Details*: Risolto un problema di architettura nel flusso di registrazione (`components/public/signup-modal.tsx`) che generava fastidiosi errori 400 (Bad Request) e successivi 429 (Too Many Requests) durante il primo tentativo di creazione di un account.
  - *Tech Notes*: Il flusso precedente eseguiva prima un tentativo di `signInWithPassword` (che generava l'errore 400 di default su account inesistenti) per poi fare fallback su `signUp`, portando rapidamente all'esaurimento dei rate limit di Supabase locali in caso di multipli test. L'architettura è stata riscritta per rispecchiare le best practice: viene invocato prima `signUp`. Se Supabase restituisce `identities: []` (privacy mode per email già in uso) o l'errore `already registered`, il sistema effettua un fallback trasparente al login `signInWithPassword`. Inoltre è stata aggiunta la traduzione in italiano per gli errori comuni come password troppo debole o rate limit superato.

- [2026-05-23T20:08:00+02:00]: Customer Area Dashboard Refactoring
  - *Details*: L'area personale del cliente (`/customer/[id]`) è stata trasformata in una vera e propria dashboard. Ora l'utente vede l'elenco di tutte le proprie richieste (in forma di card), un pulsante per crearne di nuove, e può aprire ogni singola richiesta in una pagina di dettaglio dedicata (`/customer/[id]/requests/[requestId]`). Aggiunta inoltre la barra laterale con il logo come richiesto.
  - *Tech Notes*: Creato `app/customer/[id]/layout.tsx` (con params estratti asincronamente tramite `Promise`) che ospita la left-sidebar col logo e un bottone logout. Riscritto `app/customer/[id]/page.tsx` per invocare il nuovo client component `components/customer/customer-request-list.tsx`, che mappa l'array di richieste fetchato via server e gestisce il modale "Nuovo Progetto". Spostata la vecchia UI (split-view del progetto e chat) nella nuova dynamic route `/customer/[id]/requests/[requestId]/page.tsx`. Aggiornato `request-repository.ts` con i metodi `getAllClientRequestsByUserId` e `getClientRequestByIdAndUserId`. Costruzione validata senza errori (TS pass).

- [2026-05-23T20:15:00+02:00]: Fix Customer Request DB Linkage
  - *Details*: Risolto il problema per cui i progetti creati dal cliente non comparivano nella sua area personale. Il preventivo ora viene forzatamente ed esplicitamente legato all'identificativo del cliente al momento del salvataggio nel database.
  - *Tech Notes*: Modificati `components/public/signup-modal.tsx` e `components/customer/customer-request-list.tsx` per inviare esplicitamente il `customerId` nel payload al `POST /api/requests`. Aggiornato `app/api/requests/route.ts` per accettare tale parametro e `createClientRequest` in `request-repository.ts` per utilizzarlo in modo da valorizzare correttamente la colonna `created_by` anche nel caso in cui i cookie di sessione post-auth non vengano propagati in tempo utile.
