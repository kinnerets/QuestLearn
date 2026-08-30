import { NextResponse } from 'next/server';
import { listHomeTasks, addHomeTask, removeHomeTask, updateHomeTask } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, tasks: [] });
  const tasks = await listHomeTasks();
  return NextResponse.json({ ok: true, tasks: tasks ?? [] });
}

export async function POST(req: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, reason: 'locked' });
  const b = await req.json().catch(() => null);
  if (b?.action === 'add') {
    const title = String(b?.title ?? '').trim().slice(0, 80);
    const coins = Math.min(50, Math.max(1, Number(b?.coins ?? 5)));
    if (!title) return NextResponse.json({ ok: false, reason: 'no-title' });
    const ok = await addHomeTask(title, coins);
    return NextResponse.json({ ok });
  }
  if (b?.action === 'update' && b?.id) {
    const patch: { title?: string; coins?: number } = {};
    if (typeof b?.title === 'string') patch.title = b.title.trim().slice(0, 80);
    if (b?.coins != null) patch.coins = Math.min(50, Math.max(1, Number(b.coins)));
    const ok = await updateHomeTask(String(b.id), patch);
    return NextResponse.json({ ok });
  }
  if (b?.action === 'remove' && b?.id) {
    const ok = await removeHomeTask(String(b.id));
    return NextResponse.json({ ok });
  }
  return NextResponse.json({ ok: false, reason: 'bad-action' });
}
