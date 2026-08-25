-- QuestLearn — seed data (dev). Run after 0001_init.sql.
-- Idempotent-ish: clears the demo family first.

delete from users where family_id = '11111111-1111-1111-1111-111111111111';
delete from curriculum_topics where id in (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000004'
);
delete from reward_store where family_id = '11111111-1111-1111-1111-111111111111';

-- Family: parent + child (Mili)
insert into users (id, role, family_id, display_name) values
  ('22222222-2222-2222-2222-222222222222', 'parent', '11111111-1111-1111-1111-111111111111', 'הורה');

insert into users (id, role, parent_id, family_id, grade_level, display_name, quest_coins, current_streak, total_xp, avatar_config) values
  ('33333333-3333-3333-3333-333333333333', 'child',
   '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'grade_3', 'מילי', 120, 6, 0,
   '{"base":"girl","skin_tone":"#FCE0C8","hairstyle_id":"long","hair_color":"#7A4B2B","top_id":"varsity","top_color":"#FF2A85","accessory_id":"bow"}'::jsonb);

-- Topics (one per daily station)
insert into curriculum_topics (id, grade, subject, sub_topic, order_index, arabic_variant) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'grade_3', 'math', 'לוח הכפל', 1, null),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'grade_3', 'arabic', 'ברכות', 1, 'spoken'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'enrichment', 'future_skills', 'יזמות: המצאות', 1, null),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'enrichment', 'leadership', 'בנק הלב', 1, null);

-- Questions
insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"כפל","stem":"כמה זה 7 × 6 ?","hint":"נסי לספור בקפיצות של 7: 7, 14, 21, 28… עד שש קפיצות. איפה נוחתים?","choices":[{"id":"a","text":"42"},{"id":"b","text":"48","misconception":"off_by_one_multiple"},{"id":"c","text":"36"},{"id":"d","text":"40"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"ברכות","stem":"איך אומרים \"שלום / היי\" בערבית מדוברת?","hint":"זו הברכה הראשונה שאומרים כשפוגשים מישהו. מתחילה ב-\"מ\".","choices":[{"id":"a","text":"מַרְחַבָּא"},{"id":"b","text":"שׁוּכְּרַן"},{"id":"c","text":"יַאללָה"},{"id":"d","text":"בַּסְטָה"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"המצאות","stem":"מה הצעד הראשון של כל ממציאה חכמה?","hint":"לפני שממציאים פתרון צריך לדעת מה שווה לפתור. ממה אנשים מתעצבנים?","choices":[{"id":"a","text":"למצוא בעיה שמפריעה"},{"id":"b","text":"לצייר לוגו יפה"},{"id":"c","text":"לבחור שם מגניב"},{"id":"d","text":"לפתוח חנות"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'choice_scenario', 1, 'curated', 'auto_passed',
   '{"prompt":"מה תעשי היום בשביל מישהו אחר?","note":"אין כאן תשובה נכונה — כל בחירה היא הפקדה טובה ללב.","choices":[{"id":"a","label":"לפרגן לחברה על משהו","icon":"star"},{"id":"b","label":"לעזור במשהו בבית","icon":"home"},{"id":"c","label":"להקשיב לחברה בלי להפריע","icon":"ear"}]}'::jsonb);

-- Reward store
insert into reward_store (family_id, title, category, cost_coins) values
  ('11111111-1111-1111-1111-111111111111', 'חצי שעה זמן מסך', 'screen_time', 150),
  ('11111111-1111-1111-1111-111111111111', 'ערב סרטים משפחתי', 'family_activity', 150),
  ('11111111-1111-1111-1111-111111111111', 'לבחור את ארוחת הערב', 'privilege', 200);
