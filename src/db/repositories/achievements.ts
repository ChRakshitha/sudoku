import { getDB } from '../database';
import type { Achievement, AchievementDef } from '../../types';

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_puzzle', title: 'First Step', description: 'Complete your first puzzle', icon: 'star', target: 1 },
  { id: 'streak_3', title: 'On a Roll', description: 'Maintain a 3-day streak', icon: 'flame', target: 3 },
  { id: 'streak_7', title: 'Daily Devotion', description: 'Maintain a 7-day streak', icon: 'flame', target: 7 },
  { id: 'streak_30', title: 'Consistent', description: 'Maintain a 30-day streak', icon: 'flame', target: 30 },
  { id: 'puzzles_10', title: 'Getting Started', description: 'Solve 10 puzzles', icon: 'grid', target: 10 },
  { id: 'puzzles_50', title: 'Dedicated', description: 'Solve 50 puzzles', icon: 'grid', target: 50 },
  { id: 'puzzles_100', title: 'Centurion', description: 'Solve 100 puzzles', icon: 'grid', target: 100 },
  { id: 'first_expert', title: 'Expert Initiation', description: 'Complete an Expert puzzle', icon: 'brain', target: 1 },
  { id: 'perfect_solve', title: 'Perfectionist', description: 'Complete a puzzle without any mistakes', icon: 'check-circle', target: 1 },
  { id: 'perfect_3', title: 'Perfect Streak', description: 'Complete 3 puzzles in a row without mistakes', icon: 'check-circle', target: 3 },
  { id: 'rating_1100', title: 'Rising', description: 'Reach a rating of 1100', icon: 'trending-up', target: 1100 },
  { id: 'rating_1250', title: 'Advanced', description: 'Reach a rating of 1250', icon: 'trending-up', target: 1250 },
  { id: 'rating_1500', title: 'Grand Master', description: 'Reach a rating of 1500', icon: 'award', target: 1500 },
  { id: 'focus_60', title: 'Focused', description: 'Accumulate 60 minutes of focus time', icon: 'clock', target: 60 },
  { id: 'focus_500', title: 'Deep Focus', description: 'Accumulate 500 minutes of focus time', icon: 'clock', target: 500 },
];

interface AchievementRow {
  id: string;
  unlocked_at: string | null;
  progress: number;
}

export function getAllAchievements(): Achievement[] {
  const db = getDB();
  const rows = db.getAllSync<AchievementRow>(`SELECT * FROM achievements`);
  const rowMap = new Map(rows.map(r => [r.id, r]));

  return ACHIEVEMENT_DEFS.map(def => {
    const row = rowMap.get(def.id);
    return {
      ...def,
      unlockedAt: row?.unlocked_at ?? null,
      progress: row?.progress ?? 0,
    };
  });
}

export function unlockAchievement(id: string): void {
  const db = getDB();
  db.runSync(
    `INSERT INTO achievements (id, unlocked_at, progress)
     VALUES (?, datetime('now'), 1)
     ON CONFLICT(id) DO UPDATE SET unlocked_at = COALESCE(unlocked_at, datetime('now')), progress = 1`,
    [id],
  );
}

export function updateProgress(id: string, progress: number): void {
  getDB().runSync(
    `INSERT INTO achievements (id, progress)
     VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET progress = ?`,
    [id, progress, progress],
  );
}

export function checkAndGrantAchievements(data: {
  totalSolved: number;
  currentStreak: number;
  rating: number;
  focusMinutes: number;
  isPerfect: boolean;
  difficulty: string;
  consecutivePerfect: number;
}): string[] {
  const unlocked: string[] = [];
  const achievements = getAllAchievements();
  const unlockedIds = new Set(achievements.filter(a => a.unlockedAt).map(a => a.id));

  const check = (id: string, condition: boolean) => {
    if (condition && !unlockedIds.has(id)) {
      unlockAchievement(id);
      unlocked.push(id);
    }
  };

  check('first_puzzle', data.totalSolved >= 1);
  check('streak_3', data.currentStreak >= 3);
  check('streak_7', data.currentStreak >= 7);
  check('streak_30', data.currentStreak >= 30);
  check('puzzles_10', data.totalSolved >= 10);
  check('puzzles_50', data.totalSolved >= 50);
  check('puzzles_100', data.totalSolved >= 100);
  check('first_expert', data.difficulty === 'expert');
  check('perfect_solve', data.isPerfect);
  check('perfect_3', data.consecutivePerfect >= 3);
  check('rating_1100', data.rating >= 1100);
  check('rating_1250', data.rating >= 1250);
  check('rating_1500', data.rating >= 1500);
  check('focus_60', data.focusMinutes >= 60);
  check('focus_500', data.focusMinutes >= 500);

  return unlocked;
}
