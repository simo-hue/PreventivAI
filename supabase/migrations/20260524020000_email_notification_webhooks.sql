create extension if not exists pg_net;

create or replace function public.trigger_email_notification()
returns trigger as $$
declare
  -- URL DELLA EDGE FUNCTION
  -- URL popolato automaticamente con il tuo ID Progetto
  webhook_url text := coalesce(
    nullif(current_setting('app.settings.email_webhook_url', true), ''), 
    'https://farhhmtqpjqzpmkrdrje.supabase.co/functions/v1/email-notifications'
  );

  -- SECRET DELLA EDGE FUNCTION
  -- Secret popolato automaticamente con la tua password
  webhook_secret text := coalesce(
    nullif(current_setting('app.settings.webhook_secret', true), ''), 
    'my-super-secret-key'
  );
  payload jsonb;
begin
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', case when TG_OP = 'UPDATE' or TG_OP = 'DELETE' then row_to_json(OLD) else null end
  );

  perform net.http_post(
    url := webhook_url,
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || webhook_secret
    )
  );

  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger 1: Stato del preventivo aggiornato
drop trigger if exists on_quote_status_updated on public.client_requests;
create trigger on_quote_status_updated
  after update on public.client_requests
  for each row
  when (
    old.status in ('draft', 'transcribing', 'analyzing') 
    and new.status in ('needs_clarification', 'quoted')
  )
  execute function public.trigger_email_notification();

-- Trigger 2: Nuovo messaggio in chat
drop trigger if exists on_new_chat_message on public.chat_messages;
create trigger on_new_chat_message
  after insert on public.chat_messages
  for each row
  execute function public.trigger_email_notification();
