# QuestLearn

אפליקציית למידה אדפטיבית ומשוחקת (gamified) — פרויקט אישי לשתי בנות: מילי (כיתה ג') ואחותה ליה (כיתה ה').

המערכת מרכיבה לכל ילדה **מסלול יומי חכם** מתוכנית הלימודים של משרד החינוך + מקצועות העשרה ("שער העתיד"), עם מנוע המלצות אדפטיבי, חזרה מרווחת, ודמות מנחה — **קפי (Capi)**.

## עקרונות מפתח
- **חכם עם התערבות ידנית:** מנוע ממליץ על התוכן היומי; ההורה יכול לעקוף (Pin / Lock / Inject / Boost).
- **ללא לחץ:** אין מנגנון עונש; טעות → רמז מדורג ועידוד מקפי.
- **תגמול מגוון:** מעבר לזמן מסך — פעילות משפחתית, זכויות, חוויות.
- **פרטיות ילדים תחילה:** מינימום מידע, מחיקת הקלטות אוטומטית, אימות הורה.

## מבנה
- [`docs/spec.md`](./docs/spec.md) — מסמך האפיון המלא (v5.2) + מפת דרכים.
- [`docs/character-capi.md`](./docs/character-capi.md) — מדריך הדמות המנחה קפי.
- [`docs/leadership-worlds.md`](./docs/leadership-worlds.md) — עולם המנהיגות: 4 מודולים למנהיגות אישית.
- [`design/`](./design) — קובצי מקור לקנבס העיצוב (Claude Design).
- `app/`, `components/`, `lib/` — אפליקציית Next.js (App Router, TypeScript, RTL).
- [`supabase/migrations/`](./supabase/migrations) — סכמת מסד הנתונים (PostgreSQL/Supabase).

## הרצה (פיתוח)
```bash
npm install
cp .env.example .env.local   # מלאו פרטי Supabase (אופציונלי לשלב 0 — רץ על מוק-דאטה)
npm run dev                  # http://localhost:3000
npm run build && npm start   # בילד + הרצת production
npm run typecheck            # בדיקת טיפוסים
```
מסד נתונים: הריצו את `supabase/migrations/0001_init.sql` בפרויקט Supabase (SQL Editor או Supabase CLI).

## סטטוס — שלב 0 בוצע
- שלד Next.js (PWA) + TypeScript, RTL, מערכת עיצוב של קפי (טוקנים, גופנים Rubik/Assistant).
- **מסך הבית חי** (הפריסה הסופית: בוקר טוב ורוד + מלבני מטבעות/רצף + כרטיסי משימות) — נבנה, טופס ורונדר.
- **אווטאר מודולרי** כרכיב React (`components/Avatar.tsx`) ודמות **קפי** (`components/Capi.tsx`) עם מצבי הבעה.
- **סכמת DB מלאה** לכל הטבלאות (כולל טבלאות האווטאר) + טיפוסי TypeScript (`lib/types.ts`).
- מסכי placeholder לניווט (המצב שלי / חנות / תרגול).

**הבא בתור:** חיבור Supabase אמיתי + Auth, זירת תרגול end-to-end עם שאלה אחת ומנוע רמזים, ומנוע ה-Composer.

## סטאק
Next.js (App Router, PWA) · PostgreSQL/Supabase · LLM (Claude) · Whisper/Web Speech API
