import { BottomNav } from '@/components/BottomNav';

export default function ShopPage() {
  return (
    <main className="app-shell">
      <div className="screen-body placeholder">
        <h1>חנות הפרסים</h1>
        <p>פרסים משפחתיים ופריטי אווטאר — בשלב הבא.</p>
      </div>
      <BottomNav active="/shop" />
    </main>
  );
}
