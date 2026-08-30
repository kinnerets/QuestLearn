import { NextResponse } from 'next/server';
import { askCapi, type CapiTurn } from '@/lib/capi';
import { getChildProfileById, logCapiChat } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const id = selectedChildId();
  const child = id ? await getChildProfileById(id) : null;
  const b = await req.json().catch(() => null);
  const message = String(b?.message ?? '').trim();
  if (!message) return NextResponse.json({ ok: false, reply: 'כתבי לי שאלה ואשמח לעזור.' });
  const history: CapiTurn[] = Array.isArray(b?.history)
    ? (b.history as unknown[]).slice(-6).map((t) => {
        const o = t as { role?: string; text?: string };
        return { role: o.role === 'assistant' ? 'assistant' : 'user', text: String(o.text ?? '') };
      })
    : [];
  const res = await askCapi(child?.name ?? '', child?.grade ?? 'grade_3', message, history);
  // Log the exchange so a parent can review it later (best-effort).
  if (id && res.ok) { void logCapiChat(id, message, res.reply); }
  return NextResponse.json(res);
}
