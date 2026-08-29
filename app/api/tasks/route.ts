import { NextResponse } from 'next/server';
import { getHomeTasks } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ tasks: [] });
  const tasks = await getHomeTasks(id);
  return NextResponse.json({ tasks: tasks ?? [] });
}
