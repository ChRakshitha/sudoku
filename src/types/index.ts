export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameStatus = 'playing' | 'paused' | 'completed';

export type Board = number[][];
// notes[row][col] = Set of candidate numbers (1-9)
export type Notes = Set<number>[][];
export type CellCoord = { row: number; col: number };

export interface PuzzleConfig {
  id: string;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  isDaily: boolean;
}

export interface GameSnapshot {
  board: Board;
  notes: Notes;
}

export interface Profile {
  id: number;
  name: string;
  rating: number;
  hints: number;
  createdAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
}

export interface PuzzleRecord {
  id: number;
  puzzleId: string;
  difficulty: Difficulty;
  completedAt: string;
  timeSeconds: number;
  mistakes: number;
  ratingChange: number;
  isPerfect: boolean;
  isDaily: boolean;
}

export interface PersonalRecords {
  fastestEasy: number | null;
  fastestMedium: number | null;
  fastestHard: number | null;
  fastestExpert: number | null;
  longestStreak: number;
  mostInOneDay: number;
  consecutivePerfect: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
}

export interface Achievement extends AchievementDef {
  unlockedAt: string | null;
  progress: number;
}

export interface RatingEntry {
  rating: number;
  recordedAt: string;
}

export interface DailyActivity {
  date: string;
  count: number;
}

export interface MonthlyStats {
  year: number;
  month: number;
  puzzlesSolved: number;
  focusMinutes: number;
  avgSolveTime: number;
  favoriteDifficulty: Difficulty | null;
  bestDay: string | null;
  longestStreak: number;
  highestRating: number;
}

export interface CompletionResult {
  timeSeconds: number;
  mistakes: number;
  ratingChange: number;
  newRating: number;
  isPerfect: boolean;
  newRecords: string[];
  streakContinued: boolean;
  currentStreak: number;
  hintsEarned: number;
}
