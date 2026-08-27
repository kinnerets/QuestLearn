import { NextResponse } from 'next/server';
import { ensureBufferForSubject } from '@/lib/generator';
import { getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // generation can take a few seconds

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false });
  const b = await req.json().catch(() => null);
  const subject = b?.subject;
  if (!subject) return NextResponse.json({ ok: false });
  const child = await getChildProfileById(id);
  if (!child) return NextResponse.json({ ok: false });
  const generated = await ensureBufferForSubject(id, child.grade ?? 'grade_3', String(subject));
  return NextResponse.json({ ok: true, generated });
}
