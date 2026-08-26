import { parentUnlocked } from '@/lib/session';
import { getChildren } from '@/lib/db';
import { ParentGate } from './ParentGate';
import { ParentDashboard } from './ParentDashboard';

export const dynamic = 'force-dynamic';

export default async function ParentPage() {
  if (!parentUnlocked()) return <ParentGate />;
  const children = await getChildren();
  return <ParentDashboard kids={children ?? []} />;
}
