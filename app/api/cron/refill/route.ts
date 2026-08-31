import { NextResponse } from 'next/server';
import { ensureGlobalBuffer } from '@/lib/generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // several sequential generations

/**
 * Nightly background top-up (Vercel Cron). Keeps every topic's bank healthy so
 * parents never manage content. Protected by CRON_SECRET when set; Vercel's own
 * cron requests carry an Authorization: Bearer <CRON_SECRET> header automatically.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
    }
  }
  // Fill up to 10 of the thinnest topics per night (each ~generate+verify). Keeps
  // the growing catalogue filling within a few nights while staying in the budget.
  const result = await ensureGlobalBuffer(10);
  return NextResponse.json({ ok: true, ...result });
}
