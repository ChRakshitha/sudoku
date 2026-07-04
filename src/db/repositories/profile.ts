import { getDB } from '../database';
import type { Profile } from '../../types';

// Rating points that must accumulate before a new hint is awarded.
const HINT_COST = 25;

interface ProfileRow {
  id: number;
  name: string;
  rating: number;
  hints: number;
  hint_progress: number;
  created_at: string;
}

export function getProfile(): Profile {
  const db = getDB();
  const row = db.getFirstSync<ProfileRow>(`SELECT * FROM profile WHERE id = 1`);
  return {
    id: row!.id,
    name: row!.name,
    rating: row!.rating,
    hints: row!.hints,
    createdAt: row!.created_at,
  };
}

export function getHints(): number {
  const row = getDB().getFirstSync<{ hints: number }>(`SELECT hints FROM profile WHERE id = 1`);
  return row?.hints ?? 0;
}

export function spendHint(): boolean {
  const db = getDB();
  const row = db.getFirstSync<{ hints: number }>(`SELECT hints FROM profile WHERE id = 1`);
  if (!row || row.hints <= 0) return false;
  db.runSync(`UPDATE profile SET hints = hints - 1 WHERE id = 1`);
  return true;
}

// Converts rating earned from a completed puzzle into hints, carrying any
// leftover progress forward so small-difficulty solves still accumulate.
export function awardHintProgress(ratingChange: number): number {
  const db = getDB();
  const row = db.getFirstSync<{ hints: number; hint_progress: number }>(
    `SELECT hints, hint_progress FROM profile WHERE id = 1`,
  );
  const progress = (row?.hint_progress ?? 0) + Math.max(0, ratingChange);
  const earned = Math.floor(progress / HINT_COST);
  const remainder = progress % HINT_COST;
  const newHints = (row?.hints ?? 0) + earned;
  db.runSync(`UPDATE profile SET hints = ?, hint_progress = ? WHERE id = 1`, [newHints, remainder]);
  return earned;
}

export function updateName(name: string): void {
  getDB().runSync(`UPDATE profile SET name = ? WHERE id = 1`, [name]);
}

export function updateRating(rating: number): void {
  const clamped = Math.max(1000, rating);
  getDB().runSync(`UPDATE profile SET rating = ? WHERE id = 1`, [clamped]);
}

export function getRating(): number {
  const db = getDB();
  const row = db.getFirstSync<{ rating: number }>(`SELECT rating FROM profile WHERE id = 1`);
  return row?.rating ?? 1000;
}
