-- Seasonal content: one topic per holiday/season, surfaced automatically by date.
-- Safe to run once; also appended to seed.sql. (parent_locked uses its default.)
insert into curriculum_topics (id, grade, subject, sub_topic, order_index, arabic_variant) values
  ('b0000001-0000-4000-8000-000000000001','enrichment','seasonal','ראש השנה',1,null),
  ('b0000001-0000-4000-8000-000000000002','enrichment','seasonal','סוכות',2,null),
  ('b0000001-0000-4000-8000-000000000003','enrichment','seasonal','חנוכה',3,null),
  ('b0000001-0000-4000-8000-000000000004','enrichment','seasonal','ט״ו בשבט',4,null),
  ('b0000001-0000-4000-8000-000000000005','enrichment','seasonal','פורים',5,null),
  ('b0000001-0000-4000-8000-000000000006','enrichment','seasonal','פסח',6,null),
  ('b0000001-0000-4000-8000-000000000007','enrichment','seasonal','יום העצמאות',7,null),
  ('b0000001-0000-4000-8000-000000000008','enrichment','seasonal','שבועות',8,null),
  ('b0000001-0000-4000-8000-000000000009','enrichment','seasonal','קיץ',9,null)
on conflict (id) do update set sub_topic = excluded.sub_topic;

insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  -- ראש השנה
  ('b0000001-0000-4000-8000-000000000001','multiple_choice',1,'curated','auto_passed',
   '{"tag":"ראש השנה","stem":"מה טובלים בדבש בראש השנה?","hints":["פרי אדום או ירוק","סימן לשנה מתוקה"],"explanation":"טובלים תפוח בדבש כסימן לשנה מתוקה.","choices":[{"id":"a","text":"תפוח"},{"id":"b","text":"בננה"},{"id":"c","text":"מלפפון"},{"id":"d","text":"לחם"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"ראש השנה","stem":"באיזה כלי תוקעים בראש השנה?","hints":["עשוי מקרן של בעל חיים","קול מיוחד"],"explanation":"תוקעים בשופר, שעשוי מקרן.","choices":[{"id":"a","text":"שופר"},{"id":"b","text":"חליל"},{"id":"c","text":"תוף"},{"id":"d","text":"גיטרה"}],"correct_choice_id":"a","coins":11}'::jsonb),
  ('b0000001-0000-4000-8000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"ראש השנה","stem":"ראש השנה הוא תחילת החודש העברי…","hints":["החודש הראשון בשנה העברית לחגים","מתחיל ב‑ת"],"explanation":"ראש השנה חל בא׳ בתשרי.","choices":[{"id":"a","text":"תשרי"},{"id":"b","text":"ניסן"},{"id":"c","text":"אב"},{"id":"d","text":"אדר"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- סוכות
  ('b0000001-0000-4000-8000-000000000002','multiple_choice',1,'curated','auto_passed',
   '{"tag":"סוכות","stem":"איפה נהוג לשבת ולאכול בחג סוכות?","hints":["מבנה זמני עם סכך","בונים אותה בחצר"],"explanation":"בחג סוכות יושבים בסוכה.","choices":[{"id":"a","text":"בסוכה"},{"id":"b","text":"במרתף"},{"id":"c","text":"בעלייה"},{"id":"d","text":"במוסך"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000002','multiple_choice',2,'curated','auto_passed',
   '{"tag":"סוכות","stem":"איזה פרי הוא אחד מארבעת המינים?","hints":["ריחני וצהוב","לא לימון"],"explanation":"האתרוג הוא אחד מארבעת המינים (יחד עם לולב, הדס וערבה).","choices":[{"id":"a","text":"אתרוג"},{"id":"b","text":"תפוז"},{"id":"c","text":"אגס"},{"id":"d","text":"ענב"}],"correct_choice_id":"a","coins":11}'::jsonb),
  ('b0000001-0000-4000-8000-000000000002','multiple_choice',2,'curated','auto_passed',
   '{"tag":"סוכות","stem":"ממה עשוי ה''סכך'' שמכסה את הסוכה?","hints":["מהצומח","ענפים ועלים"],"explanation":"הסכך עשוי מצמחייה - ענפים ועלים.","choices":[{"id":"a","text":"ענפים ועלים"},{"id":"b","text":"מתכת"},{"id":"c","text":"זכוכית"},{"id":"d","text":"פלסטיק"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- חנוכה
  ('b0000001-0000-4000-8000-000000000003','multiple_choice',1,'curated','auto_passed',
   '{"tag":"חנוכה","stem":"כמה נרות מדליקים בלילה האחרון של חנוכה (בלי השמש)?","hints":["חנוכה נמשך 8 ימים","מספר הימים"],"explanation":"בלילה השמיני מדליקים 8 נרות (ועוד השמש).","choices":[{"id":"a","text":"שמונה"},{"id":"b","text":"שבעה"},{"id":"c","text":"שישה"},{"id":"d","text":"עשרה"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000003','multiple_choice',1,'curated','auto_passed',
   '{"tag":"חנוכה","stem":"איזה מאכל מטוגן אוכלים בחנוכה?","hints":["מתוק ועגול","עם ריבה בפנים"],"explanation":"בחנוכה נהוג לאכול סופגניות (וגם לביבות).","choices":[{"id":"a","text":"סופגנייה"},{"id":"b","text":"מרק"},{"id":"c","text":"סלט"},{"id":"d","text":"לחם"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000003','multiple_choice',2,'curated','auto_passed',
   '{"tag":"חנוכה","stem":"מה מסובבים ומשחקים בו בחנוכה?","hints":["צעצוע מסתובב","עליו אותיות"],"explanation":"משחקים בסביבון עם האותיות נ‑ג‑ה‑פ.","choices":[{"id":"a","text":"סביבון"},{"id":"b","text":"כדור"},{"id":"c","text":"קלף"},{"id":"d","text":"בובה"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- ט"ו בשבט
  ('b0000001-0000-4000-8000-000000000004','multiple_choice',1,'curated','auto_passed',
   '{"tag":"ט״ו בשבט","stem":"ט״ו בשבט נקרא ''ראש השנה ל…''","hints":["קשור לטבע","גדלים בגינה וביער"],"explanation":"ט״ו בשבט הוא ראש השנה לאילנות (לעצים).","choices":[{"id":"a","text":"אילנות (עצים)"},{"id":"b","text":"מכוניות"},{"id":"c","text":"בתים"},{"id":"d","text":"ספרים"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000004','multiple_choice',1,'curated','auto_passed',
   '{"tag":"ט״ו בשבט","stem":"מה נהוג לעשות בט״ו בשבט?","hints":["פעולה טובה לטבע","שמים שתיל באדמה"],"explanation":"נהוג לנטוע עצים בט״ו בשבט.","choices":[{"id":"a","text":"לנטוע עצים"},{"id":"b","text":"לשבור ענפים"},{"id":"c","text":"לזרוק זבל"},{"id":"d","text":"לכבות אורות"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000004','multiple_choice',2,'curated','auto_passed',
   '{"tag":"ט״ו בשבט","stem":"איזה מאכל מיובש נהוג לאכול בט״ו בשבט?","hints":["פרי יבש ומתוק","מגיע מהגפן"],"explanation":"נהוג לאכול פירות יבשים כמו צימוקים (ותאנים).","choices":[{"id":"a","text":"צימוקים"},{"id":"b","text":"שוקולד"},{"id":"c","text":"גלידה"},{"id":"d","text":"צ׳יפס"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- פורים
  ('b0000001-0000-4000-8000-000000000005','multiple_choice',1,'curated','auto_passed',
   '{"tag":"פורים","stem":"איזו מגילה קוראים בפורים?","hints":["שם של מלכה","מתחיל ב‑א"],"explanation":"בפורים קוראים את מגילת אסתר.","choices":[{"id":"a","text":"מגילת אסתר"},{"id":"b","text":"מגילת רות"},{"id":"c","text":"מגילת יונה"},{"id":"d","text":"מגילת דוד"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000005','multiple_choice',1,'curated','auto_passed',
   '{"tag":"פורים","stem":"איזו עוגייה משולשת אוכלים בפורים?","hints":["על שם דמות מהמגילה","צורת משולש"],"explanation":"אוכלים אוזני המן - עוגייה משולשת.","choices":[{"id":"a","text":"אוזני המן"},{"id":"b","text":"סופגנייה"},{"id":"c","text":"מצה"},{"id":"d","text":"בייגלה"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000005','multiple_choice',2,'curated','auto_passed',
   '{"tag":"פורים","stem":"מה נהוג לשלוח לחברים בפורים?","hints":["חבילה עם ממתקים ומאכלים","שתי מנות לפחות"],"explanation":"נהוג לשלוח משלוח מנות - מאכלים לחברים.","choices":[{"id":"a","text":"משלוח מנות"},{"id":"b","text":"שיעורי בית"},{"id":"c","text":"אבנים"},{"id":"d","text":"בגדים ישנים"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- פסח
  ('b0000001-0000-4000-8000-000000000006','multiple_choice',1,'curated','auto_passed',
   '{"tag":"פסח","stem":"מה אוכלים בפסח במקום לחם?","hints":["דק ופריך","לא תפח"],"explanation":"בפסח אוכלים מצה במקום לחם.","choices":[{"id":"a","text":"מצה"},{"id":"b","text":"פיתה"},{"id":"c","text":"לחמנייה"},{"id":"d","text":"בורקס"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000006','multiple_choice',2,'curated','auto_passed',
   '{"tag":"פסח","stem":"איך נקראת הארוחה החגיגית בליל פסח?","hints":["קוראים בה הגדה","סדר מסוים"],"explanation":"ארוחת ליל פסח נקראת ''הסדר''.","choices":[{"id":"a","text":"הסדר"},{"id":"b","text":"הקידוש"},{"id":"c","text":"הבדלה"},{"id":"d","text":"הסעודה השלישית"}],"correct_choice_id":"a","coins":11}'::jsonb),
  ('b0000001-0000-4000-8000-000000000006','multiple_choice',2,'curated','auto_passed',
   '{"tag":"פסח","stem":"פסח מזכיר את יציאת בני ישראל מ…","hints":["ארץ בדרום","עם פירמידות"],"explanation":"פסח מזכיר את יציאת מצרים.","choices":[{"id":"a","text":"מצרים"},{"id":"b","text":"בבל"},{"id":"c","text":"יוון"},{"id":"d","text":"רומא"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- יום העצמאות
  ('b0000001-0000-4000-8000-000000000007','multiple_choice',1,'curated','auto_passed',
   '{"tag":"יום העצמאות","stem":"מה חוגגים ביום העצמאות?","hints":["הקמת המדינה","1948"],"explanation":"ביום העצמאות חוגגים את הקמת מדינת ישראל.","choices":[{"id":"a","text":"הקמת מדינת ישראל"},{"id":"b","text":"תחילת הקיץ"},{"id":"c","text":"יום הולדת של המורה"},{"id":"d","text":"סוף שנת הלימודים"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000007','multiple_choice',1,'curated','auto_passed',
   '{"tag":"יום העצמאות","stem":"מה הם צבעי דגל ישראל?","hints":["כמו הטלית","שני צבעים"],"explanation":"דגל ישראל כחול ולבן, עם מגן דוד.","choices":[{"id":"a","text":"כחול ולבן"},{"id":"b","text":"אדום וירוק"},{"id":"c","text":"שחור וצהוב"},{"id":"d","text":"סגול וכתום"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000007','multiple_choice',2,'curated','auto_passed',
   '{"tag":"יום העצמאות","stem":"מה נהוג לראות בשמיים ביום העצמאות?","hints":["חיל האוויר","טסים ביחד"],"explanation":"נהוג לצפות במטס של מטוסי חיל האוויר.","choices":[{"id":"a","text":"מטס מטוסים"},{"id":"b","text":"שלג"},{"id":"c","text":"עלים נושרים"},{"id":"d","text":"ברקים"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- שבועות
  ('b0000001-0000-4000-8000-000000000008','multiple_choice',1,'curated','auto_passed',
   '{"tag":"שבועות","stem":"מה מציין חג שבועות?","hints":["קרה בהר סיני","קיבלנו אותה"],"explanation":"שבועות מציין את מתן תורה (קבלת התורה).","choices":[{"id":"a","text":"קבלת התורה"},{"id":"b","text":"בניית הפירמידות"},{"id":"c","text":"גילוי אמריקה"},{"id":"d","text":"המצאת הגלגל"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000008','multiple_choice',1,'curated','auto_passed',
   '{"tag":"שבועות","stem":"אילו מאכלים נהוג לאכול בשבועות?","hints":["מהחלב","גבינות ועוגות גבינה"],"explanation":"בשבועות נהוג לאכול מאכלי חלב, כמו גבינות ובלינצ׳ס.","choices":[{"id":"a","text":"מאכלי חלב"},{"id":"b","text":"בשר בלבד"},{"id":"c","text":"רק פירות יבשים"},{"id":"d","text":"רק מרק"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000008','multiple_choice',2,'curated','auto_passed',
   '{"tag":"שבועות","stem":"שבועות הוא גם חג של…","hints":["בחקלאות","אוספים את היבול"],"explanation":"שבועות הוא חג הקציר והביכורים.","choices":[{"id":"a","text":"קציר וביכורים"},{"id":"b","text":"שלג"},{"id":"c","text":"דיג"},{"id":"d","text":"ציד"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- קיץ
  ('b0000001-0000-4000-8000-000000000009','multiple_choice',1,'curated','auto_passed',
   '{"tag":"קיץ","stem":"מה מומלץ למרוח על העור לפני שיוצאים לשמש בקיץ?","hints":["מגן מכוויות שמש","קרם מיוחד"],"explanation":"מורחים קרם הגנה כדי להגן על העור מהשמש.","choices":[{"id":"a","text":"קרם הגנה"},{"id":"b","text":"קטשופ"},{"id":"c","text":"דבק"},{"id":"d","text":"צבע"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000009','multiple_choice',1,'curated','auto_passed',
   '{"tag":"קיץ","stem":"איזה פרי קיץ עסיסי ואדום מבפנים אוכלים בחום?","hints":["גדול וירוק מבחוץ","עם גרעינים שחורים"],"explanation":"אבטיח הוא פרי קיץ עסיסי, ירוק מבחוץ ואדום מבפנים.","choices":[{"id":"a","text":"אבטיח"},{"id":"b","text":"תפוח"},{"id":"c","text":"בננה"},{"id":"d","text":"אגוז"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('b0000001-0000-4000-8000-000000000009','multiple_choice',2,'curated','auto_passed',
   '{"tag":"קיץ","stem":"למה חשוב לשתות הרבה מים בקיץ?","hints":["חם ומזיעים","הגוף מאבד נוזלים"],"explanation":"בקיץ מזיעים ומאבדים נוזלים, ולכן חשוב לשתות הרבה מים.","choices":[{"id":"a","text":"כי מזיעים ומאבדים נוזלים"},{"id":"b","text":"כי המים מתוקים"},{"id":"c","text":"כדי לגדול מהר"},{"id":"d","text":"אין סיבה"}],"correct_choice_id":"a","coins":11}'::jsonb);
