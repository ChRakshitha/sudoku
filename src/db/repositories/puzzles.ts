import { getDB } from '../database';
import type { PuzzleRecord, Difficulty } from '../../types';

interface PuzzleRow {
  id: number;
  puzzle_id: string;
  difficulty: string;
  completed_at: string;
  time_seconds: number;
  mistakes: number;
  rating_change: number;
  is_perfect: number;
  is_daily: number;
}

function rowToRecord(row: PuzzleRow): PuzzleRecord {
  return {
    id: row.id,
    puzzleId: row.puzzle_id,
    difficulty: row.difficulty as Difficulty,
    completedAt: row.completed_at,
    timeSeconds: row.time_seconds,
    mistakes: row.mistakes,
    ratingChange: row.rating_change,
    isPerfect: row.is_perfect === 1,
    isDaily: row.is_daily === 1,
  };
}

export function savePuzzleCompletion(data: {
  puzzleId: string;
  difficulty: Difficulty;
  timeSeconds: number;
  mistakes: number;
  ratingChange: number;
  isPerfect: boolean;
  isDaily: boolean;
}): void {
  getDB().runSync(
    `INSERT INTO puzzle_history
       (puzzle_id, difficulty, time_seconds, mistakes, rating_change, is_perfect, is_daily)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.puzzleId,
      data.difficulty,
      data.timeSeconds,
      data.mistakes,
      data.ratingChange,
      data.isPerfect ? 1 : 0,
      data.isDaily ? 1 : 0,
    ],
  );
}

export function getTotalSolved(): number {
  const row = getDB().getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM puzzle_history`,
  );
  return row?.count ?? 0;
}

export function getTotalFocusMinutes(): number {
  const row = getDB().getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(time_seconds), 0) as total FROM puzzle_history`,
  );
  return Math.floor((row?.total ?? 0) / 60);
}

export function wasDailyCompletedToday(todayStr: string): boolean {
  const row = getDB().getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM puzzle_history
     WHERE is_daily = 1 AND date(completed_at) = ?`,
    [todayStr],
  );
  return (row?.count ?? 0) > 0;
}

export function getRecentRecords(limit = 20): PuzzleRecord[] {
  const rows = getDB().getAllSync<PuzzleRow>(
    `SELECT * FROM puzzle_history ORDER BY completed_at DESC LIMIT ?`,
    [limit],
  );
  return rows.map(rowToRecord);
}

export function getSolvedCountByDifficulty(): Record<Difficulty, number> {
  const rows = getDB().getAllSync<{ difficulty: string; count: number }>(
    `SELECT difficulty, COUNT(*) as count FROM puzzle_history GROUP BY difficulty`,
  );
  const result: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0 };
  for (const row of rows) {
    result[row.difficulty as Difficulty] = row.count;
  }
  return result;
}

export function getDailyActivity(days = 90): Array<{ date: string; count: number }> {
  return getDB().getAllSync<{ date: string; count: number }>(
    `SELECT date(completed_at) as date, COUNT(*) as count
     FROM puzzle_history
     WHERE completed_at >= date('now', ?)
     GROUP BY date(completed_at)`,
    [`-${days} days`],
  );
}

export function getAvgSolveTimeByDifficulty(): Record<Difficulty, number> {
  const rows = getDB().getAllSync<{ difficulty: string; avg: number }>(
    `SELECT difficulty, AVG(time_seconds) as avg FROM puzzle_history GROUP BY difficulty`,
  );
  const result: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0 };
  for (const row of rows) {
    result[row.difficulty as Difficulty] = Math.round(row.avg ?? 0);
  }
  return result;
}

export function getMostSolvedDifficulty(): Difficulty | null {
  const row = getDB().getFirstSync<{ difficulty: string }>(
    `SELECT difficulty FROM puzzle_history
     GROUP BY difficulty ORDER BY COUNT(*) DESC LIMIT 1`,
  );
  return (row?.difficulty as Difficulty) ?? null;
}

export function getBestDay(): string | null {
  const row = getDB().getFirstSync<{ date: string }>(
    `SELECT date(completed_at) as date FROM puzzle_history
     GROUP BY date(completed_at) ORDER BY COUNT(*) DESC LIMIT 1`,
  );
  return row?.date ?? null;
}

export function getPuzzlesSolvedThisMonth(year: number, month: number): number {
  const row = getDB().getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM puzzle_history
     WHERE strftime('%Y', completed_at) = ? AND strftime('%m', completed_at) = ?`,
    [String(year), String(month).padStart(2, '0')],
  );
  return row?.count ?? 0;
}

export function getFocusMinutesThisMonth(year: number, month: number): number {
  const row = getDB().getFirstSync<{ total: number }>(
    `SELECT COALESCE(SUM(time_seconds), 0) as total FROM puzzle_history
     WHERE strftime('%Y', completed_at) = ? AND strftime('%m', completed_at) = ?`,
    [String(year), String(month).padStart(2, '0')],
  );
  return Math.floor((row?.total ?? 0) / 60);
}
