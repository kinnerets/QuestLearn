import { NextResponse } from 'next/server';
import { completeQuest, awardNewBadges, getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ coins: 0 }));
  const id = selectedChildId();
  const granted = await completeQuest(Number(body?.coins) || 0, id ?? undefined, Number(body?.xp) || 0);
  let newBadges: { key: string; label: string; desc: string }[] = [];
  if (id) {
    const child = await getChildProfileById(id);
    const fresh = await awardNewBadges(id, child?.grade ?? 'grade_3');
    newBadges = fresh.map((b) => ({ key: b.key, label: b.label, desc: b.desc }));
  }
  return NextResponse.json({ ok: true, granted, newBadges });
}
