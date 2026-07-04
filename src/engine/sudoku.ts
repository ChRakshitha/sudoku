import type { Difficulty, Board } from '../types';

// Mulberry32 seeded PRNG
function createRNG(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid: Board, row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function fillGrid(grid: Board, rng: () => number): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid, rng)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// MRV heuristic solver; stops at 2 solutions
function countSolutions(grid: Board, limit = 2): number {
  let count = 0;

  const solve = (): boolean => {
    let minOpts = 10;
    let bestRow = -1;
    let bestCol = -1;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          let opts = 0;
          for (let n = 1; n <= 9; n++) {
            if (isValid(grid, r, c, n)) opts++;
          }
          if (opts === 0) return false;
          if (opts < minOpts) {
            minOpts = opts;
            bestRow = r;
            bestCol = c;
          }
        }
      }
    }

    if (bestRow === -1) {
      count++;
      return count >= limit;
    }

    for (let num = 1; num <= 9; num++) {
      if (isValid(grid, bestRow, bestCol, num)) {
        grid[bestRow][bestCol] = num;
        if (solve()) return true;
        grid[bestRow][bestCol] = 0;
      }
    }
    return false;
  };

  solve();
  return count;
}

const CLUE_COUNTS: Record<Difficulty, number> = {
  easy: 46,
  medium: 36,
  hard: 28,
  expert: 22,
};

export interface GeneratedPuzzle {
  puzzle: Board;
  solution: Board;
}

export function generatePuzzle(difficulty: Difficulty, seed: number): GeneratedPuzzle {
  const rng = createRNG(seed);

  const solution: Board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillGrid(solution, rng);

  const puzzle: Board = solution.map(row => [...row]);
  const toRemove = 81 - CLUE_COUNTS[difficulty];

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffled = shuffle(positions, rng);

  let removed = 0;
  for (const [row, col] of shuffled) {
    if (removed >= toRemove) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    const copy = puzzle.map(r => [...r]);
    if (countSolutions(copy) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}

export function isBoardComplete(board: Board, solution: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function isCellError(board: Board, solution: Board, row: number, col: number): boolean {
  const val = board[row][col];
  return val !== 0 && val !== solution[row][col];
}
