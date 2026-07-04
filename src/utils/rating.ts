import type { Difficulty } from '../types';

const BASE_GAINS: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
  expert: 30,
};

export function calculateRatingChange(data: {
  difficulty: Difficulty;
  mistakes: number;
}): number {
  const base = BASE_GAINS[data.difficulty];
  const deduction = data.mistakes * 1;
  return Math.max(1, base - deduction);
}

export function getJourneyLevel(totalSolved: number, rating: number): {
  level: number;
  title: string;
  nextTitle: string | null;
  progress: number; // 0-1
  description: string;
} {
  const levels = [
    { title: 'Beginner', description: 'Just starting out', minSolved: 0 },
    { title: 'Pattern Spotter', description: 'Recognizing basic patterns', minSolved: 10 },
    { title: 'Logic Explorer', description: 'Applying logical reasoning', minSolved: 30 },
    { title: 'Puzzle Analyst', description: 'Systematic problem solver', minSolved: 75 },
    { title: 'Master Solver', description: 'Elite logical thinker', minSolved: 150 },
  ];

  let currentIdx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalSolved >= levels[i].minSolved) {
      currentIdx = i;
      break;
    }
  }

  // Rating can also elevate to Master
  if (rating >= 1400 && currentIdx < 4) currentIdx = 4;

  const current = levels[currentIdx];
  const next = levels[currentIdx + 1] ?? null;

  let progress = 1;
  if (next) {
    const from = current.minSolved;
    const to = next.minSolved;
    progress = Math.min(1, (totalSolved - from) / (to - from));
  }

  return {
    level: currentIdx,
    title: current.title,
    nextTitle: next?.title ?? null,
    progress,
    description: current.description,
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function getEstimatedTime(difficulty: Difficulty): string {
  const estimates: Record<Difficulty, string> = {
    easy: '5–10 min',
    medium: '10–20 min',
    hard: '20–35 min',
    expert: '30–60 min',
  };
  return estimates[difficulty];
}

export function getDifficultyColor(difficulty: Difficulty): string {
  const colors: Record<Difficulty, string> = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444',
    expert: '#8B5CF6',
  };
  return colors[difficulty];
}
