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
  xp: number;
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
  difficulty: number;
  tag: string;
  stem: string;
  hint: string;
  hint2?: string;
  explanation?: string;
  choices: { id: string; text: string; misconception?: string }[];
  correctId: string;
  coins: number;
}

export interface DbLeadStation {
  kind: 'lead';
  subject: string;
  topicId: string;
  questionId: string;
  order: number;
  title: string;
  subtitle: string;
  minutes: number;
  prompt: string;
  note: string;
  choices: { id: string; label: string; icon: 'star' | 'home' | 'ear' }[];
}

export type DbStation = DbAcademicStation | DbLeadStation;

// The daily journey rotates day-to-day through each slot's candidate subjects
// (whichever have content), so the mix changes and breadth is covered across
// the week. Leadership is NOT here — it lives in its own reflective area
// ("אי המצפן", /compass), which is not scored by accuracy.
const DAILY_SLOTS: { kind: StationKind; subjects: Subject[] }[] = [
  { kind: 'core', subjects: ['math', 'geometry', 'hebrew', 'bible'] },
  { kind: 'lang', subjects: ['arabic', 'english'] },
  { kind: 'future', subjects: ['future_skills', 'science', 'geography'] },
];

// Leadership topic ids are excluded from academic accuracy/catalog.
const LEADERSHIP_SUBJECT = 'leadership';

interface TopicRow { id: string; subject: string; sub_topic: string; grade: string; order_index?: number }
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
    .select('id,subject,sub_topic,grade,order_index')
    .in('grade', [grade, 'enrichment']);
  const list = (topics ?? []) as TopicRow[];
  const qByTopic = new Map<string, QRow[]>();
  if (list.length) {
    const { data: qs } = await sb
      .from('questions_bank')
      .select('id,topic_id,type,difficulty,payload')
      .in('topic_id', list.map((t) => t.id))
      .neq('verification_status', 'auto_flagged')   // hide questions flagged for parent review
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
      kind: 'lead', subject, topicId: topic.id, questionId: q.id, order: Number(topic.order_index ?? 0),
      title: topic.sub_topic, subtitle, minutes: 1,
      prompt: String(p.prompt), note: String(p.note),
      choices: (p.options ?? p.choices) as DbLeadStation['choices'],
    };
  }
  const hints = Array.isArray(p.hints) ? (p.hints as string[]) : [];
  // Shuffle answer order so the correct choice isn't always first (content is
  // authored with the right answer as "a"); ids stay intact for grading.
  const choices = shuffle((p.choices as DbAcademicStation['choices']) ?? []);
  return {
    kind, subject, topicId: topic.id, questionId: q.id, title: topic.sub_topic, subtitle, minutes: 2,
    difficulty: Number(q.difficulty ?? 1),
    tag: String(p.tag ?? ''), stem: String(p.stem),
    hint: String(p.hint ?? hints[0] ?? ''),
    hint2: p.hint2 ? String(p.hint2) : hints[1],
    explanation: p.explanation ? String(p.explanation) : undefined,
    choices,
    correctId: String(p.correct_choice_id), coins: Number(p.coins ?? 10),
  };
}

/** Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CHILD_COLUMNS =
  'id,display_name,grade_level,quest_coins,current_streak,total_xp,avatar_config,daily_goal_minutes';

function toChild(data: Record<string, unknown>): ChildProfile {
  return {
    id: data.id as string,
    name: data.display_name as string,
    grade: (data.grade_level as string) ?? null,
    coins: (data.quest_coins as number) ?? 0,
    streak: (data.current_streak as number) ?? 0,
    xp: (data.total_xp as number) ?? 0,
    avatar: data.avatar_config as AvatarConfig,
    goalMinutes: (data.daily_goal_minutes as number) ?? 15,
  };
}

/**
 * XP → level with a gentle increasing curve: early levels come fast (motivating),
 * later ones cost more so a "level" stays meaningful over weeks. Level L→L+1 needs
 * 100 + (L-1)·40 points. (A perfect day is ~150–185 pts → a level early on, slowing
 * to a level every few days later.)
 */
export const XP_PER_LEVEL = 120; // legacy constant, no longer the level size
const LEVEL_BASE = 100, LEVEL_STEP = 40;
function xpToNext(level: number): number { return LEVEL_BASE + (level - 1) * LEVEL_STEP; }
/** Cumulative points needed to REACH a given level. */
export function xpForLevel(level: number): number {
  let sum = 0;
  for (let l = 1; l < level; l++) sum += xpToNext(l);
  return sum;
}
export function levelFromXp(xp: number) {
  let level = 1, remaining = Math.max(0, xp), need = xpToNext(1);
  while (remaining >= need) { remaining -= need; level += 1; need = xpToNext(level); }
  return { level, inLevel: remaining, need };
}

