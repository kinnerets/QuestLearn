import { getSupabase } from './supabaseClient';
import { sm2, qualityFrom, updateMastery } from './composer';
import { SUBJECT_LABEL, SUBJECT_KIND } from './constants';
import type { AvatarConfig, StationKind, Subject } from './types';

export interface AttemptInput {
  questionId: string;
  topicId: string;
  isCorrect: boolean;
  misconception?: string | null;
  hintsUsed?: number;
  chosenAnswer?: unknown;
}

export interface ChildProfile {
  id: string;
  name: string;
  grade: string | null;
  coins: number;
  streak: number;
  avatar: AvatarConfig;
  goalMinutes: number;
}

export interface DbAcademicStation {
  kind: 'core' | 'lang' | 'future';
  subject: string;
  topicId: string;
  questionId: string;
  title: string;
  subtitle: string;
  minutes: number;
  tag: string;
  stem: string;
  hint: string;
  choices: { id: string; text: string; misconception?: string }[];
  correctId: string;
  coins: number;
}

export interface DbLeadStation {
  kind: 'lead';
  subject: string;
  topicId: string;
  title: string;
  subtitle: string;
  minutes: number;
  prompt: string;
  note: string;
  choices: { id: string; label: string; icon: 'star' | 'home' | 'ear' }[];
}

export type DbStation = DbAcademicStation | DbLeadStation;

// The daily journey has 4 slots. Each slot rotates day-to-day through its
// candidate subjects (whichever have content), so the mix changes and breadth
// is covered across the week. Leadership is always the 4th micro-station.
const DAILY_SLOTS: { kind: StationKind; subjects: Subject[] }[] = [
  { kind: 'core', subjects: ['math', 'geometry', 'hebrew', 'bible'] },
  { kind: 'lang', subjects: ['arabic', 'english'] },
  { kind: 'future', subjects: ['future_skills', 'science', 'geography'] },
  { kind: 'lead', subjects: ['leadership'] },
];

interface TopicRow { id: string; subject: string; sub_topic: string; grade: string }
interface QRow { id: string; topic_id: string; type: string; difficulty: number; payload: Record<string, unknown> }

/** Days since the year start — stable within a day, changes daily. */
function daySeed(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

/** Fetch every topic + question available to a grade (grade-specific + shared). */
async function fetchBank(
  sb: NonNullable<ReturnType<typeof getSupabase>>,
  grade: string,
): Promise<{ topics: TopicRow[]; qByTopic: Map<string, QRow[]> }> {
  const { data: topics } = await sb
    .from('curriculum_topics')
    .select('id,subject,sub_topic,grade')
    .in('grade', [grade, 'enrichment']);
  const list = (topics ?? []) as TopicRow[];
  const qByTopic = new Map<string, QRow[]>();
  if (list.length) {
    const { data: qs } = await sb
      .from('questions_bank')
      .select('id,topic_id,type,difficulty,payload')
      .in('topic_id', list.map((t) => t.id))
      .order('difficulty', { ascending: true })
      .order('id', { ascending: true });
    for (const q of (qs ?? []) as QRow[]) {
      const arr = qByTopic.get(q.topic_id) ?? [];
      arr.push(q);
      qByTopic.set(q.topic_id, arr);
    }
  }
  return { topics: list, qByTopic };
}

function buildStation(kind: StationKind, subject: string, topic: TopicRow, q: QRow): DbStation {
  const p = q.payload;
  const subtitle = SUBJECT_LABEL[subject] ?? '';
  if (kind === 'lead') {
    return {
      kind: 'lead', subject, topicId: topic.id, title: topic.sub_topic, subtitle, minutes: 1,
      prompt: String(p.prompt), note: String(p.note),
      choices: p.choices as DbLeadStation['choices'],
    };
  }
  return {
    kind, subject, topicId: topic.id, questionId: q.id, title: topic.sub_topic, subtitle, minutes: 2,
    tag: String(p.tag ?? ''), stem: String(p.stem), hint: String(p.hint ?? ''),
    choices: p.choices as DbAcademicStation['choices'],
    correctId: String(p.correct_choice_id), coins: Number(p.coins ?? 10),
  };
}

const CHILD_COLUMNS =
  'id,display_name,grade_level,quest_coins,current_streak,avatar_config,daily_goal_minutes';

function toChild(data: Record<string, unknown>): ChildProfile {
  return {
    id: data.id as string,
    name: data.display_name as string,
    grade: (data.grade_level as string) ?? null,
    coins: (data.quest_coins as number) ?? 0,
    streak: (data.current_streak as number) ?? 0,
    avatar: data.avatar_config as AvatarConfig,
    goalMinutes: (data.daily_goal_minutes as number) ?? 15,
  };
}

/** All children in the family, oldest grade last — for the profile picker. */
export async function getChildren(): Promise<ChildProfile[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('users')
      .select(CHILD_COLUMNS)
      .eq('role', 'child')
      .order('grade_level', { ascending: true });
    if (error || !data?.length) return null;
    return data.map(toChild);
  } catch {
    return null;
  }
}

