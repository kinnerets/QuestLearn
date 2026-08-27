import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { getChildren, getRewards, type Reward } from '@/lib/db';
import { selectedChildId } from '@/lib/session';
import { mili } from '@/lib/mockData';
import { ShopList } from './ShopList';

export const dynamic = 'force-dynamic';

const MOCK_REWARDS: Reward[] = [
  { id: 'm1', title: 'חצי שעה זמן מסך', category: 'screen_time', cost: 150 },
  { id: 'm2', title: 'ערב סרטים משפחתי', category: 'family_activity', cost: 150 },
  { id: 'm3', title: 'לבחור את ארוחת הערב', category: 'privilege', cost: 200 },
];

export default async function ShopPage() {
  const selectedId = selectedChildId();
  const children = await getChildren();
  if (children && children.length && (!selectedId || !children.some((c) => c.id === selectedId))) {
    redirect('/profiles');
  }
  const child = children?.find((c) => c.id === selectedId) ?? children?.[0] ?? null;
  const rewards = (await getRewards()) ?? MOCK_REWARDS;
  const coins = child?.coins ?? mili.quest_coins;

  return (
    <main className="app-shell">
      <ShopList rewards={rewards} coins={coins} />
      <BottomNav active="/shop" />
    </main>
  );
}
