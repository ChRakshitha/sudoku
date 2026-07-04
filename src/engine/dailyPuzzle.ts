import { generatePuzzle, type GeneratedPuzzle } from './sudoku';
import type { Difficulty } from '../types';

export function getDateSeed(date: Date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // Combine into a unique integer seed per day
  return y * 10000 + m * 100 + d;
}

export function getDailyPuzzleId(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `daily-${y}-${m}-${d}`;
}

export function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDailyDifficulty(date: Date = new Date()): Difficulty {
  // Rotate through easy/medium/hard/expert by week number
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  return difficulties[Math.floor(dayOfYear / 7) % 4];
}

export function generateDailyPuzzle(date: Date = new Date()): GeneratedPuzzle & { id: string; difficulty: Difficulty } {
  const seed = getDateSeed(date);
  const difficulty = getDailyDifficulty(date);
  const generated = generatePuzzle(difficulty, seed);
  return {
    ...generated,
    id: getDailyPuzzleId(date),
    difficulty,
  };
}

export function generateRandomPuzzle(
  difficulty: Difficulty,
): GeneratedPuzzle & { id: string; difficulty: Difficulty } {
  const seed = Date.now() ^ Math.floor(Math.random() * 0xFFFFFF);
  const generated = generatePuzzle(difficulty, seed);
  return {
    ...generated,
    id: `${difficulty}-${seed}`,
    difficulty,
  };
}