/** A single child by id (from the selected-profile cookie). */
export async function getChildProfileById(id: string): Promise<ChildProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('users')
      .select(CHILD_COLUMNS)
      .eq('id', id)
      .eq('role', 'child')
      .maybeSingle();
    if (error || !data) return null;
    return toChild(data);
  } catch {
    return null;
  }
}

/** First child — fallback when no profile has been selected yet. */
export async function getChildProfile(): Promise<ChildProfile | null> {
  const all = await getChildren();
  return all?.[0] ?? null;
}

export interface SubjectMastery {
  subject: string;
  subTopic: string;
  mastery: number;   // 0..1
  attempts: number;
}

export interface ChildReport {
  activeDays: number;   // distinct days with activity, last 7 days
  answered: number;     // questions answered, last 7 days
  correct: number;
  accuracy: number;     // 0..1
  subjects: SubjectMastery[];
  misconceptions: string[];
}

/** Weekly parent report for one child, aggregated from attempts + mastery. */
export async function getChildReport(childId: string): Promise<ChildReport | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const { data: attempts } = await sb
      .from('attempts_log')
      .select('is_correct,created_at')
      .eq('user_id', childId)
      .gte('created_at', since);
    const answered = attempts?.length ?? 0;
    const correct = attempts?.filter((a) => a.is_correct).length ?? 0;
    const activeDays = new Set((attempts ?? []).map((a) => String(a.created_at).slice(0, 10))).size;

    const { data: mastery } = await sb
      .from('user_mastery')
      .select('topic_id,mastery_score,attempts_count,misconception_tags')
      .eq('user_id', childId);

    let subjects: SubjectMastery[] = [];
    const misc = new Set<string>();
    if (mastery?.length) {
      const ids = mastery.map((m) => m.topic_id);
      const { data: topics } = await sb
        .from('curriculum_topics')
        .select('id,subject,sub_topic')
        .in('id', ids);
      const byId = new Map((topics ?? []).map((t) => [t.id, t]));
      subjects = mastery
        .map((m) => {
          const t = byId.get(m.topic_id);
          (m.misconception_tags ?? []).forEach((x: string) => misc.add(x));
          return {
            subject: (t?.subject as string) ?? '',
            subTopic: (t?.sub_topic as string) ?? '',
            mastery: Number(m.mastery_score),
            attempts: Number(m.attempts_count),
          };
        })
        .sort((a, b) => a.mastery - b.mastery);
    }

    return {
      activeDays, answered, correct,
      accuracy: answered ? correct / answered : 0,
      subjects, misconceptions: [...misc],
    };
  } catch {
    return null;
  }
}

/** Persist a new avatar for a child. Best-effort. */
export async function saveAvatar(childId: string, config: AvatarConfig): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb
      .from('users')
      .update({ avatar_config: config })
      .eq('id', childId)
      .eq('role', 'child');
    return !error;
  } catch {
    return false;
  }
}

/**
 * Compose the day's journey: 4 slots (core / lang / enrichment / leadership).
 * Each slot rotates day-to-day through its candidate subjects that have
 * content, so the subject mix changes daily and breadth is covered across the
 * week. `round` (1-based) shifts both the subject and the question within a
 * topic, so "עוד מסע" serves fresh, gently harder material.
 */
export async function getDailyLesson(grade = 'grade_3', round = 1): Promise<DbStation[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { topics, qByTopic } = await fetchBank(sb, grade);
    if (!topics.length) return null;
    const seed = daySeed();

    const stations: DbStation[] = [];
    DAILY_SLOTS.forEach((slot, slotIdx) => {
      // Candidate subjects in this slot that actually have a playable topic.
      const candidates = slot.subjects
        .map((subject) => topics.find((t) => t.subject === subject && (qByTopic.get(t.id)?.length ?? 0) > 0))
        .filter((t): t is TopicRow => !!t);
      if (!candidates.length) return;
      const topic = candidates[(seed + slotIdx + round - 1) % candidates.length];
      const qs = qByTopic.get(topic.id)!;
      const q = qs[(round - 1) % qs.length];
      stations.push(buildStation(slot.kind, topic.subject, topic, q));
    });
    return stations.length ? stations : null;
  } catch {
    return null;
  }
}

/** Question ids this child has already answered correctly — never shown again. */
async function solvedQuestionIds(
  sb: NonNullable<ReturnType<typeof getSupabase>>,
  childId: string,
): Promise<Set<string>> {
  try {
    const { data } = await sb
      .from('attempts_log')
      .select('question_id')
      .eq('user_id', childId)
      .eq('is_correct', true);
    return new Set((data ?? []).map((r) => r.question_id as string));
  } catch {
    return new Set();
  }
}

