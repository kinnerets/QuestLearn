import { BottomNav } from '@/components/BottomNav';

export default function StatusPage() {
  return (
    <main className="app-shell">
      <div className="screen-body placeholder">
        <h1>המצב שלי</h1>
        <p>חוזקות ותחומים לאימון — בשלב הבא.</p>
      </div>
      <BottomNav active="/status" />
    </main>
  );
}
