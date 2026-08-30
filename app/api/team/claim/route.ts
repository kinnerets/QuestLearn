import { NextResponse } from 'next/server';
import { claimTeamReward } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = await claimTeamReward();
  return NextResponse.json(res);
}
