import { parentUnlocked } from '@/lib/session';
import { getChildren, getChildReport } from '@/lib/db';
import { ParentGate } from './ParentGate';
import { ParentDashboard } from './ParentDashboard';

export const dynamic = 'force-dynamic';

export default async function ParentPage() {
  if (!parentUnlocked()) return <ParentGate />;
  const children = await getChildren();
  const reports = children
    ? await Promise.all(children.map((c) => getChildReport(c.id)))
    : [];
  const kids = (children ?? []).map((c, i) => ({ ...c, report: reports[i] ?? null }));
  return <ParentDashboard kids={kids} />;
}
