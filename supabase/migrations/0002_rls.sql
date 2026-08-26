-- QuestLearn — Row Level Security (0002).
--
-- ⚠️ RUN THIS ONLY AFTER SUPABASE_SERVICE_ROLE_KEY is set in Vercel and the
--    app has redeployed. Enabling RLS with no policies denies the public
--    anon key completely; the server's service-role key bypasses RLS, so all
--    app traffic keeps working while the public key can no longer read data.
--
-- This is what "real data separation" means here: the anon key that ships in
-- the browser bundle becomes useless on its own — every read/write must go
-- through our server, which holds the service-role key.
--
-- Safe to re-run (enabling RLS twice is a no-op).

alter table users              enable row level security;
alter table auth_accounts      enable row level security;
alter table curriculum_topics  enable row level security;
alter table questions_bank     enable row level security;
alter table user_mastery       enable row level security;
alter table attempts_log       enable row level security;
alter table parent_directives  enable row level security;
alter table daily_progress     enable row level security;
alter table reward_store       enable row level security;
alter table reward_redemptions enable row level security;
alter table badges             enable row level security;
alter table family_goals       enable row level security;
alter table avatar_items       enable row level security;
alter table user_avatar_items  enable row level security;
alter table audio_recordings   enable row level security;

-- No policies are defined on purpose: with RLS on and no policy, the anon and
-- authenticated roles are denied all rows, while the service_role used by the
-- Next.js server bypasses RLS. When real per-user auth is added later, add
-- SELECT/INSERT/UPDATE policies here keyed on auth.uid().
