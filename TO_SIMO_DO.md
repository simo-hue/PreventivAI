# TO DO (Simo)

ricevo errore quando da pannello admin modifico i dettagli delle impostazioni visibili al cliente. Nel salvataggio che ho provato a fare ad esempio ho ricevuto "errore durante salvataggio" e nel log ricevo:  

Error: [ScenarioPUT] Errore insert efforts: invalid input syntax for type uuid: "rate-frontend-mid"
    at PUT (app/api/quote-scenarios/[id]/route.ts:131:24)
  129 |     if (effortsToInsert.length > 0) {
  130 |       const { error } = await admin.from("quote_task_efforts").insert(effortsToInsert);
> 131 |       if (error) throw new Error(`[ScenarioPUT] Errore insert efforts: ${error.message}`);
      |                        ^
  132 |     }
  133 |
  134 |     return NextResponse.json({ saved: true });
 PUT /api/quote-scenarios/732e3d51-3406-40e0-94d9-47035c40edb1 500 in 1912ms (next.js: 582ms, application-code: 1330ms)