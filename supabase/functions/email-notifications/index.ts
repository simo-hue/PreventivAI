import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')

// Email dell'admin da ignorare
const ADMIN_EMAIL = 'admin@gmail.com'

// Helper per inviare email tramite Resend
async function sendResendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY mancante!")
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "PreventivAI <noreply@preventivai.com>", // TODO: Cambia con il dominio verificato su Resend
      to: [to],
      subject: subject,
      html: html
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Errore Resend: ${errorText}`);
    throw new Error(`Errore Resend: ${errorText}`);
  }
  
  return await res.json();
}

// Template email HTML con design premium (Tailwind-like inlined)
const getQuoteReadyTemplate = (title: string, link: string) => `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
    <div style="background-color: #111827; padding: 32px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.025em;">PreventivAI</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Il tuo preventivo è pronto! 🎉</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Abbiamo completato l'elaborazione della tua richiesta <strong>"${title}"</strong>. 
        Ora puoi visualizzare tutti i dettagli, le tempistiche stimate e i costi direttamente sulla piattaforma.
      </p>
      <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
        <a href="${link}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">
          Vedi Preventivo
        </a>
      </div>
    </div>
    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">© 2026 PreventivAI. Tutti i diritti riservati.</p>
    </div>
  </div>
</body>
</html>
`;

const getNewMessageTemplate = (title: string, link: string) => `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
    <div style="background-color: #111827; padding: 32px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.025em;">PreventivAI</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Nuovo messaggio ricevuto 💬</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        Il nostro team ha appena risposto sulla richiesta <strong>"${title}"</strong>.
        Accedi alla piattaforma per leggere il messaggio e continuare la conversazione.
      </p>
      <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
        <a href="${link}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">
          Apri la Chat
        </a>
      </div>
    </div>
  </div>
</body>
</html>
`;


Deno.serve(async (req) => {
  try {
    // 1. Verifica di base (Opzionale ma raccomandata: controllare il webhook secret)
    const authHeader = req.headers.get('Authorization')
    if (WEBHOOK_SECRET && authHeader !== \`Bearer \${WEBHOOK_SECRET}\`) {
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), { status: 401 })
    }

    const payload = await req.json();
    
    // Inizializza client Supabase con permessi di admin (per leggere auth.users)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000';

    // --- GESTIONE CAMBIO STATO PREVENTIVO ---
    if (payload.table === 'client_requests' && payload.type === 'UPDATE') {
      const oldRecord = payload.old_record;
      const newRecord = payload.record;

      const elaborazioneStatuses = ['draft', 'transcribing', 'analyzing'];
      const wasElaborating = elaborazioneStatuses.includes(oldRecord.status);
      const isNowDone = !elaborazioneStatuses.includes(newRecord.status);

      if (wasElaborating && isNowDone) {
        // Recupera l'utente
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(newRecord.created_by);
        
        if (userError || !user) throw new Error("Utente non trovato");
        if (user.email === ADMIN_EMAIL) {
          console.log("Notifica ignorata per l'admin");
          return new Response(JSON.stringify({ message: "Ignorato admin" }), { status: 200 });
        }

        const link = \`\${APP_BASE_URL}/requests/\${newRecord.id}\`;
        const html = getQuoteReadyTemplate(newRecord.title || "Richiesta Preventivo", link);
        
        await sendResendEmail(user.email, "Il tuo preventivo è pronto! 🎉", html);
        return new Response(JSON.stringify({ message: "Email inviata con successo" }), { status: 200 });
      }
    }

    // --- GESTIONE NUOVO MESSAGGIO CHAT ---
    if (payload.table === 'chat_messages' && payload.type === 'INSERT') {
      const newRecord = payload.record;
      
      // Dobbiamo sapere a chi appartiene la richiesta per non avvisare il team stesso o altri.
      const { data: request, error: reqError } = await supabase
        .from('client_requests')
        .select('created_by, title')
        .eq('id', newRecord.client_request_id)
        .single();
        
      if (reqError || !request) throw new Error("Richiesta non trovata");

      // Non inviare l'email se chi ha scritto il messaggio è il creatore della richiesta stessa (il cliente)
      if (newRecord.sender_id === request.created_by) {
        return new Response(JSON.stringify({ message: "Messaggio dal cliente, nessuna email inviata" }), { status: 200 });
      }

      // Altrimenti, chi ha scritto è un admin/pm. Avvisiamo il cliente (created_by)
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(request.created_by);
      if (userError || !user) throw new Error("Utente non trovato");
      
      if (user.email === ADMIN_EMAIL) {
        console.log("Notifica ignorata per l'admin");
        return new Response(JSON.stringify({ message: "Ignorato admin" }), { status: 200 });
      }

      const link = \`\${APP_BASE_URL}/requests/\${newRecord.client_request_id}?tab=chat\`; // Esempio di link
      const html = getNewMessageTemplate(request.title || "Richiesta Preventivo", link);
      
      await sendResendEmail(user.email, "Nuovo messaggio ricevuto su PreventivAI 💬", html);
      return new Response(JSON.stringify({ message: "Email inviata con successo" }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: "Evento ignorato" }), { status: 200 });

  } catch (error: any) {
    console.error("Errore Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})