/** Add XP to a child (best-effort read-modify-write). */
export async function addXp(childId: string, amount: number): Promise<void> {
  if (amount <= 0) return;
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data } = await sb.from('users').select('total_xp').eq('id', childId).maybeSingle();
    const cur = Number(data?.total_xp ?? 0);
    await sb.from('users').update({ total_xp: cur + amount }).eq('id', childId);
  } catch { /* best effort */ }
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
    // Leadership "deposits" aren't graded — keep them out of academic accuracy.
    const { data: leadTopics } = await sb
      .from('curriculum_topics').select('id').eq('subject', LEADERSHIP_SUBJECT);
    const leadIds = new Set((leadTopics ?? []).map((t) => t.id as string));

    const { data: attempts } = await sb
      .from('attempts_log')
      .select('is_correct,created_at,topic_id')
      .eq('user_id', childId)
      .gte('created_at', since);
    const graded = (attempts ?? []).filter((a) => !leadIds.has(a.topic_id as string));
    const answered = graded.length;
    const correct = graded.filter((a) => a.is_correct).length;
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
// ─────────────────────────── Avatar shop ───────────────────────────
export interface AvatarItem {
  id: string;
  slot: string;          // 'accessory' | 'hairstyle' | ...
  value: string;         // config value this item unlocks (accessory_id / hairstyle_id)
  label: string;
  emoji: string;
  cost: number;
  owned: boolean;
}
export interface AvatarShop { items: AvatarItem[]; coins: number }

function mapAvatarLayer(row: { id: string; slot: string; svg_layer: unknown; cost_coins: number | null }, owned: Set<string>): AvatarItem {
  const layer = (row.svg_layer ?? {}) as { value?: string; label?: string; emoji?: string };
  return {
    id: row.id,
    slot: row.slot,
    value: layer.value ?? '',
    label: layer.label ?? row.slot,
    emoji: layer.emoji ?? '✨',
    cost: row.cost_coins ?? 0,
    owned: owned.has(row.id),
  };
}

/** Purchasable avatar items (unlock_type='coins') with this child's ownership. */
export async function getAvatarShop(childId: string): Promise<AvatarShop | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const [{ data: items }, { data: owned }, child] = await Promise.all([
      sb.from('avatar_items').select('id,slot,svg_layer,cost_coins').eq('unlock_type', 'coins').order('cost_coins', { ascending: true }),
      sb.from('user_avatar_items').select('item_id').eq('user_id', childId),
      getChildProfileById(childId),
    ]);
    if (!items) return null;
    const ownedSet = new Set((owned ?? []).map((r) => r.item_id as string));
    return {
      items: items.map((r) => mapAvatarLayer(r, ownedSet)),
      coins: child?.coins ?? 0,
    };
  } catch {
    return null;
  }
}

/** The set of premium item *values* this child owns (for gating the editor). */
export async function getOwnedItemValues(childId: string): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from('user_avatar_items')
      .select('avatar_items(svg_layer)')
      .eq('user_id', childId);
    if (!data) return [];
    return data
      .map((r) => {
        const it = (r as { avatar_items?: { svg_layer?: { value?: string } } }).avatar_items;
        return it?.svg_layer?.value ?? null;
      })
      .filter((v): v is string => !!v);
  } catch {
    return [];
  }
}

export interface BuyResult { ok: boolean; reason?: string; coins?: number }

