import { create } from 'zustand';
import type { Profile, StreakData, PersonalRecords } from '../types';
import type { AppSettings } from '../db/repositories/settings';

interface AppState {
  profile: Profile | null;
  streaks: StreakData;
  records: PersonalRecords;
  totalSolved: number;
  focusMinutes: number;
  settings: AppSettings;
  isLoaded: boolean;

  setProfile: (profile: Profile) => void;
  setStreaks: (streaks: StreakData) => void;
  setRecords: (records: PersonalRecords) => void;
  setStats: (totalSolved: number, focusMinutes: number) => void;
  setSettings: (settings: AppSettings) => void;
  setLoaded: (loaded: boolean) => void;
  updateRating: (newRating: number) => void;
  decrementHints: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  streaks: { currentStreak: 0, longestStreak: 0, lastPlayedDate: null },
  records: {
    fastestEasy: null,
    fastestMedium: null,
    fastestHard: null,
    fastestExpert: null,
    longestStreak: 0,
    mostInOneDay: 0,
    consecutivePerfect: 0,
  },
  totalSolved: 0,
  focusMinutes: 0,
  settings: { mistakeHighlighting: true, hapticsEnabled: true },
  isLoaded: false,

  setProfile: (profile) => set({ profile }),
  setStreaks: (streaks) => set({ streaks }),
  setRecords: (records) => set({ records }),
  setStats: (totalSolved, focusMinutes) => set({ totalSolved, focusMinutes }),
  setSettings: (settings) => set({ settings }),
  setLoaded: (isLoaded) => set({ isLoaded }),
  updateRating: (newRating) =>
    set(s => ({
      profile: s.profile ? { ...s.profile, rating: newRating } : s.profile,
    })),
  decrementHints: () =>
    set(s => ({
      profile: s.profile ? { ...s.profile, hints: Math.max(0, s.profile.hints - 1) } : s.profile,
    })),
}));
