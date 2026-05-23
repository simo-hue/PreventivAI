# TO DO (Simo)

## MANUALE ACTIONS RICHIESTE

Per applicare la modifica allo switch delle ore/tariffe, è necessario aggiungere una nuova colonna al database di produzione su Supabase.

Esegui questa query nel SQL Editor del tuo progetto Supabase:

```sql
ALTER TABLE public.quote_scenarios 
ADD COLUMN display_options JSONB NOT NULL DEFAULT '{"showHours": true, "showHourlyRate": true}'::jsonb;
```