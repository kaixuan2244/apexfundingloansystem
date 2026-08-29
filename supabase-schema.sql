create table if not exists public.clients (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

drop policy if exists "Allow demo reads" on public.clients;
drop policy if exists "Allow demo writes" on public.clients;

create policy "Allow demo reads"
on public.clients
for select
to anon
using (true);

create policy "Allow demo writes"
on public.clients
for all
to anon
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('customer-files', 'customer-files', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Allow demo file reads" on storage.objects;
drop policy if exists "Allow demo file uploads" on storage.objects;

create policy "Allow demo file reads"
on storage.objects
for select
to anon
using (bucket_id = 'customer-files');

create policy "Allow demo file uploads"
on storage.objects
for all
to anon
using (bucket_id = 'customer-files')
with check (bucket_id = 'customer-files');
