-- Optional instant fill for geometry / geography / future_skills (both grades).
-- Also in seed.sql. If you skip this, the nightly auto-refill fills them anyway.
insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
  -- Geometry g3 - צורות
  ('cccccccc-0000-0000-0000-000000000001','multiple_choice',1,'curated','auto_passed',
   '{"tag":"צורות","stem":"לאיזו צורה יש 3 צלעות?","hints":["פחות מריבוע","כמו פירמידה מהצד"],"explanation":"למשולש יש 3 צלעות.","choices":[{"id":"a","text":"משולש"},{"id":"b","text":"ריבוע"},{"id":"c","text":"עיגול"},{"id":"d","text":"מחומש"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000001','multiple_choice',1,'curated','auto_passed',
   '{"tag":"צורות","stem":"איזו צורה עגולה ואין לה פינות בכלל?","hints":["כמו גלגל","אין קודקודים"],"explanation":"למעגל אין פינות.","choices":[{"id":"a","text":"מעגל"},{"id":"b","text":"ריבוע"},{"id":"c","text":"משולש"},{"id":"d","text":"מלבן"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000001','multiple_choice',2,'curated','auto_passed',
   '{"tag":"צורות","stem":"כמה פינות (קודקודים) יש למשולש?","hints":["כמו מספר הצלעות","3"],"explanation":"למשולש יש 3 קודקודים.","choices":[{"id":"a","text":"שלוש"},{"id":"b","text":"ארבע"},{"id":"c","text":"שתיים"},{"id":"d","text":"חמש"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Geometry g5 - שטח והיקף
  ('cccccccc-0000-0000-0000-000000000003','multiple_choice',2,'curated','auto_passed',
   '{"tag":"שטח","stem":"מה שטח ריבוע שאורך צלעו 4 ס״מ?","hints":["שטח ריבוע = צלע כפול צלע","4×4"],"explanation":"שטח ריבוע = צלע×צלע = 4×4 = 16.","choices":[{"id":"a","text":"16 סמ״ר"},{"id":"b","text":"8 סמ״ר"},{"id":"c","text":"12 סמ״ר"},{"id":"d","text":"20 סמ״ר"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000003','multiple_choice',3,'curated','auto_passed',
   '{"tag":"היקף","stem":"מה היקף מלבן שאורכו 5 ורוחבו 3?","hints":["היקף = לחבר את כל הצלעות","5+3+5+3"],"explanation":"היקף = 2×(5+3) = 16.","choices":[{"id":"a","text":"16"},{"id":"b","text":"15"},{"id":"c","text":"8"},{"id":"d","text":"11"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('cccccccc-0000-0000-0000-000000000003','multiple_choice',3,'curated','auto_passed',
   '{"tag":"שטח","stem":"מה שטח מלבן שאורכו 6 ורוחבו 3?","hints":["שטח מלבן = אורך כפול רוחב","6×3"],"explanation":"שטח מלבן = 6×3 = 18.","choices":[{"id":"a","text":"18"},{"id":"b","text":"9"},{"id":"c","text":"12"},{"id":"d","text":"24"}],"correct_choice_id":"a","coins":12}'::jsonb),
  -- Geography g3 - ארץ ישראל
  ('dddddddd-0000-0000-0000-000000000005','multiple_choice',1,'curated','auto_passed',
   '{"tag":"ערים","stem":"מהי בירת ישראל?","hints":["בה נמצא הכנסת","עיר הקודש"],"explanation":"בירת ישראל היא ירושלים.","choices":[{"id":"a","text":"ירושלים"},{"id":"b","text":"תל אביב"},{"id":"c","text":"חיפה"},{"id":"d","text":"אילת"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000005','multiple_choice',2,'curated','auto_passed',
   '{"tag":"מים","stem":"איזה ים נמצא במערב ישראל?","hints":["לאורך חופי תל אביב וחיפה","הכי גדול"],"explanation":"במערב ישראל נמצא הים התיכון.","choices":[{"id":"a","text":"הים התיכון"},{"id":"b","text":"ים המלח"},{"id":"c","text":"ים סוף"},{"id":"d","text":"הכנרת"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('dddddddd-0000-0000-0000-000000000005','multiple_choice',2,'curated','auto_passed',
   '{"tag":"מים","stem":"הכנרת היא מקור מים חשוב. מה היא?","hints":["ממנה שותים מים מתוקים","לא ים מלוח"],"explanation":"הכנרת היא אגם מים מתוקים.","choices":[{"id":"a","text":"אגם מים מתוקים"},{"id":"b","text":"ים מלוח"},{"id":"c","text":"מדבר"},{"id":"d","text":"נהר"}],"correct_choice_id":"a","coins":10}'::jsonb),
  -- Geography g5 - אקלים ויבשות
  ('ffffffff-0000-0000-0000-000000000003','multiple_choice',2,'curated','auto_passed',
   '{"tag":"יבשות","stem":"באיזו יבשת נמצאת ישראל?","hints":["לא אירופה ולא אפריקה","היבשת הגדולה ביותר"],"explanation":"ישראל נמצאת ביבשת אסיה.","choices":[{"id":"a","text":"אסיה"},{"id":"b","text":"אירופה"},{"id":"c","text":"אפריקה"},{"id":"d","text":"אוסטרליה"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('ffffffff-0000-0000-0000-000000000003','multiple_choice',3,'curated','auto_passed',
   '{"tag":"אקלים","stem":"מהו המקום הנמוך ביותר ביבשה בעולם?","hints":["בישראל","מים מלוחים מאוד"],"explanation":"ים המלח הוא המקום הנמוך ביותר ביבשה.","choices":[{"id":"a","text":"ים המלח"},{"id":"b","text":"הכנרת"},{"id":"c","text":"האוקיינוס השקט"},{"id":"d","text":"מדבר סהרה"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('ffffffff-0000-0000-0000-000000000003','multiple_choice',3,'curated','auto_passed',
   '{"tag":"יבשות","stem":"איזו יבשת קפואה נמצאת בקוטב הדרומי?","hints":["הכי קרה","כמעט אין בה תושבים"],"explanation":"אנטארקטיקה נמצאת בקוטב הדרומי והיא קפואה.","choices":[{"id":"a","text":"אנטארקטיקה"},{"id":"b","text":"אפריקה"},{"id":"c","text":"אירופה"},{"id":"d","text":"אמריקה הדרומית"}],"correct_choice_id":"a","coins":12}'::jsonb),
  -- Future skills g3 - יזמות: המצאות
  ('aaaaaaaa-0000-0000-0000-000000000003','multiple_choice',2,'curated','auto_passed',
   '{"tag":"יזמות","stem":"מה עושים כשרעיון לא עובד בפעם הראשונה?","hints":["לא מוותרים מיד","משנים ומשפרים"],"explanation":"מנסים שוב, לומדים מהטעות ומשפרים את הרעיון.","choices":[{"id":"a","text":"מנסים שוב ומשפרים"},{"id":"b","text":"מוותרים לגמרי"},{"id":"c","text":"מסתירים את הרעיון"},{"id":"d","text":"מאשימים מישהו אחר"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000003','multiple_choice',2,'curated','auto_passed',
   '{"tag":"יזמות","stem":"מה עוזר להסביר רעיון חדש לפני שבונים אותו?","hints":["ציור של הרעיון","לא צריך מילים בלבד"],"explanation":"שרטוט או סקיצה עוזרים להראות איך הרעיון ייראה.","choices":[{"id":"a","text":"לצייר שרטוט של הרעיון"},{"id":"b","text":"לשמור אותו בסוד"},{"id":"c","text":"לא לספר לאף אחד"},{"id":"d","text":"לחכות שנה"}],"correct_choice_id":"a","coins":10}'::jsonb),
  ('aaaaaaaa-0000-0000-0000-000000000003','multiple_choice',3,'curated','auto_passed',
   '{"tag":"עבודת צוות","stem":"מה חשוב בעבודת צוות על המצאה?","hints":["גם להקשיב וגם לעזור","לא רק לדבר"],"explanation":"בעבודת צוות חשוב להקשיב לאחרים ולעזור.","choices":[{"id":"a","text":"להקשיב ולעזור אחד לשני"},{"id":"b","text":"שכל אחד יעבוד לבד"},{"id":"c","text":"להתווכח כל הזמן"},{"id":"d","text":"שאחד יחליט הכל"}],"correct_choice_id":"a","coins":11}'::jsonb),
  -- Future skills g5 - יזמות: מ‑MVP לשוק
  ('ffffffff-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"יזמות","stem":"מה זה קהל יעד?","hints":["מי אמור להשתמש במוצר","לא כולם בעולם"],"explanation":"קהל יעד הוא האנשים שהמוצר מיועד להם.","choices":[{"id":"a","text":"האנשים שהמוצר מיועד להם"},{"id":"b","text":"רק המשפחה של היזם"},{"id":"c","text":"כל אנשי העולם בדיוק"},{"id":"d","text":"המתחרים"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('ffffffff-0000-0000-0000-000000000001','multiple_choice',3,'curated','auto_passed',
   '{"tag":"יזמות","stem":"למה חשוב לקבל משוב מלקוחות?","hints":["כדי לדעת מה לשפר","הם משתמשים במוצר"],"explanation":"משוב מלקוחות עוזר להבין מה עובד ומה כדאי לשפר.","choices":[{"id":"a","text":"כדי לשפר את המוצר"},{"id":"b","text":"כדי להעלות מחיר בלי סיבה"},{"id":"c","text":"זה לא חשוב"},{"id":"d","text":"כדי להעתיק ממתחרים"}],"correct_choice_id":"a","coins":12}'::jsonb),
  ('ffffffff-0000-0000-0000-000000000001','multiple_choice',4,'curated','auto_passed',
   '{"tag":"יזמות","stem":"מהי המטרה של \"סיעור מוחות\" (brainstorm)?","hints":["הרבה רעיונות בלי לפסול מיד","כמות לפני איכות"],"explanation":"בסיעור מוחות מעלים כמה שיותר רעיונות בלי לפסול, ואחר כך בוחרים.","choices":[{"id":"a","text":"להעלות הרבה רעיונות בלי לפסול מיד"},{"id":"b","text":"לבחור מיד רעיון אחד"},{"id":"c","text":"לבקר כל רעיון"},{"id":"d","text":"לא לחשוב בכלל"}],"correct_choice_id":"a","coins":13}'::jsonb);
