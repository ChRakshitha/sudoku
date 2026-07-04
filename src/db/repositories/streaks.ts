import { getDB } from '../database';
import type { StreakData } from '../../types';

interface StreakRow {
  current_streak: number;
  longest_streak: number;
  last_played_date: string | null;
}

export function getStreaks(): StreakData {
  const row = getDB().getFirstSync<StreakRow>(`SELECT * FROM streaks WHERE id = 1`);
  return {
    currentStreak: row?.current_streak ?? 0,
    longestStreak: row?.longest_streak ?? 0,
    lastPlayedDate: row?.last_played_date ?? null,
  };
}

export function updateStreakForCompletion(todayStr: string): {
  currentStreak: number;
  longestStreak: number;
  continued: boolean;
} {
  const current = getStreaks();
  const last = current.lastPlayedDate;

  // Already played today — no streak change
  if (last === todayStr) {
    return {
      currentStreak: current.currentStreak,
      longestStreak: current.longestStreak,
      continued: false,
    };
  }

  const yesterday = getYesterday(todayStr);
  const isConsecutive = last === yesterday;

  const newCurrent = isConsecutive ? current.currentStreak + 1 : 1;
  const newLongest = Math.max(newCurrent, current.longestStreak);

  getDB().runSync(
    `UPDATE streaks SET current_streak = ?, longest_streak = ?, last_played_date = ? WHERE id = 1`,
    [newCurrent, newLongest, todayStr],
  );

  return { currentStreak: newCurrent, longestStreak: newLongest, continued: isConsecutive };
}

function getYesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
