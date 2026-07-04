import { getDB } from '../database';
import type { RatingEntry } from '../../types';

export function addRatingEntry(rating: number): void {
  getDB().runSync(
    `INSERT INTO rating_history (rating, recorded_at) VALUES (?, datetime('now'))`,
    [rating],
  );
}

export function getRatingHistory(limit = 30): RatingEntry[] {
  const rows = getDB().getAllSync<{ rating: number; recorded_at: string }>(
    `SELECT rating, recorded_at FROM rating_history ORDER BY recorded_at DESC LIMIT ?`,
    [limit],
  );
  return rows
    .map(r => ({ rating: r.rating, recordedAt: r.recorded_at }))
    .reverse();
}

export function getHighestRating(): number {
  const row = getDB().getFirstSync<{ max_rating: number }>(
    `SELECT MAX(rating) as max_rating FROM rating_history`,
  );
  return row?.max_rating ?? 1000;
}