/** Buy an avatar item: verify affordability + not already owned, deduct coins. */
export async function buyAvatarItem(childId: string, itemId: string): Promise<BuyResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, reason: 'no-db' };
  try {
    const child = await getChildProfileById(childId);
    if (!child) return { ok: false, reason: 'no-child' };
    const { data: item } = await sb
      .from('avatar_items')
      .select('id,cost_coins,unlock_type')
      .eq('id', itemId)
      .maybeSingle();
    if (!item || item.unlock_type !== 'coins') return { ok: false, reason: 'no-item' };

    const { data: already } = await sb
      .from('user_avatar_items')
      .select('item_id')
      .eq('user_id', child.id).eq('item_id', itemId)
      .limit(1);
    if (already?.length) return { ok: false, reason: 'owned' };

    const cost = item.cost_coins ?? 0;
    if (child.coins < cost) return { ok: false, reason: 'not-enough' };

    const left = child.coins - cost;
    await sb.from('users').update({ quest_coins: left }).eq('id', child.id);
    const { error } = await sb.from('user_avatar_items').insert({ user_id: child.id, item_id: itemId });
    if (error) {
      // roll the coins back if the ownership row failed to persist
      await sb.from('users').update({ quest_coins: child.coins }).eq('id', child.id);
      return { ok: false, reason: 'insert-failed' };
    }
    return { ok: true, coins: left };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

// ── Weighted Composer signals ──
interface MasterySig { mastery: number; overdueDays: number; misconceptions: number }

/** Per-topic mastery signals for this child (SM-2 + misconceptions). */
async function loadMasterySignals(
  sb: NonNullable<ReturnType<typeof getSupabase>>, childId: string, topicIds: string[],
): Promise<Map<string, MasterySig>> {
  const map = new Map<string, MasterySig>();
  try {
    const { data } = await sb
      .from('user_mastery')
      .select('topic_id,mastery_score,next_review_at,misconception_tags')
      .eq('user_id', childId).in('topic_id', topicIds);
    const now = Date.now();
    for (const r of data ?? []) {
      const overdue = r.next_review_at ? (now - new Date(r.next_review_at as string).getTime()) / 86_400_000 : 0;
      map.set(r.topic_id as string, {
        mastery: Number(r.mastery_score ?? 0),
        overdueDays: overdue,
        misconceptions: Array.isArray(r.misconception_tags) ? (r.misconception_tags as unknown[]).length : 0,
      });
    }
  } catch { /* signals are best-effort */ }
  return map;
}

/**
 * Priority score for a topic: weak mastery, due reviews, and lingering
 * misconceptions all raise it. A small day-stable jitter breaks ties so the mix
 * still rotates. (interest_match / parent_directive weights = 0 until built.)
 */
function topicPriority(sig: MasterySig | undefined, jitter: number): number {
  const gap = 1 - (sig?.mastery ?? 0);                                   // weak → high (0..1)
  const review = sig ? Math.max(0, Math.min(1, sig.overdueDays / 3)) : 0; // overdue up to 3d → 0..1
  const misc = sig ? Math.min(0.4, sig.misconceptions * 0.2) : 0;        // repeated misconceptions
  return 0.5 * gap + 0.35 * review + misc + jitter;
}

export async function getDailyLesson(grade = 'grade_3', childId?: string, round = 1): Promise<DbStation[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { topics, qByTopic } = await fetchBank(sb, grade);
    if (!topics.length) return null;
    const seed = daySeed();

    // This child's mastery/review signals drive the weighted pick (Composer).
    const sigs = childId ? await loadMasterySignals(sb, childId, topics.map((t) => t.id)) : new Map<string, MasterySig>();
    const solved = childId ? await solvedQuestionIds(sb, childId) : new Set<string>();
    const jitterFor = (id: string) => ((seed + Number('0x' + id.slice(0, 6))) % 100) / 1000; // 0..0.099, day-stable

    const stations: DbStation[] = [];
    DAILY_SLOTS.forEach((slot) => {
      // Candidate topics in this slot that have playable content.
      const candidates = slot.subjects
        .map((subject) => topics.find((t) => t.subject === subject && (qByTopic.get(t.id)?.length ?? 0) > 0))
        .filter((t): t is TopicRow => !!t);
      if (!candidates.length) return;
      // Pick the highest-priority topic for THIS child (weak/overdue/misconception first).
      const topic = candidates
        .map((t) => ({ t, score: topicPriority(sigs.get(t.id), jitterFor(t.id)) }))
        .sort((a, b) => b.score - a.score)[0].t;
      const qs = qByTopic.get(topic.id)!;
      // Prefer a question the child hasn't solved yet; else rotate by day.
      const q = qs.find((x) => !solved.has(x.id)) ?? qs[(seed + round - 1) % qs.length];
      stations.push(buildStation(slot.kind, topic.subject, topic, q));
    });

    // One daily leadership mission — part of the day's requirement but reflective
    // (never scored on accuracy). Rotates through the worlds day to day.
    const leadTopics = topics
      .filter((t) => t.subject === LEADERSHIP_SUBJECT && (qByTopic.get(t.id)?.length ?? 0) > 0)
      .sort((a, b) => a.id.localeCompare(b.id));
    if (leadTopics.length) {
      const lt = leadTopics[(seed + round - 1) % leadTopics.length];
      const lq = qByTopic.get(lt.id)![0];
      stations.push(buildStation('lead', LEADERSHIP_SUBJECT, lt, lq));
    }

    return stations.length ? stations : null;
  } catch {
    return null;
  }
}

