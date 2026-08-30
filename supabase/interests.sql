-- Per-child interests, used to bias the daily mix toward what she loves.
-- Run once. Safe to re-run.
alter table users add column if not exists interests jsonb not null default '[]'::jsonb;
