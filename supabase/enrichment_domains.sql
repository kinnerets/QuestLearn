-- 5 enrichment domains + sensitive-subject lock column.
-- Safe to run once; also appended to seed.sql for fresh installs.
alter table curriculum_topics add column if not exists parent_locked boolean not null default false;

insert into curriculum_topics (id, grade, subject, sub_topic, order_index, arabic_variant, parent_locked) values
  ('c1c1c1c1-0000-0000-0000-000000000001', 'enrichment', 'economics', 'כסף וכלכלה', 1, null, false),
  ('c2c2c2c2-0000-0000-0000-000000000001', 'enrichment', 'fashion', 'עולם האופנה', 1, null, false),
  ('c3c3c3c3-0000-0000-0000-000000000001', 'enrichment', 'politics', 'איך מדינה עובדת', 1, null, true),
  ('c4c4c4c4-0000-0000-0000-000000000001', 'enrichment', 'ai', 'בינה מלאכותית', 1, null, true),
  ('c5c5c5c5-0000-0000-0000-000000000001', 'enrichment', 'philosophy', 'שאלות גדולות', 1, null, false)
on conflict (id) do update set sub_topic = excluded.sub_topic, parent_locked = excluded.parent_locked;

insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  -- Economics
  ('c1c1c1c1-0000-0000-0000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"כלכלה","stem":"מה זה תקציב?","hints":["תוכנית להוצאות","כמה יש וכמה מוציאים"],"explanation":"תקציב הוא תוכנית שמראה כמה כסף יש וכמה מותר להוציא.","choices":[{"id":"a","text":"תוכנית שמראה כמה כסף יש וכמה מוציאים"},{"id":"b","text":"סוג של מטבע"},{"id":"c","text":"חנות גדולה"},{"id":"d","text":"בנק"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"כלכלה","stem":"למה כדאי לחסוך כסף?","hints":["בשביל העתיד","לא להוציא הכל עכשיו"],"explanation":"חוסכים כדי שיהיה כסף לדברים חשובים או לא צפויים בעתיד.","choices":[{"id":"a","text":"כדי שיהיה כסף לדברים חשובים בעתיד"},{"id":"b","text":"כדי לזרוק אותו"},{"id":"c","text":"כי אסור לקנות כלום"},{"id":"d","text":"כדי שאף אחד לא ייקח"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('c1c1c1c1-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"כלכלה","stem":"מה ההבדל בין ''צורך'' ל''רצון''?","hints":["צורך = חייבים; רצון = כיף שיהיה","אוכל מול צעצוע"],"explanation":"צורך הוא משהו שחייבים כדי לחיות (אוכל, בגד); רצון הוא משהו שנחמד אבל אפשר בלעדיו.","choices":[{"id":"a","text":"צורך חייבים כדי לחיות, רצון זה כיף שיהיה"},{"id":"b","text":"אין הבדל"},{"id":"c","text":"צורך יקר יותר תמיד"},{"id":"d","text":"רצון חשוב יותר מצורך"}],"correct_choice_id":"a","coins":13}'::jsonb),
  -- Fashion
  ('c2c2c2c2-0000-0000-0000-000000000001','multiple_choice',1,'curated','auto_passed',
   '{"tag":"אופנה","stem":"מה עושה מעצב/ת אופנה?","hints":["ממציא בגדים","מצייר ומתכנן איך בגד ייראה"],"explanation":"מעצב אופנה מתכנן ומצייר איך בגדים ואביזרים ייראו.","choices":[{"id":"a","text":"מתכנן ומצייר איך בגדים ייראו"},{"id":"b","text":"מוכר אוכל"},{"id":"c","text":"בונה בתים"},{"id":"d","text":"מנקה חנויות"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('c2c2c2c2-0000-0000-0000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"אופנה","stem":"מאיזה חומר טבעי מייצרים בגדי כותנה?","hints":["גדל בשדה","צמח לבן ורך"],"explanation":"כותנה מיוצרת מצמח הכותנה שגדל בשדה.","choices":[{"id":"a","text":"מצמח הכותנה"},{"id":"b","text":"מפלסטיק"},{"id":"c","text":"ממתכת"},{"id":"d","text":"מזכוכית"}],"correct_choice_id":"a","coins":11}'::jsonb),
  ('c2c2c2c2-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"אופנה","stem":"מה זה ''אופנה בת‑קיימא'' (אקולוגית)?","hints":["פחות בזבוז","בגדים שמכבדים את הסביבה"],"explanation":"אופנה בת‑קיימא שמה דגש על ייצור שמזיק פחות לסביבה ובגדים שמחזיקים לאורך זמן.","choices":[{"id":"a","text":"בגדים שמייצרים בדרך שמזיקה פחות לסביבה"},{"id":"b","text":"בגדים יקרים מאוד"},{"id":"c","text":"בגדים שזורקים כל יום"},{"id":"d","text":"רק בגדים בצבע ירוק"}],"correct_choice_id":"a","coins":13}'::jsonb),
  -- Politics (sensitive)
  ('c3c3c3c3-0000-0000-0000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"אזרחות","stem":"מה זה בחירות?","hints":["בוחרים מי יוביל","הצבעה"],"explanation":"בבחירות האזרחים מצביעים כדי לבחור מי ינהיג את המדינה.","choices":[{"id":"a","text":"תהליך שבו אזרחים בוחרים מי ינהיג"},{"id":"b","text":"סוג של חג"},{"id":"c","text":"משחק ספורט"},{"id":"d","text":"חנות"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('c3c3c3c3-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"אזרחות","stem":"מה תפקיד החוקים במדינה?","hints":["כללים לכולם","כדי שיהיה הוגן ובטוח"],"explanation":"חוקים הם כללים שעוזרים לחיות יחד בבטחה ובהוגנות.","choices":[{"id":"a","text":"כללים שעוזרים לכולם לחיות יחד בבטחה ובהוגנות"},{"id":"b","text":"רק כדי להעניש"},{"id":"c","text":"רק לילדים"},{"id":"d","text":"אין להם תפקיד"}],"correct_choice_id":"a","coins":13}'::jsonb),
  ('c3c3c3c3-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"אזרחות","stem":"מה זה ''רוב'' בהצבעה?","hints":["הצד עם הכי הרבה קולות","יותר מהחצי"],"explanation":"רוב הוא הצד שקיבל הכי הרבה קולות בהצבעה.","choices":[{"id":"a","text":"הצד שקיבל הכי הרבה קולות"},{"id":"b","text":"הצד עם הכי מעט קולות"},{"id":"c","text":"מי שצועק הכי חזק"},{"id":"d","text":"המבוגר ביותר"}],"correct_choice_id":"a","coins":13}'::jsonb),
  -- AI (sensitive)
  ('c4c4c4c4-0000-0000-0000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"בינה מלאכותית","stem":"מה זה בינה מלאכותית (AI)?","hints":["מחשב שלומד","תוכנה שיכולה ללמוד ולעזור"],"explanation":"בינה מלאכותית היא תוכנה שיכולה ללמוד מדוגמאות ולבצע משימות כמו לזהות תמונות או לענות על שאלות.","choices":[{"id":"a","text":"תוכנה שיכולה ללמוד ולבצע משימות"},{"id":"b","text":"רובוט מברזל בלבד"},{"id":"c","text":"סוג של טלפון"},{"id":"d","text":"משחק מחשב"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('c4c4c4c4-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"בינה מלאכותית","stem":"האם כדאי להאמין לכל מה ש‑AI אומר?","hints":["גם AI טועה","כדאי לבדוק"],"explanation":"AI יכול לטעות, ולכן חשוב לבדוק מידע חשוב במקורות נוספים.","choices":[{"id":"a","text":"לא — כדאי לבדוק, כי גם AI טועה לפעמים"},{"id":"b","text":"כן, תמיד צודק"},{"id":"c","text":"רק בלילה"},{"id":"d","text":"רק אם הוא ורוד"}],"correct_choice_id":"a","coins":13}'::jsonb),
  ('c4c4c4c4-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"בינה מלאכותית","stem":"מה עוזר ל‑AI ''ללמוד''?","hints":["הרבה דוגמאות","נתונים"],"explanation":"AI לומד מהרבה דוגמאות (נתונים) — כך הוא משתפר במשימה.","choices":[{"id":"a","text":"הרבה דוגמאות ונתונים"},{"id":"b","text":"שינה טובה"},{"id":"c","text":"אוכל בריא"},{"id":"d","text":"מזג אוויר חם"}],"correct_choice_id":"a","coins":13}'::jsonb),
  -- Philosophy
  ('c5c5c5c5-0000-0000-0000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"פילוסופיה","stem":"מה עושה שאלה ל''שאלה פילוסופית''?","hints":["אין תשובה אחת נכונה","חושבים ומתווכחים עליה"],"explanation":"שאלה פילוסופית היא שאלה גדולה שאין לה תשובה אחת ודאית — חושבים ומתווכחים עליה.","choices":[{"id":"a","text":"שאלה גדולה שאין לה תשובה אחת ודאית"},{"id":"b","text":"שאלה במתמטיקה"},{"id":"c","text":"שאלה על מזג האוויר"},{"id":"d","text":"שאלה עם תשובה אחת ברורה"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('c5c5c5c5-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"פילוסופיה","stem":"''עדיף להיות צודק או להיות טוב לב?'' איזו מין שאלה זו?","hints":["אפשר להתווכח","אין תשובה אחת נכונה"],"explanation":"זו שאלה פילוסופית — אין תשובה אחת נכונה, ואפשר לחשוב ולהתווכח עליה.","choices":[{"id":"a","text":"שאלה פילוסופית לחשיבה"},{"id":"b","text":"תרגיל בחשבון"},{"id":"c","text":"שאלה בגאוגרפיה"},{"id":"d","text":"שאלה בדקדוק"}],"correct_choice_id":"a","coins":13}'::jsonb),
  ('c5c5c5c5-0000-0000-0000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"פילוסופיה","stem":"מה זה ''טיעון''?","hints":["הסבר למה חושבים משהו","סיבה לדעה"],"explanation":"טיעון הוא הסבר או סיבה שנותנים כדי לתמוך בדעה.","choices":[{"id":"a","text":"סיבה או הסבר שתומכים בדעה"},{"id":"b","text":"סוג של ריב"},{"id":"c","text":"שם של משחק"},{"id":"d","text":"מספר"}],"correct_choice_id":"a","coins":12}'::jsonb);