export interface NextDaily { subject: string; label: string; topicId?: string; order?: number }

/** The next unfinished topic in today's journey — for chaining sessions. */
export async function getNextDaily(childId: string, grade: string): Promise<{ next: NextDaily | null; done: boolean }> {
  const [lesson, doneSubjects] = await Promise.all([getDailyLesson(grade, childId), getTodaySubjects(childId)]);
  if (!lesson?.length) return { next: null, done: true };
  const doneSet = new Set(doneSubjects);
  for (const s of lesson) {
    if (!doneSet.has(s.subject)) {
      return {
        next: {
          subject: s.subject,
          label: SUBJECT_LABEL[s.subject] ?? s.subject,
          topicId: s.kind === 'lead' ? s.topicId : undefined,
          order: s.kind === 'lead' ? s.order : undefined,
        },
        done: false,
      };
    }
  }
  return { next: null, done: true };
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

/** Base session length — short and snappy (5). The bank holds many more for
 *  "עוד תרגול"; we just don't serve them all at once. */
function focusLength(grade: string): number {
  return grade === 'grade_5' ? 6 : 5;
}

/**
 * A focused single-subject session. Serves only questions the child has NOT
 * already solved, length scaled by grade. Returns [] when the subject is fully
 * solved (caller shows a "completed" screen), null on error/no content.
 */
export async function composeFocus(
  grade = 'grade_3', subject = 'math', childId?: string, topicId?: string,
): Promise<DbStation[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { topics, qByTopic } = await fetchBank(sb, grade);
    const subjectTopics = topics.filter((t) => t.subject === subject && (!topicId || t.id === topicId));
    if (!subjectTopics.length) return null;
    const kind = SUBJECT_KIND[subject] ?? 'core';
    const solved = childId ? await solvedQuestionIds(sb, childId) : new Set<string>();

    // Leadership worlds are reflective and repeatable — never filter them as "solved".
    const repeatable = subject === LEADERSHIP_SUBJECT;
    const pool: { topic: TopicRow; q: QRow }[] = [];
    for (const topic of subjectTopics) {
      for (const q of qByTopic.get(topic.id) ?? []) {
        if (repeatable || !solved.has(q.id)) pool.push({ topic, q });
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

/**
 * "מסע ההיכרות" — a short entry quiz spanning difficulties and subjects, used to
 * place a child at the right starting level (so strong kids don't grind easy ones).
 */
export async function getPlacementQuestions(grade = 'grade_3'): Promise<DbStation[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { topics, qByTopic } = await fetchBank(sb, grade);
    // Academic only; one representative question per topic, then spread by difficulty.
    const picks: { topic: TopicRow; q: QRow }[] = [];
    for (const t of topics) {
      if (t.subject === LEADERSHIP_SUBJECT) continue;
      const qs = qByTopic.get(t.id) ?? [];
      if (qs.length) picks.push({ topic: t, q: qs[Math.floor(qs.length / 2)] });
    }
    if (!picks.length) return null;
    picks.sort((a, b) => Number(a.q.difficulty ?? 1) - Number(b.q.difficulty ?? 1));
    // Sample up to 8 evenly across the difficulty range for a real ramp.
    const want = Math.min(8, picks.length);
    const step = picks.length / want;
    const chosen: { topic: TopicRow; q: QRow }[] = [];
    for (let i = 0; i < want; i++) chosen.push(picks[Math.floor(i * step)]);
    return chosen.map(({ topic, q }) => buildStation(SUBJECT_KIND[topic.subject] ?? 'core', topic.subject, topic, q));
  } catch {
    return null;
  }
}

/** Map a placement score to a starting level (1–5). Grade 5 gets a small boost. */
export function placementLevel(correct: number, total: number, grade: string): number {
  const pct = total ? correct / total : 0;
  let lvl = pct >= 0.85 ? 4 : pct >= 0.65 ? 3 : pct >= 0.4 ? 2 : 1;
  if (grade === 'grade_5' && lvl < 5) lvl += 1;
  return Math.min(5, Math.max(1, lvl));
}

/** Seed a child's starting level from placement — only if they haven't started yet. */
export async function setPlacementLevel(childId: string, level: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const child = await getChildProfileById(childId);
    if (!child) return false;
    if (child.xp > 0) return true; // already placed or practising — never overwrite
    const xp = Math.max(10, xpForLevel(level));
    const { error } = await sb.from('users').update({ total_xp: xp }).eq('id', childId);
    return !error;
  } catch {
    return false;
  }
}

export interface TopicCard {
  id: string;
  subTopic: string;
  accuracy: number;
  answered: number;
  solved: number;
  total: number;
}

/** Sub-topics within a subject, with per-topic progress — for the drill-down. */
export async function getSubjectTopics(
  grade: string, subject: string, childId: string,
): Promise<{ label: string; topics: TopicCard[] } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { topics, qByTopic } = await fetchBank(sb, grade);
    const st = topics.filter((t) => t.subject === subject && (qByTopic.get(t.id)?.length ?? 0) > 0);
    if (!st.length) return null;

    const { data: attempts } = await sb
      .from('attempts_log')
      .select('topic_id,question_id,is_correct')
      .eq('user_id', childId);
    const tally = new Map<string, { answered: number; correct: number; solved: Set<string> }>();
    for (const a of attempts ?? []) {
      const e = tally.get(a.topic_id as string) ?? { answered: 0, correct: 0, solved: new Set<string>() };
      e.answered += 1;
      if (a.is_correct) { e.correct += 1; e.solved.add(a.question_id as string); }
      tally.set(a.topic_id as string, e);
    }

    const cards: TopicCard[] = st.map((t) => {
      const total = qByTopic.get(t.id)?.length ?? 0;
      const e = tally.get(t.id);
      const answered = e?.answered ?? 0;
      const correct = e?.correct ?? 0;
      return {
        id: t.id, subTopic: t.sub_topic,
        accuracy: answered ? Number((correct / answered).toFixed(2)) : 0,
        answered, solved: e?.solved.size ?? 0, total,
      };
    });
    return { label: SUBJECT_LABEL[subject] ?? subject, topics: cards };
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

    // Academic subjects only. Leadership worlds are surfaced separately in the
    // map as their own direct-access cards (each world is its own entry).
    const order = ['math', 'geometry', 'hebrew', 'bible', 'arabic', 'english', 'science', 'geography', 'future_skills'];
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
export const DAILY_COIN_CAP = 100;

/**
 * Persist a completed quest round. Idempotent for the day: streak advances only
 * on the first completion, and coins are capped so extra rounds hit diminishing
 * returns then stop earning. Returns the coins actually granted after the cap.
 */
export async function completeQuest(coinsEarned: number, childId?: string, xpEarned = 0): Promise<number> {
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
      total_xp: child.xp + Math.max(0, xpEarned),
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

/**
 * Redeem a reward: deduct coins and send a request to the parent (status
 * 'issued' = pending). The parent marks it done or refunds it. Coins are the
 * only limit — a child may redeem again as long as they can afford it.
 */
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

    const ref = 'QL-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const left = child.coins - reward.cost_coins;
    await sb.from('users').update({ quest_coins: left }).eq('id', child.id);
    await sb.from('reward_redemptions').insert({
      reward_id: reward.id, child_id: child.id,
      coins_spent: reward.cost_coins, voucher_code: ref, status: 'issued',
    });
    return { ok: true, coins: left };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

export interface Redemption { id: string; childName: string; rewardTitle: string; cost: number; when: string }

/** Pending reward requests for the parent to fulfil (status 'issued'). */
export async function getPendingRedemptions(): Promise<Redemption[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from('reward_redemptions')
      .select('id,child_id,reward_id,coins_spent,created_at')
      .eq('status', 'issued')
      .order('created_at', { ascending: true })
      .limit(50);
    if (!data?.length) return [];
    const childIds = [...new Set(data.map((r) => r.child_id as string))];
    const rewardIds = [...new Set(data.map((r) => r.reward_id as string))];
    const [{ data: kids }, { data: rewards }] = await Promise.all([
      sb.from('users').select('id,display_name').in('id', childIds),
      sb.from('reward_store').select('id,title').in('id', rewardIds),
    ]);
    const kmap = new Map((kids ?? []).map((k) => [k.id as string, k.display_name as string]));
    const rmap = new Map((rewards ?? []).map((r) => [r.id as string, r.title as string]));
    return data.map((r) => ({
      id: r.id as string,
      childName: kmap.get(r.child_id as string) ?? '—',
      rewardTitle: rmap.get(r.reward_id as string) ?? '—',
      cost: r.coins_spent as number,
      when: r.created_at as string,
    }));
  } catch {
    return null;
  }
}

/** Parent decision on a reward request: fulfil (mark done) or refund the coins. */
export async function resolveRedemption(id: string, action: 'fulfill' | 'refund'): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    if (action === 'fulfill') {
      const { error } = await sb.from('reward_redemptions').update({ status: 'acknowledged' }).eq('id', id);
      return !error;
    }
    // Refund: give the coins back to the child, then remove the request.
    const { data: r } = await sb
      .from('reward_redemptions').select('child_id,coins_spent,status').eq('id', id).maybeSingle();
    if (!r || r.status !== 'issued') return false;
    const child = await getChildProfileById(r.child_id as string);
    if (child) await sb.from('users').update({ quest_coins: child.coins + (r.coins_spent as number) }).eq('id', child.id);
    const { error } = await sb.from('reward_redemptions').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export interface CompassOption { id: string; label: string; icon: string }
export interface CompassWorld {
  topicId: string;
  questionId: string;
  order: number;
  name: string;
  kind: 'reflection' | 'budget' | 'scenario';
  prompt: string;
  note: string;
  options: CompassOption[];
  coins?: number;      // budget worlds: how many time-coins to allocate
  deposits: number;    // how many times the child has engaged this world
}

/** The 4 leadership worlds of "אי המצפן", with this child's deposit counts. */
export async function getCompassWorlds(childId: string): Promise<CompassWorld[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data: topics } = await sb
      .from('curriculum_topics')
      .select('id,sub_topic,order_index')
      .eq('subject', LEADERSHIP_SUBJECT)
      .order('order_index', { ascending: true });
    if (!topics?.length) return null;
    const ids = topics.map((t) => t.id);

    const { data: qs } = await sb
      .from('questions_bank')
      .select('id,topic_id,payload')
      .in('topic_id', ids);
    const qByTopic = new Map<string, { id: string; payload: Record<string, unknown> }>();
    for (const q of qs ?? []) {
      if (!qByTopic.has(q.topic_id as string)) {
        qByTopic.set(q.topic_id as string, { id: q.id as string, payload: q.payload as Record<string, unknown> });
      }
    }

    const { data: att } = await sb
      .from('attempts_log').select('topic_id').eq('user_id', childId).in('topic_id', ids);
    const counts = new Map<string, number>();
    for (const a of att ?? []) counts.set(a.topic_id as string, (counts.get(a.topic_id as string) ?? 0) + 1);

    const worlds: CompassWorld[] = [];
    for (const t of topics) {
      const q = qByTopic.get(t.id);
      if (!q) continue;
      const p = q.payload;
      const raw = (p.options ?? p.choices ?? []) as { id: string; label: string; icon: string }[];
      worlds.push({
        topicId: t.id, questionId: q.id, order: Number(t.order_index ?? 0),
        name: t.sub_topic,
        kind: (p.kind as CompassWorld['kind']) ?? 'scenario',
        prompt: String(p.prompt ?? ''), note: String(p.note ?? ''),
        options: raw.map((o) => ({ id: o.id, label: o.label, icon: o.icon })),
        coins: typeof p.coins === 'number' ? (p.coins as number) : undefined,
        deposits: counts.get(t.id) ?? 0,
      });
    }
    return worlds;
  } catch {
    return null;
  }
}

