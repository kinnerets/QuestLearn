import { NextResponse } from 'next/server';
import { getAvatarShop } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** Purchasable avatar items (value + cost + ownership) for the current child. */
export async function GET() {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ items: [], coins: 0 });
  const shop = await getAvatarShop(id);
  return NextResponse.json(shop ?? { items: [], coins: 0 });
}
