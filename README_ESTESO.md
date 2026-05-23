# PreventivAI

PreventivAI è una web app interna per software house e agenzie digitali che trasforma richieste cliente non strutturate — testo, email, documento o audio — in preventivi tecnici modulari, verificabili e scaricabili in PDF.

Il tool analizza la richiesta, identifica requisiti e ambiguità, genera user stories e task tecnici, recupera casi simili dallo storico aziendale, applica il tariffario ufficiale presente su Supabase e produce uno o più scenari di preventivo con assunzioni esplicite.

---

## Indice

1. [Obiettivo](#obiettivo)
2. [Funzionalità principali](#funzionalità-principali)
3. [Stack tecnologico](#stack-tecnologico)
4. [Architettura logica](#architettura-logica)
5. [Prerequisiti](#prerequisiti)
6. [Setup locale](#setup-locale)
7. [Variabili ambiente](#variabili-ambiente)
8. [Setup Supabase](#setup-supabase)
9. [Comandi disponibili](#comandi-disponibili)
10. [Come utilizzare il tool](#come-utilizzare-il-tool)
11. [Flusso demo consigliato](#flusso-demo-consigliato)
12. [Regole di calcolo](#regole-di-calcolo)
13. [Struttura progetto](#struttura-progetto)
14. [Troubleshooting](#troubleshooting)
15. [Checklist pre-demo](#checklist-pre-demo)

---

## Obiettivo

L’obiettivo di PreventivAI è ridurre il tempo necessario per produrre preventivi tecnico-economici, aumentando coerenza, trasparenza e controllo dello scope.

Il sistema deve aiutare account manager, project manager e tech lead a:

- trasformare una richiesta vaga in una proposta strutturata;
- separare funzionalità obbligatorie, opzionali e fuori scope;
- stimare ore e costi usando dati aziendali reali;
- confrontare il nuovo progetto con lavori precedenti simili;
- generare scenari alternativi quando esistono assunzioni non bloccanti;
- produrre domande per il cliente quando mancano informazioni fondamentali;
- scaricare un preventivo cliente in PDF.

Principio fondamentale: **l’LLM può proporre task, ore, rischi e assumptions, ma il calcolo economico deve essere deterministico, verificabile e calcolato dal codice applicativo usando solo il tariffario presente nel database.**

---

## Funzionalità principali

### Input richiesta cliente

L’utente interno può creare un preventivo partendo da:

- testo libero copiato nella web app;
- email o brief incollato manualmente;
- documento caricato;
- file audio caricato e trascritto tramite ElevenLabs.

### Analisi AI

L’agente AI, chiamato tramite OpenRouter, deve analizzare l’input e restituire output strutturato contenente:

- sintesi della richiesta;
- obiettivi del cliente;
- requisiti funzionali;
- requisiti non funzionali;
- vincoli di budget;
- vincoli di timeline;
- funzionalità obbligatorie;
- funzionalità opzionali;
- rischi tecnici;
- assumptions;
- eventuali domande bloccanti;
- scenari alternativi di preventivo.

### Gestione domande bloccanti

Se una mancanza informativa impedisce una stima affidabile, il sistema non deve generare subito il preventivo finale.

Esempi di dubbi bloccanti:

- non è chiaro se serva app mobile nativa, app cross-platform o web app responsive;
- non è chiaro se il cliente possiede già un backend;
- non è chiaro se i pagamenti devono essere reali o simulati;
- non è chiaro se esistono obblighi legali, privacy o compliance;
- manca il perimetro minimo del prodotto.

In questi casi la web app deve mostrare:

- domanda da inviare al cliente;
- motivazione;
- impatto sulla stima;
- campo per inserire la risposta;
- pulsante per rilanciare l’analisi.

### Scenari multipli

Quando il dubbio non è bloccante, il tool può generare più scenari.

Esempi:

- **MVP essenziale**: solo funzionalità core, costo ridotto.
- **Scenario consigliato**: equilibrio tra budget, rischio e qualità.
- **Scenario completo**: include moduli opzionali e maggiore copertura funzionale.
- **Build custom**: massima flessibilità, maggior effort.
- **Servizi esterni**: minor sviluppo custom, più dipendenze da provider terzi.

Ogni scenario deve indicare:

- moduli inclusi;
- moduli esclusi;
- assumptions;
- rischi;
- effort stimato;
- costo totale;
- coerenza con budget e deadline.

### Dashboard modulare

La dashboard del preventivo deve permettere di:

- visualizzare i moduli funzionali;
- attivare o disattivare moduli opzionali;
- vedere il prezzo aggiornarsi in tempo reale;
- vedere le ore totali aggiornarsi in tempo reale;
- evidenziare sforamenti di budget;
- evidenziare rischi di pianificazione;
- mostrare il dettaglio dei calcoli per ogni task.

### Output cliente

Il preventivo finale deve essere disponibile come:

- pagina web responsive e presentabile;
- pagina stampabile;
- PDF scaricabile.

La pagina cliente deve includere almeno:

- copertina;
- sintesi del progetto;
- scenario scelto;
- moduli inclusi;
- moduli opzionali;
- timeline;
- investimento economico;
- assumptions;
- esclusioni;
- rischi;
- prossimi step.

---

## Stack tecnologico

Stack consigliato per il progetto:

- **Next.js App Router** per frontend e backend applicativo;
- **React** per UI component-based;
- **TypeScript strict** per robustezza del codice;
- **Tailwind CSS** per styling rapido e coerente;
- **shadcn/ui** per componenti accessibili e riutilizzabili;
- **Supabase PostgreSQL** come database principale;
- **Supabase Auth** per autenticazione interna;
- **Supabase Storage** per audio, documenti e PDF;
- **Supabase Row Level Security** per protezione dati;
- **pgvector** per ricerca semantica su storico progetti;
- **OpenRouter API** per chiamata LLM;
- **ElevenLabs Speech-to-Text** per trascrizione audio;
- **Zod** per validazione input e output AI;
- **Playwright o Puppeteer** per export PDF server-side;
- **Vitest** per unit test;
- **Playwright Test** per end-to-end test.

---

## Architettura logica

```text
Utente interno
   |
   |-- testo / documento / audio
   v
Web App Next.js
   |
   |-- se audio: trascrizione ElevenLabs
   |-- se documento: estrazione testo
   |-- se testo: normalizzazione input
   v
Pipeline AI
   |
   |-- embedding richiesta
   |-- recupero progetti storici simili da Supabase
   |-- recupero tariffario ufficiale
   |-- chiamata OpenRouter con prompt strutturato
   |-- validazione output JSON con Zod
   v
Motore preventivo
   |
   |-- calcolo deterministico dei costi
   |-- generazione scenari
   |-- salvataggio snapshot tariffe
   |-- gestione moduli opzionali
   v
Dashboard preventivo
   |
   |-- toggle moduli
   |-- totale live
   |-- rischi e assumptions
   |-- pagina cliente
   |-- PDF download
```

---

## Prerequisiti

Prima di avviare il progetto servono:

- Node.js LTS;
- npm, pnpm o yarn;
- account Supabase;
- progetto Supabase configurato;
- API key OpenRouter;
- API key ElevenLabs, se si vuole usare l’upload audio;
- browser Chromium installabile da Playwright/Puppeteer per export PDF server-side;
- repository Git.

---

## Setup locale

### 1. Clonare il repository

```bash
git clone <repository-url>
cd preventivai
```

### 2. Installare le dipendenze

Con npm:

```bash
npm install
```

Oppure con pnpm:

```bash
pnpm install
```

### 3. Creare il file ambiente

```bash
cp .env.example .env.local
```

Compilare `.env.local` con le chiavi reali.

### 4. Avviare il progetto

```bash
npm run dev
```

Oppure:

```bash
pnpm dev
```

Aprire il browser su:

```text
http://localhost:3000
```

---

## Variabili ambiente

Creare un file `.env.example` con questa struttura, senza valori reali:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase public client
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase server-side only
SUPABASE_SERVICE_ROLE_KEY=

# OpenRouter
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=PreventivAI

# ElevenLabs
ELEVENLABS_API_KEY=

# PDF
PDF_EXPORT_MODE=browser
PDF_STORAGE_BUCKET=generated-estimates

# Upload limits
MAX_AUDIO_UPLOAD_MB=50
MAX_DOCUMENT_UPLOAD_MB=20
```

Regole importanti:

- non committare mai `.env.local`;
- non esporre mai `SUPABASE_SERVICE_ROLE_KEY` nel frontend;
- usare le variabili `NEXT_PUBLIC_*` solo per dati realmente pubblici;
- ruotare le chiavi API se vengono accidentalmente esposte.

---

## Setup Supabase

### 1. Creare progetto Supabase

Creare un nuovo progetto Supabase dalla dashboard.

Annotare:

- Project URL;
- anon public key;
- service role key.

### 2. Abilitare estensione vector

Nel SQL editor Supabase eseguire:

```sql
create extension if not exists vector;
```

### 3. Tabelle minime

Il database deve contenere almeno queste tabelle:

```text
rate_cards
employees
employee_rate_cards
project_histories
estimate_requests
estimates
estimate_scenarios
estimate_modules
estimate_tasks
estimate_questions
estimate_assumptions
estimate_risks
estimate_exports
ai_audit_logs
```

### 4. Rate card ufficiale

La tabella `rate_cards` deve essere popolata con il tariffario ufficiale. Queste tariffe sono la base obbligatoria per il calcolo economico.

```sql
insert into rate_cards (
  role_name,
  seniority,
  hourly_rate,
  currency,
  main_competence,
  is_active
) values
  ('Product Manager / Agile Coach', 'Senior', 85, 'EUR', 'Gestione progetto, roadmap, definizione requisiti.', true),
  ('UX/UI Designer', 'Senior', 75, 'EUR', 'Wireframe, user flow, design dell''interfaccia.', true),
  ('UX/UI Designer', 'Junior', 45, 'EUR', 'Declinazione grafiche, piccoli adattamenti, icone.', true),
  ('Software Architect', 'Specialist', 95, 'EUR', 'Progettazione database, infrastruttura Cloud, sicurezza.', true),
  ('Full-Stack / Backend Developer', 'Senior', 70, 'EUR', 'Sviluppo logica core, API, integrazioni complesse.', true),
  ('Frontend Developer', 'Mid', 55, 'EUR', 'Sviluppo interfaccia web/mobile, animazioni, reattività.', true),
  ('QA / Tester Engineer', 'Mid', 50, 'EUR', 'Test automatizzati, bug hunting, controllo qualità.', true),
  ('DevOps Engineer', 'Senior', 80, 'EUR', 'Deploy su AWS/Azure, CI/CD pipelines, ottimizzazione server.', true);
```

### 5. Storico progetti

La tabella `project_histories` deve contenere i lavori precedenti dell’azienda.

Campi consigliati:

```text
id
project_name
client_sector
description
modules
technologies
actual_hours
actual_cost
team_composition
complexity
risks
lessons_learned
embedding
created_at
updated_at
```

Questa tabella viene usata per recuperare progetti simili e aiutare l’LLM a stimare ore coerenti.

### 6. Row Level Security

Abilitare RLS su tutte le tabelle applicative.

Regole base:

- gli utenti autenticati possono leggere e creare preventivi;
- solo ruoli admin possono modificare rate card;
- solo ruoli admin possono modificare storico progetti;
- la service role key può essere usata solo lato server per operazioni controllate;
- i file su Storage devono essere accessibili solo agli utenti autorizzati.

---

## Comandi disponibili

### Avvio sviluppo

```bash
npm run dev
```

### Build produzione

```bash
npm run build
```

### Avvio produzione

```bash
npm run start
```

### Lint

```bash
npm run lint
```

### Type check

```bash
npm run typecheck
```

### Test unitari

```bash
npm run test
```

### Test end-to-end

```bash
npm run test:e2e
```

### Migrazioni Supabase

```bash
supabase db push
```

### Seed dati demo

```bash
npm run db:seed
```

---

## Come utilizzare il tool

### 1. Accesso

Aprire l’applicazione:

```text
http://localhost:3000
```

In produzione usare l’URL pubblico configurato.

Effettuare login con un account interno autorizzato.

### 2. Creare un nuovo preventivo

Dalla dashboard cliccare:

```text
Nuovo preventivo
```

Il sistema apre la schermata di acquisizione richiesta cliente.

### 3. Inserire la richiesta cliente

Sono disponibili tre modalità.

#### Modalità A — Testo libero

Incollare nel campo principale il testo ricevuto dal cliente.

Esempio:

```text
Ciao! Vogliamo lanciare una piattaforma MVP per delivery di cibo per animali.
Ci serve un'app mobile iOS e Android, registrazione utenti, profilo animale,
abbonamento mensile con Stripe, mappa rider e una sezione social opzionale.
Budget massimo 25.000€ e deadline 3 mesi.
```

Cliccare:

```text
Analizza richiesta
```

#### Modalità B — Upload audio

Caricare un file audio della call commerciale.

Il sistema deve:

1. caricare il file in Supabase Storage;
2. inviarlo alle API ElevenLabs;
3. ricevere la trascrizione;
4. mostrare il testo trascritto;
5. permettere modifiche manuali;
6. usare la trascrizione finale come input dell’analisi AI.

Dopo aver revisionato la trascrizione cliccare:

```text
Analizza trascrizione
```

#### Modalità C — Documento

Caricare un documento testuale o un brief.

Il sistema deve estrarre il testo e mostrarlo in anteprima.

Dopo la revisione cliccare:

```text
Analizza documento
```

### 4. Lettura analisi AI

Dopo l’analisi, la schermata mostra:

- sintesi del progetto;
- vincoli di budget;
- vincoli temporali;
- requisiti principali;
- funzionalità opzionali;
- rischi;
- assumptions;
- domande bloccanti, se presenti;
- scenari generabili.

### 5. Rispondere alle domande bloccanti

Se il sistema rileva una domanda bloccante, il preventivo non viene finalizzato.

Per procedere:

1. copiare la domanda suggerita;
2. inviarla al cliente;
3. attendere la risposta;
4. incollare la risposta nel campo dedicato;
5. cliccare `Aggiorna analisi`.

Il sistema rilancia l’analisi usando input originale più risposta del cliente.

### 6. Selezionare lo scenario

Se non ci sono blocchi, il tool mostra uno o più scenari.

Per ogni scenario sono visibili:

- nome scenario;
- costo stimato;
- ore totali;
- durata stimata;
- moduli inclusi;
- moduli esclusi;
- livello di rischio;
- compatibilità con budget;
- compatibilità con deadline.

Cliccare:

```text
Apri scenario
```

sullo scenario da approfondire.

### 7. Gestire moduli opzionali

Nella dashboard scenario è possibile attivare o disattivare moduli opzionali.

Esempio:

```text
[x] Onboarding utente e animale
[x] Pagamenti ricorrenti Stripe
[x] Dashboard rider con mappa
[ ] Social community animali
[x] Area admin
```

Ogni modifica deve aggiornare in tempo reale:

- costo totale;
- ore totali;
- margine rispetto al budget;
- alert di sforamento;
- timeline stimata;
- riepilogo moduli inclusi;
- assumptions collegate.

### 8. Verificare il dettaglio economico

Ogni task deve mostrare il dettaglio del calcolo.

Esempio:

```text
Task: Integrazione Stripe Subscription
Figura: Full-Stack / Backend Developer Senior
Ore: 15
Tariffa: 70 €/h
Totale: 1.050 €
```

Il totale modulo deve essere la somma delle righe task incluse.

Il totale preventivo deve essere la somma dei moduli inclusi più eventuali voci generali dichiarate.

### 9. Modifiche manuali controllate

L’utente interno può modificare:

- titolo preventivo;
- descrizione cliente;
- assumptions;
- esclusioni;
- note commerciali;
- moduli opzionali inclusi/esclusi;
- ordine dei moduli;
- validità del preventivo.

Le ore e le tariffe possono essere modificate solo se il ruolo dell’utente lo consente.

Ogni modifica rilevante deve essere salvata in audit log.

### 10. Generare pagina cliente

Quando il preventivo è pronto, cliccare:

```text
Genera pagina cliente
```

La pagina cliente deve avere layout pulito e contenere:

- copertina;
- executive summary;
- obiettivi;
- scenario selezionato;
- moduli inclusi;
- moduli opzionali;
- investimento;
- timeline;
- assumptions;
- esclusioni;
- rischi;
- prossimi step.

### 11. Scaricare PDF

Dalla pagina cliente cliccare:

```text
Scarica PDF
```

Il sistema genera un PDF scaricabile.

Il PDF deve essere adatto all’invio al cliente, con:

- impaginazione leggibile;
- numerazione pagine;
- data generazione;
- validità del preventivo;
- totale economico chiaro;
- assumptions ed esclusioni ben visibili.

### 12. Salvare e recuperare preventivi

Ogni preventivo deve essere salvato in database.

Dalla dashboard principale l’utente può:

- cercare preventivi precedenti;
- filtrare per cliente, stato, data o importo;
- riaprire un preventivo;
- duplicare un preventivo;
- rigenerare uno scenario;
- esportare nuovamente il PDF.

---

## Flusso demo consigliato

Per una demo live efficace usare questo percorso:

1. aprire la dashboard;
2. cliccare `Nuovo preventivo`;
3. incollare il testo demo del brief;
4. lanciare l’analisi AI;
5. mostrare budget e deadline estratti;
6. mostrare funzionalità obbligatorie e opzionali;
7. mostrare gli scenari generati;
8. aprire lo scenario consigliato;
9. disattivare il modulo social opzionale;
10. mostrare prezzo e ore aggiornati live;
11. aprire pagina cliente;
12. scaricare PDF;
13. aprire il PDF generato.

Input demo consigliato:

```text
Ciao! Vogliamo lanciare una piattaforma MVP per la nostra startup di Delivery di cibo per animali a domicilio.
Ci serve un'app mobile iOS e Android dove l'utente si registra, inserisce i dati del suo cane/gatto
razza, peso, allergie e riceve una proposta di abbonamento mensile di cibo personalizzato.
Il pagamento deve essere automatico ogni mese tramite Stripe.
I nostri rider devono avere una mappa interna per vedere dove consegnare.
Se possibile vorremmo una sezione social dove i padroni possono scambiarsi foto dei loro animali,
ma questa forse la teniamo come opzione se costa troppo.
Il nostro budget massimo è intorno ai 25.000€ e dobbiamo essere online entro 3 mesi.
```

---

## Regole di calcolo

### Formula base

Ogni riga di costo deve rispettare questa formula:

```text
costo_task = ore_stimate * tariffa_oraria
```

### Totale modulo

```text
totale_modulo = somma(costo_task inclusi nel modulo)
```

### Totale preventivo

```text
totale_preventivo = somma(totale_modulo dei moduli inclusi) + voci_generali
```

### Regole obbligatorie

- Le tariffe devono essere lette da Supabase.
- Le tariffe non devono essere hardcoded nel codice.
- Il preventivo deve salvare lo snapshot della tariffa applicata.
- Cambi futuri alla rate card non devono alterare preventivi già generati.
- L’LLM non deve calcolare il prezzo finale.
- Il codice applicativo deve ricalcolare sempre i totali.
- Ogni riga economica deve essere verificabile.

### Voci generali consentite

Le voci aggiuntive sono ammesse solo se esplicite:

- project management;
- discovery;
- QA;
- contingency;
- DevOps;
- servizi esterni;
- manutenzione opzionale.

Ogni voce deve avere:

- descrizione;
- formula di calcolo;
- valore;
- motivazione.

---

## Struttura progetto

Struttura consigliata del repository:

```text
preventivai/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── estimates/
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── printable/page.tsx
│   └── api/
│       ├── analyze/route.ts
│       ├── transcribe/route.ts
│       ├── estimates/route.ts
│       └── pdf/route.ts
├── components/
│   ├── ui/
│   ├── estimate/
│   ├── forms/
│   └── layout/
├── lib/
│   ├── ai/
│   │   ├── openrouter.ts
│   │   ├── prompts.ts
│   │   ├── schemas.ts
│   │   └── rag.ts
│   ├── elevenlabs.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── pricing/
│   │   ├── calculate-estimate.ts
│   │   └── validate-rate-card.ts
│   ├── pdf/
│   └── utils.ts
├── types/
│   ├── estimate.ts
│   ├── rate-card.ts
│   └── project-history.ts
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── tests/
│   ├── unit/
│   └── e2e/
├── public/
├── .env.example
├── package.json
└── README.md
```

---

## Best practice implementative

### TypeScript

- Usare `strict: true`.
- Evitare `any`.
- Creare tipi condivisi in `/types`.
- Validare input esterni con Zod.
- Validare output LLM con Zod prima del salvataggio.

### AI

- Richiedere sempre output JSON strutturato.
- Non fidarsi mai direttamente dell’output del modello.
- Implementare retry in caso di JSON non valido.
- Salvare prompt, modello, token usage e risposta in audit log.
- Separare analisi AI e calcolo economico.
- Non mostrare chain-of-thought o log interni all’utente finale.

### Supabase

- Abilitare RLS.
- Usare service role solo lato server.
- Salvare snapshot delle tariffe nei task.
- Versionare i preventivi.
- Usare Storage per audio, documenti e PDF.

### Sicurezza

- Proteggere tutte le route interne.
- Validare dimensione e MIME type degli upload.
- Sanitizzare contenuto generato prima del rendering.
- Non loggare dati sensibili.
- Non esporre chiavi API al client.

### UX

- Mostrare sempre il totale in modo visibile.
- Evidenziare moduli opzionali.
- Evidenziare sforamento budget.
- Evidenziare rischi su deadline.
- Rendere chiara la differenza tra incluso, opzionale ed escluso.
- Rendere il preventivo leggibile anche da un cliente non tecnico.

---

## Troubleshooting

### L’app non parte

Controllare:

- versione Node.js;
- dipendenze installate;
- file `.env.local` presente;
- porte già occupate;
- errori nel terminale.

### Supabase non risponde

Controllare:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`;
- policy RLS;
- stato del progetto Supabase.

### L’analisi AI fallisce

Controllare:

- `OPENROUTER_API_KEY`;
- modello configurato;
- schema JSON richiesto;
- validazione Zod;
- log della route `/api/analyze`.

### La trascrizione audio fallisce

Controllare:

- `ELEVENLABS_API_KEY`;
- formato audio;
- dimensione file;
- permessi Storage;
- log della route `/api/transcribe`.

### Il totale non torna

Controllare:

- rate card attiva;
- ore stimate per task;
- snapshot tariffa;
- moduli inclusi/esclusi;
- eventuali voci generali;
- arrotondamenti.

### Il PDF non viene generato

Controllare:

- configurazione `PDF_EXPORT_MODE`;
- template stampabile;
- route `/api/pdf`;
- dipendenze Playwright/Puppeteer;
- permessi di scrittura su Storage.

---

## Checklist pre-demo

- [ ] L’app parte in locale.
- [ ] Login interno funzionante.
- [ ] Supabase collegato.
- [ ] Rate card ufficiale caricata.
- [ ] Storico progetti demo caricato.
- [ ] Input testuale funzionante.
- [ ] Output AI validato con schema.
- [ ] Preventivo salvato in database.
- [ ] Calcoli economici verificabili.
- [ ] Toggle moduli opzionali funzionante.
- [ ] Alert budget/deadline visibili.
- [ ] Pagina cliente presentabile.
- [ ] Export PDF funzionante.
- [ ] Nessuna API key nel repository.
- [ ] README aggiornato.

---

## Licenza e utilizzo

PreventivAI è un tool interno aziendale. L’uso è riservato a personale autorizzato.

