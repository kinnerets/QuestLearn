import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { STATION_ICON, ChevronIcon, CloseIcon, CheckIcon } from '@/components/icons';
import { getChildren, getSubjectTopics } from '@/lib/db';
import { selectedChildId } from '@/lib/session';
import { SUBJECT_LABEL, SUBJECT_KIND } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function tier(m: number) { return m >= 0.7 ? 'good' : m >= 0.4 ? 'mid' : 'low'; }

export default async function SubjectPage({ params }: { params: { subject: string } }) {
  const subject = params.subject;
  const selectedId = selectedChildId();
  const children = await getChildren();
  if (children && children.length && (!selectedId || !children.some((c) => c.id === selectedId))) {
    redirect('/profiles');
  }
  const child = children?.find((c) => c.id === selectedId) ?? children?.[0] ?? null;
  const data = child ? await getSubjectTopics(child.grade ?? 'grade_3', subject, child.id) : null;

  const label = SUBJECT_LABEL[subject] ?? subject;
  const kind = SUBJECT_KIND[subject] ?? 'core';
  const Icon = STATION_ICON[kind];
  const topics = data?.topics ?? [];

  return (
    <main className="app-shell">
      <div className="ex-bar">
        <Link href="/map" className="ex-back" aria-label="חזרה"><CloseIcon /></Link>
        <div className="ex-head-title">{label}</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="screen-body subject-page">
        <div className="subject-hero">
          <span className={`subject-ico ico-${kind}`}><Icon /></span>
          <div>
            <h1>{label}</h1>
            <p>{topics.length} תת-נושאים</p>
          </div>
        </div>

        {topics.length > 0 && (
          <Link href={`/exercise?focus=${subject}&from=map`} className="cta subject-all">תרגול מעורב בכל הנושא</Link>
        )}

        <div className="topic-list">
          {topics.map((t) => {
            const done = t.total > 0 && t.solved >= t.total;
            return (
              <Link key={t.id} href={`/exercise?focus=${subject}&topic=${t.id}&from=map`} className={`topic-card${done ? ' done' : ''}`}>
                <span className="topic-main">
                  <span className="topic-name">{t.subTopic}</span>
                  <span className="topic-bar"><i className={tier(t.accuracy)} style={{ width: `${Math.round(t.accuracy * 100)}%` }} /></span>
                  <span className="topic-meta">
                    {t.answered > 0
                      ? `${Math.round(t.accuracy * 100)}% הצלחה · פתרת ${t.solved}/${t.total}`
                      : `${t.total} שאלות · טרם התחלת`}
                  </span>
                </span>
                {done ? <span className="topic-done"><CheckIcon /></span> : <span className="subject-go"><ChevronIcon /></span>}
              </Link>
            );
          })}
          {topics.length === 0 && <div className="parent-empty">אין עדיין תוכן בנושא הזה.</div>}
        </div>
      </div>

      <BottomNav active="/map" />
    </main>
  );
}
