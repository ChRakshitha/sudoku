import { getDB } from '../database';
import type { PersonalRecords, Difficulty } from '../../types';

type RecordType =
  | 'fastest_easy'
  | 'fastest_medium'
  | 'fastest_hard'
  | 'fastest_expert'
  | 'longest_streak'
  | 'most_in_one_day'
  | 'consecutive_perfect';

function getRecord(type: RecordType): number | null {
  const row = getDB().getFirstSync<{ value_int: number | null }>(
    `SELECT value_int FROM personal_records WHERE record_type = ?`,
    [type],
  );
  return row?.value_int ?? null;
}

function setRecord(type: RecordType, value: number): void {
  getDB().runSync(
    `INSERT INTO personal_records (record_type, value_int, achieved_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(record_type) DO UPDATE SET value_int = excluded.value_int, achieved_at = excluded.achieved_at`,
    [type, value],
  );
}

export function getPersonalRecords(): PersonalRecords {
  return {
    fastestEasy: getRecord('fastest_easy'),
    fastestMedium: getRecord('fastest_medium'),
    fastestHard: getRecord('fastest_hard'),
    fastestExpert: getRecord('fastest_expert'),
    longestStreak: getRecord('longest_streak') ?? 0,
    mostInOneDay: getRecord('most_in_one_day') ?? 0,
    consecutivePerfect: getRecord('consecutive_perfect') ?? 0,
  };
}

// Returns list of record types that were broken
export function checkAndUpdateRecords(data: {
  difficulty: Difficulty;
  timeSeconds: number;
  currentStreak: number;
  isPerfect: boolean;
  todayStr: string;
}): string[] {
  const db = getDB();
  const broken: string[] = [];

  const typeMap: Record<Difficulty, RecordType> = {
    easy: 'fastest_easy',
    medium: 'fastest_medium',
    hard: 'fastest_hard',
    expert: 'fastest_expert',
  };

  const fastestType = typeMap[data.difficulty];
  const existing = getRecord(fastestType);
  if (existing === null || data.timeSeconds < existing) {
    setRecord(fastestType, data.timeSeconds);
    broken.push(`Fastest ${data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1)}`);
  }

  const longestSteak = getRecord('longest_streak') ?? 0;
  if (data.currentStreak > longestSteak) {
    setRecord('longest_streak', data.currentStreak);
    if (data.currentStreak > 1) broken.push('Longest Streak');
  }

  // Most in one day
  const countToday = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM puzzle_history WHERE date(completed_at) = ?`,
    [data.todayStr],
  )?.count ?? 0;
  const mostInDay = getRecord('most_in_one_day') ?? 0;
  if (countToday > mostInDay) {
    setRecord('most_in_one_day', countToday);
    if (countToday > 1) broken.push('Most Puzzles in a Day');
  }

  // Consecutive perfect solves
  if (data.isPerfect) {
    const perfectRun = getPerfectRun();
    const current = getRecord('consecutive_perfect') ?? 0;
    if (perfectRun > current) {
      setRecord('consecutive_perfect', perfectRun);
      if (perfectRun > 1) broken.push('Perfect Streak');
    }
  }

  return broken;
}

function getPerfectRun(): number {
  const rows = getDB().getAllSync<{ is_perfect: number }>(
    `SELECT is_perfect FROM puzzle_history ORDER BY completed_at DESC LIMIT 50`,
  );
  let count = 0;
  for (const row of rows) {
    if (row.is_perfect === 1) count++;
    else break;
  }
  return count;
}
