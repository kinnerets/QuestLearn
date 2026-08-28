import { NextResponse } from 'next/server';
import { buyAvatarItem } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false, reason: 'no-profile' });
  const body = await req.json().catch(() => null);
  const itemId = body?.itemId as string | undefined;
  if (!itemId) return NextResponse.json({ ok: false, reason: 'no-item' });
  const res = await buyAvatarItem(id, itemId);
  return NextResponse.json(res);
}
