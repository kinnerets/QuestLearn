import { NextResponse } from 'next/server';
import { redeemReward } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false, reason: 'no-profile' });
  const b = await req.json().catch(() => null);
  if (!b?.rewardId) return NextResponse.json({ ok: false, reason: 'no-reward' });
  const res = await redeemReward(id, String(b.rewardId));
  return NextResponse.json(res);
}
