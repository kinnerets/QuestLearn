import { NextResponse } from 'next/server';
import { getPendingRedemptions, resolveRedemption } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, pending: [] });
  const pending = await getPendingRedemptions();
  return NextResponse.json({ ok: true, pending: pending ?? [] });
}

export async function POST(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, reason: 'locked' });
  const b = await req.json().catch(() => null);
  const id = b?.id as string | undefined;
  const action = b?.action as 'fulfill' | 'refund' | undefined;
  if (!id || (action !== 'fulfill' && action !== 'refund')) return NextResponse.json({ ok: false, reason: 'bad-input' });
  const ok = await resolveRedemption(id, action);
  return NextResponse.json({ ok });
}