/** Session length by grade — older kids get longer sessions. */
function focusLength(grade: string): number {
  return grade === 'grade_5' ? 6 : 4;
}

/**
 * A focused single-subject session. Serves only questions the child has NOT
 * already solved, length scaled by grade. Returns [] when the subject is fully
 * solved (caller shows a "completed" screen), null on error/no content.
 */
export async function composeFocus(
  grade = 'grade_3', subject = 'math', childId?: string,
): Promise<DbStation[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { topics, qByTopic } = await fetchBank(sb, grade);
    const subjectTopics = topics.filter((t) => t.subject === subject);
    if (!subjectTopics.length) return null;
    const kind = SUBJECT_KIND[subject] ?? 'core';
    const solved = childId ? await solvedQuestionIds(sb, childId) : new Set<string>();

    const pool: { topic: TopicRow; q: QRow }[] = [];
    for (const topic of subjectTopics) {
      for (const q of qByTopic.get(topic.id) ?? []) {
        if (!solved.has(q.id)) pool.push({ topic, q });
      }
    }
    if (!(qByTopic.size)) return null;   // subject has no content at all
    if (!pool.length) return [];         // everything solved

    const stations = pool.slice(0, focusLength(grade)).map(({ topic, q }) => buildStation(kind, subject, topic, q));
    return stations;
  } catch {
    return null;
  }
}

/** Subjects the child has practised today — for the home "completed" marks. */
export async function getTodaySubjects(childId: string): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const since = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
    const { data } = await sb
      .from('attempts_log')
      .select('topic_id,created_at')
      .eq('user_id', childId)
      .gte('created_at', since);
    if (!data?.length) return [];
    const topicIds = [...new Set(data.map((r) => r.topic_id as string))];
    const { data: topics } = await sb
      .from('curriculum_topics')
      .select('id,subject')
      .in('id', topicIds);
    return [...new Set((topics ?? []).map((t) => t.subject as string))];
  } catch {
    return [];
  }
}

export interface SubjectCard {
  subject: string;
  label: string;
  kind: StationKind;
  accuracy: number;   // 0..1, correct answers / total answers (review success)
  answered: number;   // total answers given in this subject
  solved: number;     // distinct questions answered correctly
  total: number;      // questions available in the bank
}

/** The subject map: every subject with content, plus this child's mastery. */
export async function getSubjectCatalog(grade: string, childId: string): Promise<SubjectCard[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { topics, qByTopic } = await fetchBank(sb, grade);
    const bySubject = new Map<string, { topicIds: string[]; count: number }>();
    for (const t of topics) {
      const n = qByTopic.get(t.id)?.length ?? 0;
      if (!n) continue;
      const e = bySubject.get(t.subject) ?? { topicIds: [], count: 0 };
      e.topicIds.push(t.id);
      e.count += n;
      bySubject.set(t.subject, e);
    }
    if (!bySubject.size) return null;

    // Accuracy per subject from the attempts log (correct vs total answers).
    const topicToSubject = new Map(topics.map((t) => [t.id, t.subject]));
    const { data: attempts } = await sb
      .from('attempts_log')
      .select('topic_id,question_id,is_correct')
      .eq('user_id', childId);
    const tally = new Map<string, { answered: number; correct: number; solved: Set<string> }>();
    for (const a of attempts ?? []) {
      const subject = topicToSubject.get(a.topic_id as string);
      if (!subject) continue;
      const e = tally.get(subject) ?? { answered: 0, correct: 0, solved: new Set<string>() };
      e.answered += 1;
      if (a.is_correct) { e.correct += 1; e.solved.add(a.question_id as string); }
      tally.set(subject, e);
    }

    const order = ['math', 'geometry', 'hebrew', 'bible', 'arabic', 'english', 'science', 'geography', 'future_skills', 'leadership'];
    const cards: SubjectCard[] = [];
    for (const subject of order) {
      const e = bySubject.get(subject);
      if (!e) continue;
      const t = tally.get(subject);
      const answered = t?.answered ?? 0;
      const correct = t?.correct ?? 0;
      cards.push({
        subject, label: SUBJECT_LABEL[subject] ?? subject,
        kind: SUBJECT_KIND[subject] ?? 'core',
        accuracy: answered ? Number((correct / answered).toFixed(2)) : 0,
        answered, solved: t?.solved.size ?? 0, total: e.count,
      });
    }
    return cards;
  } catch {
    return null;
  }
}

/** Daily coin ceiling — anti-gaming, so extra quests can't farm unlimited coins. */
export const DAILY_COIN_CAP = 60;

