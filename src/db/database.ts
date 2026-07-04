import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('sudoku_journey.db');
    runMigrations(_db);
  }
  return _db;
}

function runMigrations(db: SQLite.SQLiteDatabase): void {
  db.execSync(`PRAGMA journal_mode = WAL;`);
  db.execSync(`PRAGMA foreign_keys = ON;`);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL DEFAULT 'Solver',
      rating INTEGER NOT NULL DEFAULT 1000,
      hints INTEGER NOT NULL DEFAULT 3,
      hint_progress INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (date('now'))
    );
  `);

  // Migrate installs created before hints existed
  try { db.execSync(`ALTER TABLE profile ADD COLUMN hints INTEGER NOT NULL DEFAULT 3;`); } catch {}
  try { db.execSync(`ALTER TABLE profile ADD COLUMN hint_progress INTEGER NOT NULL DEFAULT 0;`); } catch {}

  db.execSync(`
    CREATE TABLE IF NOT EXISTS puzzle_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      puzzle_id TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      time_seconds INTEGER NOT NULL,
      mistakes INTEGER NOT NULL DEFAULT 0,
      rating_change INTEGER NOT NULL DEFAULT 0,
      is_perfect INTEGER NOT NULL DEFAULT 0,
      is_daily INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY DEFAULT 1,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_played_date TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS personal_records (
      record_type TEXT PRIMARY KEY,
      value_int INTEGER,
      value_real REAL,
      achieved_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      unlocked_at TEXT,
      progress INTEGER NOT NULL DEFAULT 0
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS rating_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rating INTEGER NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      mistake_highlighting INTEGER NOT NULL DEFAULT 1,
      haptics_enabled INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Seed initial rows (idempotent with INSERT OR IGNORE)
  db.execSync(`INSERT OR IGNORE INTO profile (id) VALUES (1);`);
  db.execSync(`INSERT OR IGNORE INTO streaks (id) VALUES (1);`);
  db.execSync(`INSERT OR IGNORE INTO settings (id) VALUES (1);`);
}
