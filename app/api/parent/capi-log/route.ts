import { NextResponse } from 'next/server';
import { getCapiChats } from '@/lib/db';
import { parentUnlocked } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!parentUnlocked()) return NextResponse.json({ ok: false, chats: [] });
  const childId = new URL(request.url).searchParams.get('childId') ?? undefined;
  const chats = await getCapiChats(childId);
  return NextResponse.json({ ok: true, chats: chats ?? [] });
}