/**
 * Persist a completed quest round. Idempotent for the day: streak advances only
 * on the first completion, and coins are capped so extra rounds hit diminishing
 * returns then stop earning. Returns the coins actually granted after the cap.
 */
export async function completeQuest(coinsEarned: number, childId?: string): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  try {
    const child = childId ? await getChildProfileById(childId) : await getChildProfile();
    if (!child) return 0;
    const today = new Date().toISOString().slice(0, 10);

    const { data: row } = await sb
      .from('daily_progress')
      .select('quest_completed,coins_awarded_today')
      .eq('user_id', child.id).eq('date', today)
      .maybeSingle();

    const alreadyAwarded = row?.coins_awarded_today ?? 0;
    const firstToday = !row?.quest_completed;
    const grant = Math.max(0, Math.min(coinsEarned, DAILY_COIN_CAP - alreadyAwarded));

    await sb.from('users').update({
      quest_coins: child.coins + grant,
      current_streak: firstToday ? child.streak + 1 : child.streak,
    }).eq('id', child.id);

    await sb.from('daily_progress').upsert({
      user_id: child.id, date: today, stations_completed: 4,
      quest_completed: true, coins_awarded_today: alreadyAwarded + grant,
    });
    return grant;
  } catch {
    return 0;
  }
}

/**
 * Log one answer and advance the child's mastery for that topic (SM-2).
 * This is what makes the Composer adaptive over time. Best-effort.
 */
export async function logAttempt(childId: string, a: AttemptInput): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const hints = a.hintsUsed ?? 0;
    await sb.from('attempts_log').insert({
      user_id: childId,
      question_id: a.questionId,
      topic_id: a.topicId,
      is_correct: a.isCorrect,
      chosen_answer: a.chosenAnswer ?? null,
      misconception_tag: a.misconception ?? null,
      hints_used: hints,
    });

    const { data: m } = await sb
      .from('user_mastery')
      .select('mastery_score,attempts_count,ease_factor,interval_days,misconception_tags')
      .eq('user_id', childId).eq('topic_id', a.topicId)
      .maybeSingle();

    const quality = qualityFrom(a.isCorrect, hints);
    const next = sm2(
      { ease: Number(m?.ease_factor ?? 2.5), interval: Number(m?.interval_days ?? 0) },
      quality,
    );
    const mastery = updateMastery(Number(m?.mastery_score ?? 0), a.isCorrect);

    // Track misconception tags on wrong answers (unique-ish, capped).
    const tags: string[] = Array.isArray(m?.misconception_tags) ? [...m!.misconception_tags] : [];
    if (!a.isCorrect && a.misconception && !tags.includes(a.misconception)) {
      tags.push(a.misconception);
    }

    await sb.from('user_mastery').upsert({
      user_id: childId,
      topic_id: a.topicId,
      mastery_score: mastery,
      attempts_count: Number(m?.attempts_count ?? 0) + 1,
      last_attempt: new Date().toISOString(),
      next_review_at: next.nextReviewAt,
      ease_factor: next.ease,
      interval_days: next.interval,
      misconception_tags: tags.slice(-8),
    });
    return true;
  } catch {
    return false;
  }
}

export interface Reward {
  id: string;
  title: string;
  category: string;
  cost: number;
}

/** Active family rewards, cheapest first. */
export async function getRewards(): Promise<Reward[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from('reward_store')
      .select('id,title,category,cost_coins')
      .eq('is_active', true)
      .order('cost_coins', { ascending: true });
    if (!data) return null;
    return data.map((r) => ({ id: r.id, title: r.title, category: r.category, cost: r.cost_coins }));
  } catch {
    return null;
  }
}

export interface RedeemResult {
  ok: boolean;
  reason?: string;
  voucher?: string;
  coins?: number;
}

/** Redeem a reward: deduct coins and issue a voucher (zero parent friction). */
export async function redeemReward(childId: string, rewardId: string): Promise<RedeemResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, reason: 'no-db' };
  try {
    const child = await getChildProfileById(childId);
    if (!child) return { ok: false, reason: 'no-child' };
    const { data: reward } = await sb
      .from('reward_store')
      .select('id,cost_coins,title')
      .eq('id', rewardId)
      .maybeSingle();
    if (!reward) return { ok: false, reason: 'no-reward' };
    if (child.coins < reward.cost_coins) return { ok: false, reason: 'not-enough' };

    const voucher = 'QL-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const left = child.coins - reward.cost_coins;
    await sb.from('users').update({ quest_coins: left }).eq('id', child.id);
    await sb.from('reward_redemptions').insert({
      reward_id: reward.id, child_id: child.id,
      coins_spent: reward.cost_coins, voucher_code: voucher, status: 'issued',
    });
    return { ok: true, voucher, coins: left };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
