-- Per-child parent "weekly focus": subjects the parent asks to emphasize in the
-- daily mix. Run once. Safe to re-run.
alter table users add column if not exists parent_focus jsonb not null default '[]'::jsonb;
