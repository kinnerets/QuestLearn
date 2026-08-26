import { NextResponse } from 'next/server';
import { PARENT_COOKIE, parentPin } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body?.pin ?? '');
  if (pin.length && pin === parentPin()) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(PARENT_COOKIE, '1', {
      httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8,
    });
    return res;
  }
  return NextResponse.json({ ok: false });
}
