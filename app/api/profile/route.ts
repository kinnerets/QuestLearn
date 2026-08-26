import { NextResponse } from 'next/server';
import { getChildProfileById } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = selectedChildId();
  const child = id ? await getChildProfileById(id) : null;
  return NextResponse.json({ child });
}
