import Link from 'next/link';

export default function ExercisePage() {
  return (
    <main className="app-shell">
      <div className="screen-body placeholder">
        <h1>זירת התרגול</h1>
        <p>שאלה אחת בכל פעם, עם רמז מקפי — בשלב הבא.</p>
        <p><Link href="/" style={{ color: 'var(--magenta-deep)', fontWeight: 700 }}>חזרה לבית</Link></p>
      </div>
    </main>
  );
}
