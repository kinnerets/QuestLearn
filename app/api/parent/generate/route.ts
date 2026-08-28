import { NextResponse } from 'next/server';
import { generateTopicReport } from '@/lib/generator';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, reason: 'locked' });
  const b = await req.json().catch(() => null);
  if (!b?.topicId) return NextResponse.json({ ok: false, reason: 'no-topic' });
  const r = await generateTopicReport(String(b.topicId));
  return NextResponse.json({ ok: true, ...r });
}
