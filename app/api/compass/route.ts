import { NextResponse } from 'next/server';
import { getCompassWorlds } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = selectedChildId();
  const worlds = id ? await getCompassWorlds(id) : null;
  return NextResponse.json({ worlds: worlds ?? [] });
}
