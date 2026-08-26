-- QuestLearn — seed data (dev). Run after 0001_init.sql.
-- Idempotent-ish: clears the demo family first, then re-inserts.
-- Safe to re-run.

delete from users where family_id = '11111111-1111-1111-1111-111111111111';
delete from curriculum_topics where id in (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000004',
  'bbbbbbbb-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000002'
);
delete from reward_store where family_id = '11111111-1111-1111-1111-111111111111';

-- Family: parent + two children (Mili grade 3, Lia grade 5)
insert into users (id, role, family_id, display_name) values
  ('22222222-2222-2222-2222-222222222222', 'parent', '11111111-1111-1111-1111-111111111111', 'הורה');

insert into users (id, role, parent_id, family_id, grade_level, display_name, quest_coins, current_streak, total_xp, daily_goal_minutes, avatar_config) values
  ('33333333-3333-3333-3333-333333333333', 'child',
   '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'grade_3', 'מילי', 120, 6, 0, 15,
   '{"base":"girl","skin_tone":"#FCE0C8","hairstyle_id":"long","hair_color":"#7A4B2B","top_id":"varsity","top_color":"#FF2A85","accessory_id":"bow"}'::jsonb),
  ('44444444-4444-4444-4444-444444444444', 'child',
   '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'grade_5', 'ליה', 210, 9, 0, 30,
   '{"base":"girl","skin_tone":"#E8B98F","hairstyle_id":"long","hair_color":"#1F1B18","top_id":"varsity","top_color":"#38BDF8","accessory_id":null}'::jsonb);

-- Topics. future_skills + leadership are shared (grade = enrichment);
-- math + arabic are grade-specific so each girl gets her own level.
insert into curriculum_topics (id, grade, subject, sub_topic, order_index, arabic_variant) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'grade_3', 'math', 'לוח הכפל', 1, null),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'grade_3', 'arabic', 'ברכות', 1, 'spoken'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'grade_5', 'math', 'שברים', 1, null),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'grade_5', 'arabic', 'קריאה ספרותית', 1, 'msa'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'enrichment', 'future_skills', 'יזמות: המצאות', 1, null),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'enrichment', 'leadership', 'בנק הלב', 1, null);

-- Questions
insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  -- Mili (grade 3)
  ('aaaaaaaa-0000-0000-0000-000000000001', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"כפל","stem":"כמה זה 7 × 6 ?","hint":"נסי לספור בקפיצות של 7: 7, 14, 21, 28… עד שש קפיצות. איפה נוחתים?","choices":[{"id":"a","text":"42"},{"id":"b","text":"48","misconception":"off_by_one_multiple"},{"id":"c","text":"36"},{"id":"d","text":"40"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"ברכות","stem":"איך אומרים \"שלום / היי\" בערבית מדוברת?","hint":"זו הברכה הראשונה שאומרים כשפוגשים מישהו. מתחילה ב-\"מ\".","choices":[{"id":"a","text":"מַרְחַבָּא"},{"id":"b","text":"שׁוּכְּרַן"},{"id":"c","text":"יַאללָה"},{"id":"d","text":"בַּסְטָה"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Lia (grade 5)
  ('bbbbbbbb-0000-0000-0000-000000000001', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"שברים","stem":"איזה שבר גדול יותר: 1/2 או 1/3 ?","hint":"תחשבי על פיצה: אם חותכים אותה ל-2 חתיכות או ל-3 חתיכות — באיזו חלוקה כל חתיכה גדולה יותר?","choices":[{"id":"a","text":"1/2"},{"id":"b","text":"1/3","misconception":"bigger_denominator_bigger_fraction"},{"id":"c","text":"הם שווים"},{"id":"d","text":"אי אפשר לדעת"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"אוצר מילים","stem":"איך אומרים \"סֵפֶר\" בערבית ספרותית?","hint":"המילה הזו מוכרת גם מהמילה \"מַכְּתַבָּה\" (סִפרייה) — אותו שורש.","choices":[{"id":"a","text":"כִּתַאבּ"},{"id":"b","text":"קַלַם","misconception":"confuse_pen_book"},{"id":"c","text":"בַּאבּ"},{"id":"d","text":"בֵּית"}],"correct_choice_id":"a","coins":12}'::jsonb),
  -- Shared enrichment (both girls)
  ('aaaaaaaa-0000-0000-0000-000000000003', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"המצאות","stem":"מה הצעד הראשון של כל ממציאה חכמה?","hint":"לפני שממציאים פתרון צריך לדעת מה שווה לפתור. ממה אנשים מתעצבנים?","choices":[{"id":"a","text":"למצוא בעיה שמפריעה"},{"id":"b","text":"לצייר לוגו יפה"},{"id":"c","text":"לבחור שם מגניב"},{"id":"d","text":"לפתוח חנות"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'choice_scenario', 1, 'curated', 'auto_passed',
   '{"prompt":"מה תעשי היום בשביל מישהו אחר?","note":"אין כאן תשובה נכונה — כל בחירה היא הפקדה טובה ללב.","choices":[{"id":"a","label":"לפרגן לחברה על משהו","icon":"star"},{"id":"b","label":"לעזור במשהו בבית","icon":"home"},{"id":"c","label":"להקשיב לחברה בלי להפריע","icon":"ear"}]}'::jsonb);

-- Reward store (shared family catalog)
insert into reward_store (family_id, title, category, cost_coins) values
  ('11111111-1111-1111-1111-111111111111', 'חצי שעה זמן מסך', 'screen_time', 150),
  ('11111111-1111-1111-1111-111111111111', 'ערב סרטים משפחתי', 'family_activity', 150),
  ('11111111-1111-1111-1111-111111111111', 'לבחור את ארוחת הערב', 'privilege', 200);
