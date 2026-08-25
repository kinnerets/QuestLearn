import { getSupabase } from './supabaseClient';
import type { AvatarConfig, StationKind, Subject } from './types';

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

export async function getChildProfile(): Promise<ChildProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('users')
      .select('id,display_name,grade_level,quest_coins,current_streak,avatar_config,daily_goal_minutes')
      .eq('role', 'child')
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.display_name,
      grade: data.grade_level,
      coins: data.quest_coins,
      streak: data.current_streak,
      avatar: data.avatar_config as AvatarConfig,
      goalMinutes: data.daily_goal_minutes,
    };
  } catch {
    return null;
  }
}

export async function getDailyLesson(): Promise<DbStation[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data: topics, error } = await sb
      .from('curriculum_topics')
      .select('id,subject,sub_topic')
      .in('subject', DAILY_SUBJECTS);
    if (error || !topics?.length) return null;

    const stations: DbStation[] = [];
    for (const subject of DAILY_SUBJECTS) {
      const topic = topics.find((t) => t.subject === subject);
      if (!topic) continue;
      const { data: qs } = await sb
        .from('questions_bank')
        .select('type,payload')
        .eq('topic_id', topic.id)
        .limit(1);
      const q = qs?.[0];
      if (!q) continue;
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
          kind, topicId: topic.id, title: topic.sub_topic, subtitle: SUBTITLE[kind], minutes: 2,
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

/** Persist a completed daily quest: add coins and advance the streak. Best-effort. */
export async function completeQuest(coinsEarned: number): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const child = await getChildProfile();
    if (!child) return false;
    const today = new Date().toISOString().slice(0, 10);
    await sb.from('users').update({
      quest_coins: child.coins + coinsEarned,
      current_streak: child.streak + 1,
    }).eq('id', child.id);
    await sb.from('daily_progress').upsert({
      user_id: child.id, date: today, stations_completed: 4,
      quest_completed: true, coins_awarded_today: coinsEarned,
    });
    return true;
  } catch {
    return false;
  }
}