/**
 * Record one leadership "deposit" (stamp / choice / allocation). Not scored on
 * accuracy, but it counts as part of the day and grants a small fixed reward —
 * XP always, plus a few coins the first time each world is engaged that day.
 */
export async function recordDeposit(childId: string, topicId: string, questionId: string, choice: unknown): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const dayStart = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
    const { data: earlier } = await sb
      .from('attempts_log').select('id')
      .eq('user_id', childId).eq('topic_id', topicId)
      .gte('created_at', dayStart).limit(1);
    const firstToday = !earlier?.length;

    await sb.from('attempts_log').insert({
      user_id: childId, question_id: questionId, topic_id: topicId,
      is_correct: true, chosen_answer: choice ?? null, hints_used: 0,
    });
    await addXp(childId, 5); // identity XP for a leadership deposit

    if (firstToday) {
      const child = await getChildProfileById(childId);
      if (child) await sb.from('users').update({ quest_coins: child.coins + 5 }).eq('id', childId);
    }
    return true;
  } catch {
    return false;
  }
}

export interface StatusBadge { key: string; label: string; desc: string; earned: boolean }
export interface ChildStatus {
  name: string;
  xp: number; level: number; inLevel: number; need: number;
  coins: number; streak: number;
  subjects: SubjectCard[];
  strengths: SubjectCard[];
  toTrain: SubjectCard[];
  badges: StatusBadge[];
}

