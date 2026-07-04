import { create } from 'zustand';
import type { Board, Notes, CellCoord, GameStatus, PuzzleConfig, GameSnapshot } from '../types';
import { isBoardComplete } from '../engine/sudoku';

interface GameState {
  config: PuzzleConfig | null;
  board: Board;
  notes: Notes;
  selectedCell: CellCoord | null;
  isNotesMode: boolean;
  pendingNumber: number | null;
  history: GameSnapshot[];
  status: GameStatus;
  mistakes: number;
  startTime: number;
  pausedDuration: number;
  pausedAt: number | null;

  // Actions
  startGame: (config: PuzzleConfig) => void;
  selectCell: (coord: CellCoord | null) => void;
  setPendingNumber: (num: number | null) => void;
  enterNumber: (num: number) => void;
  applyHint: () => boolean;
  eraseCell: () => void;
  toggleNotesMode: () => void;
  undo: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  getElapsedSeconds: () => number;
}

function makeEmptyNotes(): Notes {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<number>()),
  );
}

function cloneBoard(b: Board): Board {
  return b.map(r => [...r]);
}

function cloneNotes(n: Notes): Notes {
  return n.map(row => row.map(cell => new Set(cell)));
}

export const useGameStore = create<GameState>((set, get) => ({
  config: null,
  board: [],
  notes: makeEmptyNotes(),
  selectedCell: null,
  isNotesMode: false,
  pendingNumber: null,
  history: [],
  status: 'playing',
  mistakes: 0,
  startTime: 0,
  pausedDuration: 0,
  pausedAt: null,

  startGame: (config) =>
    set({
      config,
      board: cloneBoard(config.puzzle),
      notes: makeEmptyNotes(),
      selectedCell: null,
      isNotesMode: false,
      pendingNumber: null,
      history: [],
      status: 'playing',
      mistakes: 0,
      startTime: Date.now(),
      pausedDuration: 0,
      pausedAt: null,
    }),

  selectCell: (coord) => set({ selectedCell: coord }),

  setPendingNumber: (num) =>
    set(s => ({ pendingNumber: s.pendingNumber === num ? null : num })),

  enterNumber: (num) => {
    const { config, board, notes, selectedCell, isNotesMode, history, status } = get();
    if (!config || !selectedCell || status !== 'playing') return;
    const { row, col } = selectedCell;
    if (config.puzzle[row][col] !== 0) return; // given cell — immutable

    const snapshot: GameSnapshot = { board: cloneBoard(board), notes: cloneNotes(notes) };

    if (isNotesMode) {
      const newNotes = cloneNotes(notes);
      if (newNotes[row][col].has(num)) {
        newNotes[row][col].delete(num);
      } else {
        newNotes[row][col].add(num);
      }
      set({ notes: newNotes, history: [...history, snapshot] });
      return;
    }

    const newBoard = cloneBoard(board);
    newBoard[row][col] = num;

    const isWrong = num !== config.solution[row][col];
    const newMistakes = isWrong ? get().mistakes + 1 : get().mistakes;

    // Clear notes for this cell on entry
    const newNotes = cloneNotes(notes);
    newNotes[row][col] = new Set();

    // Check completion
    const completed = isBoardComplete(newBoard, config.solution);

    set({
      board: newBoard,
      notes: newNotes,
      mistakes: newMistakes,
      history: [...history, snapshot],
      status: completed ? 'completed' : 'playing',
    });
  },

  // Reveals the solution value for the selected cell (or the first empty
  // cell if none is selected/already filled). Does not count as a mistake.
  applyHint: () => {
    const { config, board, notes, selectedCell, history, status } = get();
    if (!config || status !== 'playing') return false;

    let target = selectedCell;
    if (!target || board[target.row][target.col] !== 0) {
      target = null;
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) {
            target = { row: r, col: c };
            break outer;
          }
        }
      }
    }
    if (!target) return false;

    const { row, col } = target;
    const snapshot: GameSnapshot = { board: cloneBoard(board), notes: cloneNotes(notes) };
    const newBoard = cloneBoard(board);
    newBoard[row][col] = config.solution[row][col];
    const newNotes = cloneNotes(notes);
    newNotes[row][col] = new Set();

    const completed = isBoardComplete(newBoard, config.solution);

    set({
      board: newBoard,
      notes: newNotes,
      selectedCell: target,
      history: [...history, snapshot],
      status: completed ? 'completed' : 'playing',
    });
    return true;
  },

  eraseCell: () => {
    const { config, board, notes, selectedCell, history, status } = get();
    if (!config || !selectedCell || status !== 'playing') return;
    const { row, col } = selectedCell;
    if (config.puzzle[row][col] !== 0) return;

    const snapshot: GameSnapshot = { board: cloneBoard(board), notes: cloneNotes(notes) };
    const newBoard = cloneBoard(board);
    const newNotes = cloneNotes(notes);
    newBoard[row][col] = 0;
    newNotes[row][col] = new Set();
    set({ board: newBoard, notes: newNotes, history: [...history, snapshot] });
  },

  toggleNotesMode: () => set(s => ({ isNotesMode: !s.isNotesMode })),

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({
      board: cloneBoard(prev.board),
      notes: cloneNotes(prev.notes),
      history: history.slice(0, -1),
    });
  },

  pause: () => {
    const { status } = get();
    if (status !== 'playing') return;
    set({ status: 'paused', pausedAt: Date.now() });
  },

  resume: () => {
    const { status, pausedAt, pausedDuration } = get();
    if (status !== 'paused' || !pausedAt) return;
    set({
      status: 'playing',
      pausedDuration: pausedDuration + (Date.now() - pausedAt),
      pausedAt: null,
    });
  },

  reset: () =>
    set({
      config: null,
      board: [],
      notes: makeEmptyNotes(),
      selectedCell: null,
      isNotesMode: false,
      history: [],
      status: 'playing',
      mistakes: 0,
      startTime: 0,
      pausedDuration: 0,
      pausedAt: null,
    }),

  getElapsedSeconds: () => {
    const { startTime, pausedDuration, pausedAt, status } = get();
    if (startTime === 0) return 0;
    const now = status === 'paused' && pausedAt ? pausedAt : Date.now();
    return Math.floor((now - startTime - pausedDuration) / 1000);
  },
}));
