-- Lets a parent reinforce specific sub-topics (not just whole subjects). The
-- daily composer boosts topics whose id is listed here. Run once. Safe to re-run.
alter table users
  add column if not exists parent_focus_topics jsonb not null default '[]'::jsonb;
