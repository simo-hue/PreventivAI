create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_request_id uuid not null references public.client_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can read chat messages for their org"
on public.chat_messages for select
using (public.can_read_org_row(organization_id));

create policy "Users can insert chat messages for their org"
on public.chat_messages for insert
with check (public.can_read_org_row(organization_id));

create policy "Users can update their own chat messages"
on public.chat_messages for update
using (sender_id = auth.uid())
with check (sender_id = auth.uid());
