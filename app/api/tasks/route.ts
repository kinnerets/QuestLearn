import { NextResponse } from 'next/server';
import { getHomeTasks } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = selectedChildId();
  // Still list tasks even if no profile is selected (doneToday will be false).
  const tasks = await getHomeTasks(id ?? undefined);
  return NextResponse.json({ tasks: tasks ?? [] });
}
