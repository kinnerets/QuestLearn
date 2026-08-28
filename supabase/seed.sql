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
  'bbbbbbbb-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000003',
  'cccccccc-0000-0000-0000-000000000004',
  'cccccccc-0000-0000-0000-000000000005',
  'dddddddd-0000-0000-0000-000000000001',
  'dddddddd-0000-0000-0000-000000000002',
  'dddddddd-0000-0000-0000-000000000003',
  'dddddddd-0000-0000-0000-000000000004',
  'dddddddd-0000-0000-0000-000000000005',
  'eeeeeeee-0000-0000-0000-000000000001',
  'eeeeeeee-0000-0000-0000-000000000002',
  'eeeeeeee-0000-0000-0000-000000000003'
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
  ('eeeeeeee-0000-0000-0000-000000000001', 'enrichment', 'leadership', 'דרכון החלומות', 1, null),
  ('eeeeeeee-0000-0000-0000-000000000002', 'enrichment', 'leadership', 'מטבעות הזמן', 2, null),
  ('eeeeeeee-0000-0000-0000-000000000003', 'enrichment', 'leadership', 'חדר המנכ״לית', 3, null),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'enrichment', 'leadership', 'בנק הלב', 4, null),
  ('cccccccc-0000-0000-0000-000000000001', 'grade_3', 'geometry', 'צורות', 1, null),
  ('cccccccc-0000-0000-0000-000000000002', 'grade_3', 'hebrew', 'אוצר מילים', 1, null),
  ('cccccccc-0000-0000-0000-000000000003', 'grade_5', 'geometry', 'שטח והיקף', 1, null),
  ('cccccccc-0000-0000-0000-000000000004', 'grade_5', 'hebrew', 'הבנה וטיעון', 1, null),
  ('cccccccc-0000-0000-0000-000000000005', 'enrichment', 'science', 'עולם החי', 1, null),
  ('dddddddd-0000-0000-0000-000000000001', 'grade_3', 'english', 'מילים ראשונות', 1, null),
  ('dddddddd-0000-0000-0000-000000000002', 'grade_5', 'english', 'קריאה והבנה', 1, null),
  ('dddddddd-0000-0000-0000-000000000003', 'grade_3', 'bible', 'סיפורי בראשית', 1, null),
  ('dddddddd-0000-0000-0000-000000000004', 'grade_5', 'bible', 'דמויות בתנ״ך', 1, null),
  ('dddddddd-0000-0000-0000-000000000005', 'enrichment', 'geography', 'ארץ ישראל', 1, null);

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

