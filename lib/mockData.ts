import type { AvatarConfig, DailyStation, User } from './types';

// Default avatar for Mili (light skin, brown long hair, magenta top, bow)
export const miliAvatar: AvatarConfig = {
  base: 'girl',
  skin_tone: '#FCE0C8',
  hairstyle_id: 'long',
  hair_color: '#7A4B2B',
  top_id: 'varsity',
  top_color: '#FF2A85',
  accessory_id: 'bow',
};

export const mili: Pick<User,
  'display_name' | 'grade_level' | 'quest_coins' | 'current_streak' | 'daily_goal_minutes'> & {
  avatar_config: AvatarConfig;
} = {
  display_name: 'מילי',
  grade_level: 'grade_3',
  quest_coins: 120,
  current_streak: 6,
  daily_goal_minutes: 8,
  avatar_config: miliAvatar,
};

// Today's composed path (would come from the Daily Quest Composer)
export const todayStations: DailyStation[] = [
  { kind: 'core',   subject: 'math',        title: 'חשבון - לוח הכפל',   subtitle: 'חובה', minutes: 2, status: 'active' },
  { kind: 'lang',   subject: 'arabic',      title: 'ערבית - ברכות',      subtitle: 'שפות', minutes: 2, status: 'upcoming' },
  { kind: 'future', subject: 'future_skills', title: 'שער העתיד - אופנה', subtitle: 'העשרה', minutes: 2, status: 'upcoming' },
  { kind: 'lead',   subject: 'leadership',  title: 'בנק הלב - הפקדה',    subtitle: 'מנהיגות', minutes: 1, status: 'upcoming' },
];

export const completedToday = 0;
