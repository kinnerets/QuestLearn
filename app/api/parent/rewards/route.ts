import { NextResponse } from 'next/server';
import { getRewards, addReward, updateReward, removeReward } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, rewards: [] });
  const rewards = await getRewards();
  return NextResponse.json({ ok: true, rewards: rewards ?? [] });
}

export async function POST(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, reason: 'locked' });
  const b = await req.json().catch(() => null);
  const action = b?.action as string | undefined;

  if (action === 'add') {
    const title = String(b?.title ?? '').trim();
    const cost = Number(b?.cost) || 0;
    if (!title || cost <= 0) return NextResponse.json({ ok: false, reason: 'bad-input' });
    return NextResponse.json({ ok: await addReward(title, cost) });
  }
  if (action === 'update') {
    const id = b?.id as string | undefined;
    if (!id) return NextResponse.json({ ok: false, reason: 'no-id' });
    const patch: { title?: string; cost?: number } = {};
    if (typeof b?.title === 'string') patch.title = b.title.trim();
    if (b?.cost != null) patch.cost = Number(b.cost);
    return NextResponse.json({ ok: await updateReward(id, patch) });
  }
  if (action === 'remove') {
    const id = b?.id as string | undefined;
    if (!id) return NextResponse.json({ ok: false, reason: 'no-id' });
    return NextResponse.json({ ok: await removeReward(id) });
  }
  return NextResponse.json({ ok: false, reason: 'bad-action' });
}