-- Extra questions per topic — variety for "עוד מסע" and spaced review.
insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  -- Mili math (grade 3)
  ('aaaaaaaa-0000-0000-0000-000000000001', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"כפל","stem":"כמה זה 8 × 4 ?","hint":"ספרי בקפיצות של 8: 8, 16, 24… כמה קפיצות עד ארבע?","choices":[{"id":"a","text":"32"},{"id":"b","text":"28","misconception":"off_by_one_multiple"},{"id":"c","text":"36"},{"id":"d","text":"24"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"כפל","stem":"כמה זה 9 × 3 ?","hint":"9 ועוד 9 זה 18, ועוד 9 עוד פעם?","choices":[{"id":"a","text":"27"},{"id":"b","text":"24","misconception":"off_by_one_multiple"},{"id":"c","text":"21"},{"id":"d","text":"29"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Mili arabic spoken (grade 3)
  ('aaaaaaaa-0000-0000-0000-000000000002', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"ברכות","stem":"איך אומרים \"תודה\" בערבית מדוברת?","hint":"מילת נימוס נפוצה מאוד, מתחילה ב-\"שׁ\".","choices":[{"id":"a","text":"שׁוּכְּרַן"},{"id":"b","text":"מַרְחַבָּא"},{"id":"c","text":"מַעַ סַלַאמֶה"},{"id":"d","text":"עַפְוַן"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"ברכות","stem":"איך אומרים \"להתראות\" בערבית מדוברת?","hint":"אומרים את זה כשנפרדים — שתי מילים, מסתיים ב-\"סַלַאמֶה\".","choices":[{"id":"a","text":"מַעַ סַלַאמֶה"},{"id":"b","text":"שׁוּכְּרַן"},{"id":"c","text":"מַרְחַבָּא"},{"id":"d","text":"תְפַצַّ׳ל"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Shared future skills
  ('aaaaaaaa-0000-0000-0000-000000000003', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"המצאות","stem":"אחרי שמצאת בעיה — מה הצעד הבא של ממציאה?","hint":"לא מתאהבים ברעיון הראשון. מה עושים כדי לא לפספס רעיון טוב יותר?","choices":[{"id":"a","text":"לחשוב על כמה רעיונות שונים"},{"id":"b","text":"לבחור מיד את הרעיון הראשון"},{"id":"c","text":"לוותר אם זה קשה"},{"id":"d","text":"לחכות שמישהו אחר יפתור"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Lia math (grade 5)
  ('bbbbbbbb-0000-0000-0000-000000000001', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"שברים","stem":"כמה זה 1/4 + 1/4 ?","hint":"שני רבעים יחד — כמה זה מתוך שלם? אפשר לצמצם.","choices":[{"id":"a","text":"1/2"},{"id":"b","text":"1/8","misconception":"add_denominators"},{"id":"c","text":"1/4"},{"id":"d","text":"2/8"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'multiple_choice', 3, 'curated', 'auto_passed',
   '{"tag":"שברים","stem":"איזה שבר שווה ל-1/2 ?","hint":"מחפשים שבר שאם מצמצמים אותו מקבלים חצי.","choices":[{"id":"a","text":"2/4"},{"id":"b","text":"1/3"},{"id":"c","text":"2/3"},{"id":"d","text":"3/4"}],"correct_choice_id":"a","coins":12}'::jsonb),
  -- Lia arabic literary (grade 5)
  ('bbbbbbbb-0000-0000-0000-000000000002', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"אוצר מילים","stem":"איך אומרים \"מים\" בערבית ספרותית?","hint":"מילה קצרה שמסתיימת בהברה פתוחה — \"...אא\".","choices":[{"id":"a","text":"מַאא׳"},{"id":"b","text":"שַׁמְס","misconception":"confuse_water_sun"},{"id":"c","text":"נַאר"},{"id":"d","text":"הַוַאא׳"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'multiple_choice', 3, 'curated', 'auto_passed',
   '{"tag":"אוצר מילים","stem":"מה הפירוש של המילה \"מַדְרַסֶה\"?","hint":"אותו שורש כמו \"דַרְס\" (שיעור). לאן הולכים ללמוד?","choices":[{"id":"a","text":"בית ספר"},{"id":"b","text":"בית חולים"},{"id":"c","text":"ספרייה"},{"id":"d","text":"גן חיות"}],"correct_choice_id":"a","coins":12}'::jsonb);

-- New subjects for the subject map (geometry, hebrew, science).
insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  -- Geometry (grade 3)
  ('cccccccc-0000-0000-0000-000000000001', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"צורות","stem":"לכמה צלעות יש משולש?","hint":"הרמז נמצא בשם עצמו — \"מְשׁוּלָּשׁ\", כמו שלוש.","choices":[{"id":"a","text":"3"},{"id":"b","text":"4"},{"id":"c","text":"5"},{"id":"d","text":"2"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000001', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"צורות","stem":"לאיזו צורה יש 4 צלעות באותו אורך בדיוק?","hint":"כל הצלעות שוות וכל הזוויות ישרות.","choices":[{"id":"a","text":"ריבוע"},{"id":"b","text":"מלבן","misconception":"rectangle_is_square"},{"id":"c","text":"משולש"},{"id":"d","text":"עיגול"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Hebrew vocabulary (grade 3)
  ('cccccccc-0000-0000-0000-000000000002', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"מילים נרדפות","stem":"איזו מילה דומה במשמעות ל\"שָׂמֵחַ\"?","hint":"מחפשים מילה שאומרת בערך אותו דבר — הרגשה טובה.","choices":[{"id":"a","text":"עַלִּיז"},{"id":"b","text":"עָצוּב"},{"id":"c","text":"כּוֹעֵס"},{"id":"d","text":"עָיֵף"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000002', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"הפכים","stem":"מה ההפך מהמילה \"גָּדוֹל\"?","hint":"מה אומרים על משהו זעיר?","choices":[{"id":"a","text":"קָטָן"},{"id":"b","text":"רָחָב"},{"id":"c","text":"גָּבוֹהַּ"},{"id":"d","text":"כָּבֵד"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Geometry (grade 5)
  ('cccccccc-0000-0000-0000-000000000003', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"שטח","stem":"מה השטח של ריבוע שאורך צלעו 4 ס\"מ?","hint":"שטח ריבוע = צלע כפול צלע.","choices":[{"id":"a","text":"16"},{"id":"b","text":"8","misconception":"perimeter_instead_of_area"},{"id":"c","text":"12"},{"id":"d","text":"4"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000003', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"היקף","stem":"מה ההיקף של ריבוע שאורך צלעו 5 ס\"מ?","hint":"היקף = סכום כל ארבע הצלעות.","choices":[{"id":"a","text":"20"},{"id":"b","text":"25","misconception":"area_instead_of_perimeter"},{"id":"c","text":"10"},{"id":"d","text":"15"}],"correct_choice_id":"a","coins":12}'::jsonb),
  -- Hebrew roots/spelling (grade 5)
  ('cccccccc-0000-0000-0000-000000000004', 'multiple_choice', 3, 'curated', 'auto_passed',
   '{"tag":"עובדה מול דעה","stem":"איזה משפט מבטא דעה, ולא עובדה?","hint":"עובדה אפשר לבדוק ולאמת; דעה מבטאת רגש או שיפוט אישי.","choices":[{"id":"a","text":"הספר הזה הוא הכי מרגש שנכתב אי פעם"},{"id":"b","text":"הספר יצא לאור בשנת 2019"},{"id":"c","text":"בספר יש 210 עמודים"},{"id":"d","text":"הספר תורגם לשבע שפות"}],"correct_choice_id":"a","coins":14}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000004', 'multiple_choice', 3, 'curated', 'auto_passed',
   '{"tag":"משמעות בהקשר","stem":"במשפט \"הילד קרא את הספר בנשימה עצורה\", למה הכוונה בביטוי \"בנשימה עצורה\"?","hint":"זה ביטוי — לא באמת מפסיקים לנשום. חושבים על התחושה.","choices":[{"id":"a","text":"במתח ובריכוז גדול"},{"id":"b","text":"תוך כדי ריצה","misconception":"literal_reading"},{"id":"c","text":"בשקט מוחלט"},{"id":"d","text":"במהירות רבה"}],"correct_choice_id":"a","coins":14}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000004', 'multiple_choice', 4, 'curated', 'auto_passed',
   '{"tag":"טיעון","stem":"\"כדאי ללכת ברגל לבית הספר כי זה בריא, חוסך זיהום אוויר, וגם נעים לפגוש חברים בדרך.\" מהי הטענה המרכזית?","hint":"הטענה היא המסקנה; שאר הדברים הם הנימוקים שתומכים בה.","choices":[{"id":"a","text":"כדאי ללכת ברגל לבית הספר"},{"id":"b","text":"הליכה היא בריאה"},{"id":"c","text":"נעים לפגוש חברים"},{"id":"d","text":"הליכה חוסכת זיהום אוויר"}],"correct_choice_id":"a","coins":14}'::jsonb),
  -- Science (shared enrichment)
  ('cccccccc-0000-0000-0000-000000000005', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"צמחים","stem":"מה נותן לצמח אנרגיה כדי לגדול?","hint":"בלי זה בבוקר לא היינו רואים כלום — וגם הצמח לא היה גדל.","choices":[{"id":"a","text":"אור השמש"},{"id":"b","text":"חושך"},{"id":"c","text":"רעש"},{"id":"d","text":"פלסטיק"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000005', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"בעלי חיים","stem":"איזו חיה היא יונק, למרות שהיא חיה בים?","hint":"היא נושמת אוויר, מניקה את גוריה, וקופצת מעל הגלים.","choices":[{"id":"a","text":"דולפין"},{"id":"b","text":"כריש","misconception":"shark_is_mammal"},{"id":"c","text":"צפרדע"},{"id":"d","text":"נחש"}],"correct_choice_id":"a","coins":10}'::jsonb);

-- Missing subjects: english, bible (cultural), geography.
insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  -- English (grade 3)
  ('dddddddd-0000-0000-0000-000000000001', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"אוצר מילים","stem":"איך אומרים \"כלב\" באנגלית?","hint":"מילה קצרה בת שלוש אותיות, מתחילה ב-D.","choices":[{"id":"a","text":"Dog"},{"id":"b","text":"Cat","misconception":"confuse_dog_cat"},{"id":"c","text":"Fish"},{"id":"d","text":"Bird"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000001', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"אוצר מילים","stem":"איך אומרים \"ספר\" באנגלית?","hint":"מתחיל ב-B, וזה מה שאת קוראת.","choices":[{"id":"a","text":"Book"},{"id":"b","text":"Table"},{"id":"c","text":"Door"},{"id":"d","text":"Apple"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- English (grade 5)
  ('dddddddd-0000-0000-0000-000000000002', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"הבנה","stem":"מה הפירוש של המשפט \"I am happy\"?","hint":"happy = שמח.","choices":[{"id":"a","text":"אני שמח/ה"},{"id":"b","text":"אני עייף/ה"},{"id":"c","text":"אני רעב/ה"},{"id":"d","text":"אני עצוב/ה"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000002', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"דקדוק","stem":"מה צורת הרבים של המילה \"child\" באנגלית?","hint":"זו מילה יוצאת דופן — לא מוסיפים סתם s.","choices":[{"id":"a","text":"children"},{"id":"b","text":"childs","misconception":"regular_plural_overgeneralization"},{"id":"c","text":"childes"},{"id":"d","text":"child"}],"correct_choice_id":"a","coins":12}'::jsonb),
  -- Bible (grade 3, cultural)
  ('dddddddd-0000-0000-0000-000000000003', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"בראשית","stem":"מי בנה את התיבה לפי הסיפור?","hint":"אותו אדם אסף זוגות של כל בעלי החיים.","choices":[{"id":"a","text":"נח"},{"id":"b","text":"אברהם"},{"id":"c","text":"משה"},{"id":"d","text":"דוד"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000003', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"בראשית","stem":"בכמה ימים נברא העולם לפי הסיפור?","hint":"ביום השביעי נחו — אז כמה ימי בריאה היו?","choices":[{"id":"a","text":"שבעה"},{"id":"b","text":"שלושה"},{"id":"c","text":"עשרה"},{"id":"d","text":"אחד"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Bible (grade 5)
  ('dddddddd-0000-0000-0000-000000000004', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"דמויות","stem":"איזה מלך בנה את בית המקדש הראשון בירושלים?","hint":"בנו של דוד המלך, נודע בחוכמתו.","choices":[{"id":"a","text":"שלמה"},{"id":"b","text":"דוד","misconception":"david_built_temple"},{"id":"c","text":"שאול"},{"id":"d","text":"חזקיהו"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000004', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"דמויות","stem":"מי הייתה אחותם של משה ואהרן?","hint":"היא שמרה על משה כשהיה תינוק בתיבה על היאור.","choices":[{"id":"a","text":"מרים"},{"id":"b","text":"רות"},{"id":"c","text":"אסתר"},{"id":"d","text":"דבורה"}],"correct_choice_id":"a","coins":12}'::jsonb),
  -- Geography (shared enrichment)
  ('dddddddd-0000-0000-0000-000000000005', 'multiple_choice', 1, 'curated', 'auto_passed',
   '{"tag":"ארץ ישראל","stem":"מהי בירת ישראל?","hint":"עיר עתיקה עם החומות, במרכז הארץ.","choices":[{"id":"a","text":"ירושלים"},{"id":"b","text":"תל אביב","misconception":"largest_city_is_capital"},{"id":"c","text":"חיפה"},{"id":"d","text":"אילת"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000005', 'multiple_choice', 2, 'curated', 'auto_passed',
   '{"tag":"ארץ ישראל","stem":"איזה מקום בישראל הוא הנקודה הנמוכה ביותר ביבשה בעולם?","hint":"ים מלוח מאוד שאפשר לצוף בו בקלות.","choices":[{"id":"a","text":"ים המלח"},{"id":"b","text":"הכנרת"},{"id":"c","text":"הים התיכון"},{"id":"d","text":"ים סוף"}],"correct_choice_id":"a","coins":12}'::jsonb);

-- Leadership worlds ("אי המצפן"): reflective micro-missions, no right/wrong.
insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'reflection_log', 1, 'curated', 'auto_passed',
   '{"world":1,"kind":"reflection","prompt":"איזו פעולה קטנה עשית היום שמקרבת אותך למי שאת רוצה להיות?","note":"אין כאן תשובה נכונה — כל חותמת מקדמת אותך.","options":[{"id":"hobby","label":"התמדתי בתחביב שאני אוהבת","icon":"star"},{"id":"friend","label":"הייתי חברה טובה","icon":"heart"},{"id":"brave","label":"ניסיתי משהו חדש שהפחיד אותי","icon":"spark"},{"id":"grow","label":"למדתי משהו בעצמי","icon":"book"}]}'::jsonb),
  ('eeeeeeee-0000-0000-0000-000000000002', 'budget_allocation', 1, 'curated', 'auto_passed',
   '{"world":2,"kind":"budget","prompt":"יש לך 5 מטבעות זמן להיום. איך תחלקי אותן?","coins":5,"note":"אי אפשר הכל — לבחור משהו זה גם להגיד ''כן'' לעצמך.","options":[{"id":"club","label":"חוג","icon":"star"},{"id":"screen","label":"מסך","icon":"spark"},{"id":"rest","label":"מנוחה","icon":"heart"},{"id":"friend","label":"זמן עם חברה","icon":"home"}]}'::jsonb),
  ('eeeeeeee-0000-0000-0000-000000000003', 'choice_scenario', 1, 'curated', 'auto_passed',
   '{"world":3,"kind":"scenario","prompt":"חברה מבקשת שתכיני בשבילה שיעורי בית, ואת עמוסה. איך תגידי ''לא'' בצורה יפה?","note":"סירוב מנומס הוא כוח, לא מרד.","choices":[{"id":"a","label":"אני לא יכולה היום — בא לך שנעשה יחד בפעם אחרת?","icon":"star"},{"id":"b","label":"אני עמוסה עכשיו, אבל אשמח לעזור לך להבין משהו קטן","icon":"home"},{"id":"c","label":"היום אני צריכה את הזמן שלי, סבבה?","icon":"ear"}]}'::jsonb);

-- Reward store (shared family catalog)
insert into reward_store (family_id, title, category, cost_coins) values
  ('11111111-1111-1111-1111-111111111111', 'חצי שעה זמן מסך', 'screen_time', 150),
  ('11111111-1111-1111-1111-111111111111', 'ערב סרטים משפחתי', 'family_activity', 150),
  ('11111111-1111-1111-1111-111111111111', 'לבחור את ארוחת הערב', 'privilege', 200);
