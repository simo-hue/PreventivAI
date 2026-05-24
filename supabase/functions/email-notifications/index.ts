import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

// Tipi per il payload in arrivo da pg_net (Database Webhook)
interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: any;
  old_record: any;
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');
const ADMIN_EMAIL = 'admin@gmail.com';

async function sendResendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY mancante!");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "PreventivAI <noreply@preventivai.com>", // Sostituisci in prod
      to: [to],
      subject: subject,
      html: html
    })
  });
  if (!res.ok) throw new Error(`Errore Resend: ${await res.text()}`);
  return await res.json();
}

const getQuoteReadyTemplate = (title: string, link: string) => `
<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="background-color: #111827; padding: 32px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Italians quote it better</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Il tuo preventivo è pronto! 🎉</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 24px;">Abbiamo completato l'elaborazione per <strong>"${title}"</strong>.</p>
      <div style="text-align: center; margin-top: 32px;"><a href="${link}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">Vedi Preventivo</a></div>
    </div>
  </div>
</body></html>`;

const getNewMessageTemplate = (title: string, link: string) => `
<!DOCTYPE html><html><body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="background-color: #111827; padding: 32px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Italians quote it better</h1>
    </div>
    <div style="padding: 40px;">
      <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Nuovo messaggio ricevuto 💬</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 24px;">Il nostro team ha appena risposto sulla richiesta <strong>"${title}"</strong>.</p>
      <div style="text-align: center; margin-top: 32px;"><a href="${link}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">Apri la Chat</a></div>
    </div>
  </div>
</body></html>`;

export default {
  async fetch(req: Request) {
    try {
      // 1. Verifica Security Token
      const authHeader = req.headers.get('Authorization');
      if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
        return Response.json({ error: 'Non autorizzato' }, { status: 401 });
      }

      const payload: WebhookPayload = await req.json();
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
      const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000';

      // --- CAMBIO STATO PREVENTIVO ---
      if (payload.table === 'client_requests' && payload.type === 'UPDATE') {
        const { status: oldStatus } = payload.old_record;
        const { status: newStatus, created_by, title, id } = payload.record;

        const elaborazioneStatuses = ['draft', 'transcribing', 'analyzing'];
        if (elaborazioneStatuses.includes(oldStatus) && !elaborazioneStatuses.includes(newStatus)) {
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(created_by);
          if (userError || !user) throw new Error("Utente non trovato");
          if (user.email === ADMIN_EMAIL) return Response.json({ message: "Ignorato admin" });

          await sendResendEmail(user.email!, "Il tuo preventivo è pronto! 🎉", getQuoteReadyTemplate(title, `${APP_BASE_URL}/requests/${id}`));
          return Response.json({ message: "Email preventivo inviata" });
        }
      }

      // --- NUOVO MESSAGGIO CHAT ---
      if (payload.table === 'chat_messages' && payload.type === 'INSERT') {
        const { client_request_id, sender_id } = payload.record;
        const { data: request } = await supabase.from('client_requests').select('created_by, title').eq('id', client_request_id).single();
        if (!request) throw new Error("Richiesta non trovata");

        if (sender_id === request.created_by) return Response.json({ message: "Messaggio dal cliente, email ignorata" });

        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(request.created_by);
        if (userError || !user) throw new Error("Utente non trovato");
        if (user.email === ADMIN_EMAIL) return Response.json({ message: "Ignorato admin" });

        await sendResendEmail(user.email!, "Nuovo messaggio in chat 💬", getNewMessageTemplate(request.title, `${APP_BASE_URL}/requests/${client_request_id}?tab=chat`));
        return Response.json({ message: "Email chat inviata" });
      }

      return Response.json({ message: "Evento ignorato" });
    } catch (err: any) {
      console.error(err);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }
};
