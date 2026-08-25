import { NextResponse } from 'next/server';
import { getDailyLesson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lesson = await getDailyLesson();
  return NextResponse.json({ lesson });
}
