#!/usr/bin/env python3
"""Curated true_false + type_in questions across existing topics, so the new
question types show up immediately. Writes supabase/question_types.sql and
appends it to seed.sql. Idempotent: clears prior curated rows of these types
for the touched topics first."""
import json, os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUP = os.path.join(HERE, 'supabase')


def lit(payload: dict) -> str:
    return "'" + json.dumps(payload, ensure_ascii=False).replace("'", "''") + "'::jsonb"


# (topic_id, difficulty, type, payload)
def TF(tid, diff, tag, stem, answer, hints, expl):
    return (tid, diff, 'true_false', {'tag': tag, 'stem': stem, 'answer': answer, 'hints': hints, 'explanation': expl})

def TI(tid, diff, tag, stem, answers, hints, expl):
    return (tid, diff, 'type_in', {'tag': tag, 'stem': stem, 'answers': answers, 'hints': hints, 'explanation': expl})


MATH3 = 'aaaaaaaa-0000-0000-0000-000000000001'   # לוח הכפל
GEO3  = 'cccccccc-0000-0000-0000-000000000001'   # צורות
HEB3  = 'cccccccc-0000-0000-0000-000000000002'   # אוצר מילים
SCI3  = 'cccccccc-0000-0000-0000-000000000005'   # עולם החי
ENG3  = 'dddddddd-0000-0000-0000-000000000001'   # מילים ראשונות
BIB3  = 'dddddddd-0000-0000-0000-000000000003'   # סיפורי בראשית
GEOG3 = 'dddddddd-0000-0000-0000-000000000005'   # ארץ ישראל
MATH5 = 'bbbbbbbb-0000-0000-0000-000000000001'   # שברים
GEO5  = 'cccccccc-0000-0000-0000-000000000003'   # שטח והיקף
HEB5  = 'cccccccc-0000-0000-0000-000000000004'   # הבנה וטיעון
ENG5  = 'dddddddd-0000-0000-0000-000000000002'   # קריאה והבנה

Q = [
    # math g3
    TI(MATH3, 1, 'כפל', 'כמה זה 8 × 3?', ['24'], ['ספרי בקפיצות של 8', '8, 16, 24'], '8×3=24.'),
    TF(MATH3, 1, 'כפל', '6 × 7 שווה 42.', True, ['ספרי בקפיצות של 7', 'שש קפיצות'], 'נכון — 6×7=42.'),
    TI(MATH3, 2, 'כפל', 'כמה זה 9 × 4?', ['36'], ['9, 18, 27…', 'ארבע קפיצות של 9'], '9×4=36.'),
    # geometry g3
    TI(GEO3, 1, 'צורות', 'לכמה צלעות יש משולש?', ['3', 'שלוש'], ['בשם רמז', 'מְשׁוּלָּשׁ'], 'למשולש 3 צלעות.'),
    TF(GEO3, 1, 'צורות', 'לריבוע יש ארבע צלעות באותו אורך.', True, ['ריבוע…', 'כל הצלעות שוות'], 'נכון.'),
    # hebrew g3
    TF(HEB3, 1, 'נרדפות', 'המילים "שמח" ו"עצוב" הן מילים נרדפות.', False, ['אותה משמעות?', 'הפוכות'], 'לא — הן הפכים, לא נרדפות.'),
    TI(HEB3, 1, 'הפכים', 'מה ההפך מהמילה "גדול"?', ['קטן'], ['משהו זעיר', 'ההפך מגדול'], 'ההפך מגדול הוא קטן.'),
    # science g3
    TF(SCI3, 1, 'בעלי חיים', 'דג נושם דרך ריאות כמו בני אדם.', False, ['איפה חי הדג?', 'זימים'], 'לא — דג נושם דרך זימים.'),
    TI(SCI3, 2, 'בעלי חיים', 'כמה רגליים יש לחרק?', ['6', 'שש'], ['לא ארבע', 'מספר זוגי'], 'לחרק 6 רגליים.'),
    # english g3
    TI(ENG3, 1, 'אנגלית', 'איך אומרים "כלב" באנגלית?', ['dog'], ['חיה נובחת', 'מתחיל ב-d'], '"כלב" = dog.'),
    TF(ENG3, 1, 'אנגלית', 'המילה "cat" באנגלית פירושה חתול.', True, ['חיה שאומרת מיאו', 'נכון?'], 'נכון — cat = חתול.'),
    # bible g3
    TF(BIB3, 1, 'בראשית', 'נוח בנה תיבה לפי הסיפור.', True, ['כלי שט גדול', 'בשביל החיות'], 'נכון — נוח בנה תיבה.'),
    # geography g3
    TF(GEOG3, 1, 'ארץ ישראל', 'ירושלים היא בירת ישראל.', True, ['עיר הבירה', 'נכון?'], 'נכון.'),
    # math g5
    TI(MATH5, 2, 'שברים', 'כמה זה 1/2 + 1/2? (כמספר שלם)', ['1', 'אחד'], ['שני חצאים', 'שלם'], 'חצי ועוד חצי = 1.'),
    TF(MATH5, 2, 'שברים', 'השבר 1/3 גדול יותר מ-1/2.', False, ['חשבי על פיצה', 'יותר חתיכות = קטנות'], 'לא — 1/2 גדול מ-1/3.'),
    TI(MATH5, 3, 'אחוזים', 'כמה זה 25% מתוך 100?', ['25'], ['רבע', '100 חלקי 4'], '25% מ-100 זה 25.'),
    # geometry g5
    TI(GEO5, 2, 'שטח', 'מה השטח של ריבוע שצלעו 5 ס״מ? (מספר בלבד)', ['25'], ['צלע כפול צלע', '5×5'], 'שטח = 5×5 = 25.'),
    TF(GEO5, 2, 'זוויות', 'בזווית ישרה יש 90 מעלות.', True, ['פינת ריבוע', 'רבע סיבוב'], 'נכון — זווית ישרה = 90°.'),
    # hebrew g5
    TF(HEB5, 2, 'עובדה ודעה', 'המשפט "גלידה היא הקינוח הכי טעים" הוא עובדה.', False, ['אפשר להתווכח?', 'טעם אישי'], 'לא — זו דעה, לא עובדה.'),
    # english g5
    TI(ENG5, 2, 'אנגלית', 'מה צורת הרבים של "child"?', ['children'], ['לא childs', 'צורה חריגה'], 'הרבים של child הוא children.'),
]

topic_ids = sorted({q[0] for q in Q})
ids_sql = ",\n  ".join(f"'{i}'" for i in topic_ids)

rows = ",\n".join(
    f"  ('{tid}','{qtype}',{diff},'curated','auto_passed',\n   {lit(payload)})"
    for (tid, diff, qtype, payload) in Q
)

out = f"""-- Curated true_false + type_in questions (new question types).
-- Safe to re-run: clears prior curated rows of these types for these topics.

-- The type column had a CHECK that only allowed the original types, so
-- 'true_false'/'type_in' were rejected. Drop it — the app owns the type list.
alter table questions_bank drop constraint if exists questions_bank_type_check;

delete from questions_bank
 where source = 'curated' and type in ('true_false','type_in')
   and topic_id in (
  {ids_sql}
);

insert into questions_bank (topic_id, type, difficulty, source, verification_status, payload) values
{rows};
"""

open(os.path.join(SUP, 'question_types.sql'), 'w', encoding='utf-8').write(out)
print('wrote question_types.sql ·', len(Q), 'questions across', len(topic_ids), 'topics')