/** Everything the "המצב שלי" screen needs: level, strengths, weak spots, badges. */
export async function getChildStatus(childId: string, grade: string): Promise<ChildStatus | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const [child, catalog, worlds] = await Promise.all([
      getChildProfileById(childId),
      getSubjectCatalog(grade, childId),
      getCompassWorlds(childId),
    ]);
    if (!child) return null;
    const subjects = catalog ?? [];
    const lvl = levelFromXp(child.xp);

    const practiced = subjects.filter((s) => s.answered > 0);
    const strengths = [...practiced].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
    // Weak spots: lowest accuracy among practiced, then unpracticed subjects.
    const weakPracticed = [...practiced].sort((a, b) => a.accuracy - b.accuracy);
    const untouched = subjects.filter((s) => s.answered === 0);
    const toTrain = [...weakPracticed.filter((s) => s.accuracy < 0.8), ...untouched].slice(0, 3);

    const totalAnswered = subjects.reduce((n, s) => n + s.answered, 0);
    const leadDeposits = (worlds ?? []).reduce((n, w) => n + w.deposits, 0);
    const heartDeposits = (worlds ?? []).find((w) => w.order === 4)?.deposits ?? 0;
    const timeDeposits = (worlds ?? []).find((w) => w.order === 2)?.deposits ?? 0;
    const sharp = subjects.some((s) => s.answered >= 5 && s.accuracy >= 0.9);

    const badges: StatusBadge[] = [
      { key: 'first_step', label: 'צעד ראשון', desc: 'התחלת לתרגל', earned: totalAnswered > 0 || leadDeposits > 0 || child.xp > 0 || child.streak > 0 },
      { key: 'streak_3', label: 'שלושה ברצף', desc: '3 ימים ברצף', earned: child.streak >= 3 },
      { key: 'streak_7', label: 'שבוע חזק', desc: '7 ימים ברצף', earned: child.streak >= 7 },
      { key: 'sharp', label: 'דיוק חד', desc: '90% דיוק בנושא', earned: sharp },
      { key: 'century', label: 'מאה שאלות', desc: '100 שאלות נענו', earned: totalAnswered >= 100 },
      { key: 'gold_heart', label: 'לב זהב', desc: '5 הפקדות לב', earned: heartDeposits >= 5 },
      { key: 'wise_time', label: 'בחירה חכמה', desc: '3 חלוקות זמן', earned: timeDeposits >= 3 },
    ];

    return {
      name: child.name,
      xp: child.xp, level: lvl.level, inLevel: lvl.inLevel, need: lvl.need,
      coins: child.coins, streak: child.streak,
      subjects, strengths, toTrain, badges,
    };
  } catch {
    return null;
  }
}

