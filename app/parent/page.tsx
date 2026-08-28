import { parentUnlocked } from '@/lib/session';
import { getChildren, getChildReport, getTopicsOverview } from '@/lib/db';
import { ParentGate } from './ParentGate';
import { ParentDashboard } from './ParentDashboard';

export const dynamic = 'force-dynamic';

export default async function ParentPage() {
  if (!parentUnlocked()) return <ParentGate />;
  const children = await getChildren();
  const [reports, topics] = await Promise.all([
    children ? Promise.all(children.map((c) => getChildReport(c.id))) : Promise.resolve([]),
    getTopicsOverview(),
  ]);
  const kids = (children ?? []).map((c, i) => ({ ...c, report: reports[i] ?? null }));
  return <ParentDashboard kids={kids} topics={topics ?? []} />;
}
