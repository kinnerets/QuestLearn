-- New age-adapted enrichment subjects (for ages 8-11). Topic names only; the
-- generator fills questions on demand, in kid-friendly language (enrichment
-- grade rules). Run once. Safe to re-run. Then run supabase/topic_order.sql.

-- These are new subject slugs, so make sure the old subject CHECK isn't blocking.
alter table curriculum_topics drop constraint if exists curriculum_topics_subject_check;

insert into curriculum_topics (id, grade, subject, sub_topic, order_index) values
  ('66666666-6666-6666-6666-000000000001', 'enrichment', 'metacognition',     'איך אני חושבת ולומדת', 1),
  ('66666666-6666-6666-6666-000000000002', 'enrichment', 'geopolitics',       'מדינות, גבולות ומפות', 1),
  ('66666666-6666-6666-6666-000000000003', 'enrichment', 'cognitive_bias',    'המוח מרמה אותנו לפעמים', 1),
  ('66666666-6666-6666-6666-000000000004', 'enrichment', 'epigenetics',       'איך הסביבה משפיעה על הגוף', 1),
  ('66666666-6666-6666-6666-000000000005', 'enrichment', 'procrastination',   'למה דוחים דברים ואיך מתחילים', 1),
  ('66666666-6666-6666-6666-000000000006', 'enrichment', 'decision_making',   'איך מחליטים בחוכמה', 1),
  ('66666666-6666-6666-6666-000000000007', 'enrichment', 'neuroplasticity',   'המוח שאפשר לאמן', 1),
  ('66666666-6666-6666-6666-000000000008', 'enrichment', 'financial_literacy','כסף, חיסכון וקנייה חכמה', 1)
on conflict (id) do update set sub_topic = excluded.sub_topic, order_index = excluded.order_index;
