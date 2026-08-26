import { NextResponse } from 'next/server';
import { saveAvatar } from '@/lib/db';
import { selectedChildId } from '@/lib/session';
import type { AvatarConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ ok: false, reason: 'no-profile' });
  const body = await req.json().catch(() => null);
  const config = body?.config as AvatarConfig | undefined;
  if (!config) return NextResponse.json({ ok: false, reason: 'no-config' });
  const ok = await saveAvatar(id, config);
  return NextResponse.json({ ok });
}
