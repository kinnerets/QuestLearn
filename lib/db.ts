import { getSupabase } from './supabaseClient';
import { sm2, qualityFrom, updateMastery } from './composer';
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
  topicId: string;
  title: string;
  subtitle: string;
  minutes: number;
  prompt: string;
  note: string;
  choices: { id: string; label: string; icon: 'star' | 'home' | 'ear' }[];
}

export type DbStation = DbAcademicStation | DbLeadStation;

const KIND_BY_SUBJECT: Partial<Record<Subject, StationKind>> = {
  math: 'core', geometry: 'core', hebrew: 'core', bible: 'core', science: 'core',
  arabic: 'lang', english: 'lang',
  future_skills: 'future', geography: 'future',
  leadership: 'lead',
};

const SUBTITLE: Record<StationKind, string> = {
  core: 'חובה', lang: 'שפות', future: 'העשרה', lead: 'מנהיגות',
};

// The daily path is these subjects in order (until the Composer exists).
const DAILY_SUBJECTS: Subject[] = ['math', 'arabic', 'future_skills', 'leadership'];

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
 * Compose a day's path: one station per subject, in order. `round` (1-based)
 * rotates through each topic's question bank so "עוד מסע" serves fresh
 * questions instead of repeating. Questions are ordered by difficulty, so
 * earlier rounds are gentler.
 */
export async function getDailyLesson(grade = 'grade_3', round = 1): Promise<DbStation[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    // Core/lang subjects are grade-specific; enrichment (future_skills, leadership) is shared.
    const { data: topics, error } = await sb
      .from('curriculum_topics')
      .select('id,subject,sub_topic,grade')
      .in('subject', DAILY_SUBJECTS)
      .in('grade', [grade, 'enrichment']);
    if (error || !topics?.length) return null;

    const stations: DbStation[] = [];
    for (const subject of DAILY_SUBJECTS) {
      const topic = topics.find((t) => t.subject === subject);
      if (!topic) continue;
      const { data: qs } = await sb
        .from('questions_bank')
        .select('id,type,difficulty,payload')
        .eq('topic_id', topic.id)
        .order('difficulty', { ascending: true })
        .order('id', { ascending: true });
      if (!qs?.length) continue;
      const q = qs[(round - 1) % qs.length]; // rotate per round
      const kind = KIND_BY_SUBJECT[subject as Subject] ?? 'core';
      const p = q.payload as Record<string, unknown>;
      if (kind === 'lead') {
        stations.push({
          kind: 'lead', topicId: topic.id, title: topic.sub_topic, subtitle: SUBTITLE.lead, minutes: 1,
          prompt: String(p.prompt), note: String(p.note),
          choices: p.choices as DbLeadStation['choices'],
        });
      } else {
        stations.push({
          kind, topicId: topic.id, questionId: q.id, title: topic.sub_topic, subtitle: SUBTITLE[kind], minutes: 2,
          tag: String(p.tag ?? ''), stem: String(p.stem), hint: String(p.hint ?? ''),
          choices: p.choices as DbAcademicStation['choices'],
          correctId: String(p.correct_choice_id),
          coins: Number(p.coins ?? 10),
        });
      }
    }
    return stations.length ? stations : null;
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
