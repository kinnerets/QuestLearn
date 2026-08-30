-- Tracks that a given week's sisters-challenge reward was already collected, so
-- the bonus coins are granted only once per week. Run once. Safe to re-run.
create table if not exists team_rewards (
  week_start text primary key,           -- ISO of the week's Sunday 00:00 UTC
  claimed_at timestamptz not null default now()
);

alter table team_rewards enable row level security;
drop policy if exists team_rewards_all on team_rewards;
create policy team_rewards_all on team_rewards for all using (true) with check (true);
grant all on team_rewards to anon, authenticated, service_role;
