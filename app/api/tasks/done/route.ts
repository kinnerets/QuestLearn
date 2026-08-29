import { NextResponse } from 'next/server';
import { completeHomeTask } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false, reason: 'no-profile' });
  const b = await req.json().catch(() => null);
  const taskId = b?.taskId as string | undefined;
  if (!taskId) return NextResponse.json({ ok: false, reason: 'no-task' });
  const res = await completeHomeTask(id, taskId);
  return NextResponse.json(res);
}
