# TO DO (Simo)

## Azione Richiesta: Applicazione Migrazione DB

Ho creato la migrazione `20260523141500_add_delivered_status.sql` per supportare lo stato "Consegnato" ("delivered") nel database Supabase locale. 
Poiché la sandbox non ha accesso alla rete per eseguire comandi diretti sul tuo container locale Docker di Postgres (Supabase CLI), **devi eseguire questo comando sul tuo terminale locale**:

```bash
npx supabase migration up
```

Una volta eseguita, la UI del pulsante "Segna come Consegnato" aggiornerà correttamente lo stato.
