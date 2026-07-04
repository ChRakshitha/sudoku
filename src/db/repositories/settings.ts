import { getDB } from '../database';

export interface AppSettings {
  mistakeHighlighting: boolean;
  hapticsEnabled: boolean;
}

interface SettingsRow {
  mistake_highlighting: number;
  haptics_enabled: number;
}

export function getSettings(): AppSettings {
  const row = getDB().getFirstSync<SettingsRow>(
    `SELECT mistake_highlighting, haptics_enabled FROM settings WHERE id = 1`,
  );
  return {
    mistakeHighlighting: (row?.mistake_highlighting ?? 1) === 1,
    hapticsEnabled: (row?.haptics_enabled ?? 1) === 1,
  };
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const merged = { ...current, ...partial };
  getDB().runSync(
    `UPDATE settings SET mistake_highlighting = ?, haptics_enabled = ? WHERE id = 1`,
    [merged.mistakeHighlighting ? 1 : 0, merged.hapticsEnabled ? 1 : 0],
  );
  return merged;
}