export interface TopicOverview { id: string; subject: string; subTopic: string; grade: string; count: number }

/** All curriculum topics with their question counts — the parent content panel. */
export async function getTopicsOverview(): Promise<TopicOverview[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data: topics } = await sb
      .from('curriculum_topics')
      .select('id,subject,sub_topic,grade')
      .order('subject', { ascending: true })
      .order('grade', { ascending: true });
    if (!topics?.length) return null;
    const { data: qs } = await sb
      .from('questions_bank').select('topic_id').in('topic_id', topics.map((t) => t.id));
    const counts = new Map<string, number>();
    for (const q of qs ?? []) counts.set(q.topic_id as string, (counts.get(q.topic_id as string) ?? 0) + 1);
    return topics.map((t) => ({
      id: t.id as string, subject: t.subject as string,
      subTopic: t.sub_topic as string, grade: t.grade as string,
      count: counts.get(t.id as string) ?? 0,
    }));
  } catch {
    return null;
  }
}

// ─────────────────────────── Home tasks (chores) ───────────────────────────
export interface HomeTask { id: string; title: string; coins: number; doneToday: boolean }

/** Active chores + whether this child already did each one today. */
export async function getHomeTasks(childId?: string): Promise<HomeTask[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data: tasks, error } = await sb
      .from('home_tasks').select('id,title,coins')
      .eq('active', true).order('created_at', { ascending: true });
    if (error || !tasks) return null;

    // The done-lookup is best-effort: if it fails, still show the tasks.
    let doneSet = new Set<string>();
    if (childId) {
      const day = new Date().toISOString().slice(0, 10);
      const { data: done } = await sb
        .from('home_task_done').select('task_id')
        .eq('child_id', childId).eq('day', day);
      doneSet = new Set((done ?? []).map((r) => r.task_id as string));
    }
    return tasks.map((t) => ({
      id: t.id as string, title: t.title as string, coins: t.coins as number,
      doneToday: doneSet.has(t.id as string),
    }));
  } catch {
    return null;
  }
}

