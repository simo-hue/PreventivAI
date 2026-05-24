# TO DO (Simo)


ricevo errore nel salvataggio quando salvo opzioni visibili al cliente

Error: [ScenarioPUT] Errore insert efforts: invalid input syntax for type uuid: "rate-pm-senior"
    at PUT (app/api/quote-scenarios/[id]/route.ts:131:24)
  129 |     if (effortsToInsert.length > 0) {
  130 |       const { error } = await admin.from("quote_task_efforts").insert(effortsToInsert);
> 131 |       if (error) throw new Error(`[ScenarioPUT] Errore insert efforts: ${error.message}`);
      |                        ^
  132 |     }
  133 |
  134 |     return NextResponse.json({ saved: true });

---

  
