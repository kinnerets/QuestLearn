-- Stores each Capi (AI tutor) chat exchange so a parent can review what the
-- child asked. Run once. Safe to re-run.
create table if not exists capi_chats (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references users(id) on delete cascade,
  question text not null,
  reply text not null,
  created_at timestamptz not null default now()
);
create index if not exists capi_chats_child_time on capi_chats (child_id, created_at desc);

-- Permissive access for the app (matches the project's existing setup). Adjust
-- if you later add row-level security.
alter table capi_chats enable row level security;
drop policy if exists capi_chats_all on capi_chats;
create policy capi_chats_all on capi_chats for all using (true) with check (true);
grant all on capi_chats to anon, authenticated, service_role;
