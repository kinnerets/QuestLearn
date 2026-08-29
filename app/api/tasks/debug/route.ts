import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

/** Temporary diagnostic: shows exactly what the server sees for home_tasks. */
export async function GET() {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, reason: 'no-supabase-client' });
  const { data, error, count } = await sb
    .from('home_tasks')
    .select('id,title,coins,active', { count: 'exact' });
  return NextResponse.json({
    ok: !error,
    count: count ?? (data?.length ?? 0),
    rows: data ?? [],
    error: error ? { message: error.message, code: (error as { code?: string }).code, details: (error as { details?: string }).details, hint: (error as { hint?: string }).hint } : null,
    usingServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
