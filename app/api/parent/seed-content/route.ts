import { NextResponse } from 'next/server';
import { ensureGlobalBuffer, thinTopicCount } from '@/lib/generator';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // a batch of sequential generations

// GET: how many topics still need filling. POST: fill one batch, then report.
export async function GET() {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, remaining: 0 });
  return NextResponse.json({ ok: true, remaining: await thinTopicCount() });
}

export async function POST() {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, remaining: 0 });
  const result = await ensureGlobalBuffer(8); // fills the 8 thinnest topics this call
  const remaining = await thinTopicCount();
  return NextResponse.json({ ok: true, ...result, remaining });
}
