import { NextResponse } from 'next/server';
import { getOwnedItemValues } from '@/lib/db';
import { selectedChildId } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** Values (accessory_id / hairstyle_id) this child owns — gates the editor. */
export async function GET() {
  const id = selectedChildId();
  if (!id) return NextResponse.json({ owned: [] });
  const owned = await getOwnedItemValues(id);
  return NextResponse.json({ owned });
}
