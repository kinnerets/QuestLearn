-- ============================================================================
-- QuestLearn — reset ALL child progress for a fresh start with the girls.
-- Run once in the Supabase SQL editor. IRREVERSIBLE.
--
-- CLEARS (everything the girls generated):
--   answers, mastery, daily counters, coins, streak, XP, earned badges,
--   reward redemptions, chore-completion history, owned avatar items,
--   Capi chat log, weekly team state, recordings, weekly goals, and each
--   child's chosen interests + any parent per-topic focus.
--
-- KEEPS (your setup and the app content):
--   the profiles themselves (Mili, Lia, parent) with their names, grades and
--   avatars; all curriculum topics & questions; the rewards catalog and the
--   chores you defined; the parent login; and the parent locks/flags.
-- ============================================================================

-- 1) Wipe the history / progress tables.
delete from attempts_log;
delete from user_mastery;
delete from daily_progress;
delete from badges;
delete from reward_redemptions;
delete from home_task_done;
delete from user_avatar_items;
delete from audio_recordings;
delete from family_goals;

-- Tables that exist only if you ran their SQL — guarded so this never errors.
do $$
begin
  if to_regclass('public.capi_chats')  is not null then delete from capi_chats;  end if;
  if to_regclass('public.team_rewards') is not null then delete from team_rewards; end if;
end $$;

-- 2) Reset the counters on each child profile (name / grade / avatar kept).
update users set
  current_streak = 0,
  streak_freezes = 0,
  total_xp       = 0,
  quest_coins    = 0,
  interests      = '{}'
where role = 'child';

-- 3) Optional columns (present only if you ran the matching SQL) — guarded.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_name = 'users' and column_name = 'parent_focus') then
    update users set parent_focus = '[]'::jsonb where role = 'child';
  end if;
  if exists (select 1 from information_schema.columns
             where table_name = 'users' and column_name = 'parent_focus_topics') then
    update users set parent_focus_topics = '[]'::jsonb where role = 'child';
  end if;
end $$;

-- Done. The girls start from zero; content and your setup are intact.
