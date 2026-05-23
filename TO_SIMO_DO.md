# TO DO (Simo)

## Azione Richiesta: Applicazione Migrazione DB

Ho creato la migrazione `20260523141500_add_delivered_status.sql` per supportare lo stato "Consegnato" ("delivered") nel database Supabase locale. 
Poiché la sandbox non ha accesso alla rete per eseguire comandi diretti sul tuo container locale Docker di Postgres (Supabase CLI), **devi eseguire questo comando sul tuo terminale locale**:

```bash
npx supabase migration up
```

Una volta eseguita, la UI del pulsante "Segna come Consegnato" aggiornerà correttamente lo stato.

## Azione Richiesta: Backfill campi null in client_requests

Ho creato la migrazione `20260523170000_backfill_client_request_fields.sql` che popola retroattivamente i campi `normalized_text`, `client_budget_eur`, `client_deadline` e `client_timeline_text` delle righe `client_requests` esistenti estraendo i valori dal JSON salvato in `quote_runs.llm_raw_response`.

**Esegui questo comando per applicarla:**

```bash
npx supabase migration up
```

**Oppure**, se preferisci applicarla manualmente, puoi copiare ed eseguire il contenuto SQL del file `supabase/migrations/20260523170000_backfill_client_request_fields.sql` direttamente dalla dashboard SQL di Supabase.

I nuovi preventivi generati da ora in poi popoleranno automaticamente tutti questi campi.

## Azione Richiesta: Applicazione Migrazione Profilo Cliente (is_customer)

Ho creato la migrazione `20260523191800_add_is_customer_to_profiles.sql` che aggiunge la colonna `is_customer` alla tabella `profiles` e un trigger per creare automaticamente il profilo quando un utente si registra dalla landing page `/home`.

**Esegui questo comando sul tuo terminale locale:**

```bash
npx supabase migration up
```