/** Plain list of active chores (for the parent editor — no per-child state). */
export async function listHomeTasks(): Promise<{ id: string; title: string; coins: number }[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from('home_tasks').select('id,title,coins')
      .eq('active', true).order('created_at', { ascending: true });
    return (data ?? []).map((t) => ({ id: t.id as string, title: t.title as string, coins: t.coins as number }));
  } catch {
    return null;
  }
}

export async function addHomeTask(title: string, coins: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from('home_tasks').insert({ title, coins });
    return !error;
  } catch { return false; }
}

export async function removeHomeTask(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from('home_tasks').update({ active: false }).eq('id', id);
    return !error;
  } catch { return false; }
}

export interface TaskDoneResult { ok: boolean; reason?: string; coins?: number; earned?: number }

/** Child checks off a chore: once per day per task, then the coins are credited. */
export async function completeHomeTask(childId: string, taskId: string): Promise<TaskDoneResult> {
  const sb = getSupabase();
  if (!sb) return { ok: false, reason: 'no-db' };
  try {
    const child = await getChildProfileById(childId);
    if (!child) return { ok: false, reason: 'no-child' };
    const { data: task } = await sb
      .from('home_tasks').select('id,coins,active').eq('id', taskId).maybeSingle();
    if (!task || !task.active) return { ok: false, reason: 'no-task' };

    const day = new Date().toISOString().slice(0, 10);
    const { error: insErr } = await sb
      .from('home_task_done').insert({ task_id: taskId, child_id: childId, day });
    if (insErr) return { ok: false, reason: 'already' }; // unique(task,child,day) → already done

    const earned = (task.coins as number) ?? 0;
    const coins = child.coins + earned;
    await sb.from('users').update({ quest_coins: coins }).eq('id', childId);
    return { ok: true, coins, earned };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

// ─────────────── Parent: flagged-question review (content trust layer) ───────────────
export interface FlaggedQuestion {
  id: string; subject: string; subTopic: string; grade: string;
  stem: string; reason: string; correctText: string; choices: { id: string; text: string }[];
}

/** Questions the verifier held back (verification_status='auto_flagged') for a parent to review. */
export async function getFlaggedQuestions(): Promise<FlaggedQuestion[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from('questions_bank')
      .select('id,topic_id,payload')
      .eq('verification_status', 'auto_flagged')
      .limit(50);
    if (!data?.length) return [];
    const topicIds = [...new Set(data.map((r) => r.topic_id as string))];
    const { data: topics } = await sb
      .from('curriculum_topics').select('id,subject,sub_topic,grade').in('id', topicIds);
    const tmap = new Map((topics ?? []).map((t) => [t.id as string, t]));
    return data.map((r) => {
      const p = (r.payload ?? {}) as { stem?: string; flag_reason?: string; correct_choice_id?: string; choices?: { id: string; text: string }[] };
      const t = tmap.get(r.topic_id as string) as { subject?: string; sub_topic?: string; grade?: string } | undefined;
      const choices = (p.choices ?? []).map((c) => ({ id: c.id, text: String(c.text) }));
      const correct = choices.find((c) => c.id === p.correct_choice_id);
      return {
        id: r.id as string,
        subject: t?.subject ?? '', subTopic: t?.sub_topic ?? '', grade: t?.grade ?? '',
        stem: String(p.stem ?? ''), reason: String(p.flag_reason ?? 'סומן לבדיקה'),
        correctText: correct?.text ?? '', choices,
      };
    });
  } catch {
    return null;
  }
}

/** Parent decision on a flagged question: approve → kids see it; reject → deleted. */
export async function reviewQuestion(id: string, action: 'approve' | 'reject'): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    if (action === 'approve') {
      const { error } = await sb.from('questions_bank').update({ verification_status: 'parent_approved' }).eq('id', id);
      return !error;
    }
    const { error } = await sb.from('questions_bank').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
