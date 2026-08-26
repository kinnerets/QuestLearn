import { NextResponse } from 'next/server';
import { getChildren } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const children = await getChildren();
  return NextResponse.json({ children: children ?? [] });
}
