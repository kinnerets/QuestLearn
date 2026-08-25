import { NextResponse } from 'next/server';
import { completeQuest } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ coins: 0 }));
  const ok = await completeQuest(Number(body?.coins) || 0);
  return NextResponse.json({ ok });
}
