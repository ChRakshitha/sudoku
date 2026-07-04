# Sudoku Journey

A premium, fully offline Sudoku app built with React Native, Expo, and TypeScript. All progress — puzzle history, ratings, streaks, and achievements — is stored locally in SQLite, so no account or network connection is ever required.

## Features

### Gameplay
- **Classic 9x9 Sudoku** with four difficulty levels: Easy, Medium, Hard, Expert.
- **Daily Puzzle** — a deterministic puzzle seeded per calendar day, shared by everyone who plays that day.
- **Notes / pencil marks** for tracking candidate numbers per cell.
- **Undo** — step back through your move history.
- **Mistake highlighting** (toggle in Settings) — incorrect entries are flagged immediately against the solution.
- **Same-number & row/column/box highlighting** to make patterns easier to spot.
- **Long-press to stamp**: long-press a number on the number pad to arm it, then tap any number of cells on the grid to place that number repeatedly without reselecting it each time.
- **Hints** — a limited, persistent resource (not per-puzzle). Hints are earned by scoring: rating gained from completed puzzles accumulates and converts into hints over time. Using a hint reveals the correct value for the selected cell (or the next empty cell) without counting as a mistake.
- **Pause / Resume** with an elapsed-time timer that excludes paused time.

### Progression & Stats
- **Rating system** — a simple Elo-like score that increases with each solve (scaled by difficulty, reduced by mistakes) and is tracked over time in a rating history chart.
- **Journey levels** — Beginner → Pattern Spotter → Logic Explorer → Puzzle Analyst → Master Solver, based on puzzles solved and rating.
- **Streaks** — current and longest daily-play streaks.
- **Personal records** — fastest solve per difficulty, longest streak, most puzzles in a day, longest perfect-solve streak.
- **Achievements** — 15 unlockable achievements spanning streaks, puzzle counts, difficulty milestones, perfect solves, rating thresholds, and total focus time.
- **Progress screen** — solve counts by difficulty, average solve time, a calendar heatmap of daily activity, and monthly stats.

### Design
- Light/dark theme support, switching automatically with the system or manually.
- Four-tab navigation: **Home**, **Play**, **Progress**, **Profile**, plus a full-screen modal-style **Game** screen.

## Tech Stack

| Layer          | Choice                                              |
|----------------|------------------------------------------------------|
| Framework      | [Expo](https://expo.dev) (SDK 51) + React Native 0.74 |
| Language       | TypeScript                                          |
| Navigation     | React Navigation (bottom tabs + native stack)       |
| State          | Zustand (`gameStore` for in-round state, `appStore` for profile/settings) |
| Persistence    | `expo-sqlite` (on-device SQLite database)           |
| Charts         | `react-native-svg`-based custom components          |
| Haptics        | `expo-haptics`                                      |

## Project Structure

```
src/
  components/
    board/        # SudokuBoard, SudokuCell — the 9x9 grid
    charts/        # RatingChart, CalendarHeatmap
    ui/            # NumberPad, GameControls, modals, cards
  db/
    database.ts    # SQLite connection + schema migrations
    repositories/  # Typed data-access functions per table
                    #   profile, puzzles, streaks, records,
                    #   achievements, ratingHistory, settings
  engine/
    sudoku.ts       # Puzzle generation & solving (MRV-heuristic backtracking solver)
    dailyPuzzle.ts  # Deterministic daily puzzle seeding
  hooks/
    useDatabase.ts  # Loads/refreshes app state from SQLite into appStore
    useTimer.ts     # Elapsed-time timer for the active game
  navigation/
    Navigator.tsx   # Tab + stack navigation setup
  screens/
    HomeScreen, PlayScreen, ProgressScreen, ProfileScreen, GameScreen
  store/
    gameStore.ts    # Active game state: board, notes, selection, hints, undo history
    appStore.ts     # Cross-app state: profile, streaks, records, settings
  theme/
    ThemeContext.tsx, tokens.ts  # Light/dark color tokens & typography/spacing scale
  types/
    index.ts, navigation.ts     # Shared TypeScript types
  utils/
    haptics.ts, rating.ts       # Haptic feedback helpers, rating/level/formatting helpers
```

## Data Model (SQLite)

| Table              | Purpose                                                        |
|---------------------|-----------------------------------------------------------------|
| `profile`           | Single-row profile: name, rating, hint balance & hint progress |
| `puzzle_history`    | One row per completed puzzle (difficulty, time, mistakes, rating change, perfect/daily flags) |
| `streaks`           | Current/longest daily-play streak                              |
| `personal_records`  | Best-of records (fastest times, longest streak, etc.)          |
| `achievements`      | Unlock state and progress per achievement                      |
| `rating_history`    | Rating snapshots over time, for the progress chart             |
| `settings`          | Mistake highlighting / haptics toggles                         |

All migrations run automatically on first database access (`src/db/database.ts`), including `ALTER TABLE` migrations for columns added after the initial release.

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm
- Expo Go app on your phone, or an Android/iOS simulator

### Install & Run

```bash
npm install
npm start          # opens Expo Dev Tools / Metro bundler
```

Platform-specific shortcuts:

```bash
npm run android     # launch on Android emulator/device
npm run ios         # launch on iOS simulator (macOS only)
```

Scan the QR code shown in the terminal/Dev Tools with Expo Go to run on a physical device.

## Scripts

| Command           | Description                          |
|--------------------|---------------------------------------|
| `npm start`        | Start the Expo dev server            |
| `npm run android`  | Start and open on Android            |
| `npm run ios`      | Start and open on iOS                |

## Notes

- The app is fully offline — puzzle generation, solving, and all persistence happen on-device.
- The daily puzzle is generated deterministically from the date, so no server is required to keep it in sync across devices.
