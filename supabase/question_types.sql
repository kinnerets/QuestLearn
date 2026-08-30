-- Curated true_false + type_in questions (new question types).
-- Safe to re-run: clears prior curated rows of these types for these topics.

-- The type column had a CHECK that only allowed the original types, so
-- 'true_false'/'type_in' were rejected. Drop it — the app owns the type list.
alter table questions_bank drop constraint if exists questions_bank_type_check;

delete from questions_bank
 where source = 'curated' and type in ('true_false','type_in')
   and topic_id in (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000003',
  'cccccccc-0000-0000-0000-000000000004',
  'cccccccc-0000-0000-0000-000000000005',
  'dddddddd-0000-0000-0000-000000000001',
  'dddddddd-0000-0000-0000-000000000002',
  'dddddddd-0000-0000-0000-000000000003',
  'dddddddd-0000-0000-0000-000000000005'
);

insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  ('aaaaaaaa-0000-0000-0000-000000000001','type_in',1,'curated','auto_passed',
   '{"tag": "כפל", "stem": "כמה זה 8 × 3?", "answers": ["24"], "hints": ["ספרי בקפיצות של 8", "8, 16, 24"], "explanation": "8×3=24."}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000001','true_false',1,'curated','auto_passed',
   '{"tag": "כפל", "stem": "6 × 7 שווה 42.", "answer": true, "hints": ["ספרי בקפיצות של 7", "שש קפיצות"], "explanation": "נכון — 6×7=42."}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000001','type_in',2,'curated','auto_passed',
   '{"tag": "כפל", "stem": "כמה זה 9 × 4?", "answers": ["36"], "hints": ["9, 18, 27…", "ארבע קפיצות של 9"], "explanation": "9×4=36."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000001','type_in',1,'curated','auto_passed',
   '{"tag": "צורות", "stem": "לכמה צלעות יש משולש?", "answers": ["3", "שלוש"], "hints": ["בשם רמז", "מְשׁוּלָּשׁ"], "explanation": "למשולש 3 צלעות."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000001','true_false',1,'curated','auto_passed',
   '{"tag": "צורות", "stem": "לריבוע יש ארבע צלעות באותו אורך.", "answer": true, "hints": ["ריבוע…", "כל הצלעות שוות"], "explanation": "נכון."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000002','true_false',1,'curated','auto_passed',
   '{"tag": "נרדפות", "stem": "המילים \"שמח\" ו\"עצוב\" הן מילים נרדפות.", "answer": false, "hints": ["אותה משמעות?", "הפוכות"], "explanation": "לא — הן הפכים, לא נרדפות."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000002','type_in',1,'curated','auto_passed',
   '{"tag": "הפכים", "stem": "מה ההפך מהמילה \"גדול\"?", "answers": ["קטן"], "hints": ["משהו זעיר", "ההפך מגדול"], "explanation": "ההפך מגדול הוא קטן."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000005','true_false',1,'curated','auto_passed',
   '{"tag": "בעלי חיים", "stem": "דג נושם דרך ריאות כמו בני אדם.", "answer": false, "hints": ["איפה חי הדג?", "זימים"], "explanation": "לא — דג נושם דרך זימים."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000005','type_in',2,'curated','auto_passed',
   '{"tag": "בעלי חיים", "stem": "כמה רגליים יש לחרק?", "answers": ["6", "שש"], "hints": ["לא ארבע", "מספר זוגי"], "explanation": "לחרק 6 רגליים."}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000001','type_in',1,'curated','auto_passed',
   '{"tag": "אנגלית", "stem": "איך אומרים \"כלב\" באנגלית?", "answers": ["dog"], "hints": ["חיה נובחת", "מתחיל ב-d"], "explanation": "\"כלב\" = dog."}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000001','true_false',1,'curated','auto_passed',
   '{"tag": "אנגלית", "stem": "המילה \"cat\" באנגלית פירושה חתול.", "answer": true, "hints": ["חיה שאומרת מיאו", "נכון?"], "explanation": "נכון — cat = חתול."}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000003','true_false',1,'curated','auto_passed',
   '{"tag": "בראשית", "stem": "נוח בנה תיבה לפי הסיפור.", "answer": true, "hints": ["כלי שט גדול", "בשביל החיות"], "explanation": "נכון — נוח בנה תיבה."}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000005','true_false',1,'curated','auto_passed',
   '{"tag": "ארץ ישראל", "stem": "ירושלים היא בירת ישראל.", "answer": true, "hints": ["עיר הבירה", "נכון?"], "explanation": "נכון."}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000001','type_in',2,'curated','auto_passed',
   '{"tag": "שברים", "stem": "כמה זה 1/2 + 1/2? (כמספר שלם)", "answers": ["1", "אחד"], "hints": ["שני חצאים", "שלם"], "explanation": "חצי ועוד חצי = 1."}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000001','true_false',2,'curated','auto_passed',
   '{"tag": "שברים", "stem": "השבר 1/3 גדול יותר מ-1/2.", "answer": false, "hints": ["חשבי על פיצה", "יותר חתיכות = קטנות"], "explanation": "לא — 1/2 גדול מ-1/3."}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000001','type_in',3,'curated','auto_passed',
   '{"tag": "אחוזים", "stem": "כמה זה 25% מתוך 100?", "answers": ["25"], "hints": ["רבע", "100 חלקי 4"], "explanation": "25% מ-100 זה 25."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000003','type_in',2,'curated','auto_passed',
   '{"tag": "שטח", "stem": "מה השטח של ריבוע שצלעו 5 ס״מ? (מספר בלבד)", "answers": ["25"], "hints": ["צלע כפול צלע", "5×5"], "explanation": "שטח = 5×5 = 25."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000003','true_false',2,'curated','auto_passed',
   '{"tag": "זוויות", "stem": "בזווית ישרה יש 90 מעלות.", "answer": true, "hints": ["פינת ריבוע", "רבע סיבוב"], "explanation": "נכון — זווית ישרה = 90°."}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000004','true_false',2,'curated','auto_passed',
   '{"tag": "עובדה ודעה", "stem": "המשפט \"גלידה היא הקינוח הכי טעים\" הוא עובדה.", "answer": false, "hints": ["אפשר להתווכח?", "טעם אישי"], "explanation": "לא — זו דעה, לא עובדה."}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000002','type_in',2,'curated','auto_passed',
   '{"tag": "אנגלית", "stem": "מה צורת הרבים של \"child\"?", "answers": ["children"], "hints": ["לא childs", "צורה חריגה"], "explanation": "הרבים של child הוא children."}'::jsonb);
