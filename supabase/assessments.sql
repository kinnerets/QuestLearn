-- Stores each end-of-year assessment (מבדק) result so a parent can review it.
-- Run once. Safe to re-run.
create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references users(id) on delete cascade,
  grade text not null,
  kind text not null default 'end',   -- 'mid' (מחצית) or 'end' (סוף שנה)
  score integer not null,
  correct integer not null,
  total integer not null,
  subjects jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
-- Upgrade an older assessments table that predates the mid/end kind.
alter table assessments add column if not exists kind text not null default 'end';
create index if not exists assessments_child_time on assessments (child_id, created_at desc);

alter table assessments enable row level security;
drop policy if exists assessments_all on assessments;
create policy assessments_all on assessments for all using (true) with check (true);
grant all on assessments to anon, authenticated, service_role;
