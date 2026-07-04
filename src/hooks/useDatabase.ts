import { useEffect } from 'react';
import { getDB } from '../db/database';
import { getProfile } from '../db/repositories/profile';
import { getStreaks } from '../db/repositories/streaks';
import { getPersonalRecords } from '../db/repositories/records';
import { getTotalSolved, getTotalFocusMinutes } from '../db/repositories/puzzles';
import { getSettings } from '../db/repositories/settings';
import { useAppStore } from '../store/appStore';

export function useInitDatabase(): void {
  const { setProfile, setStreaks, setRecords, setStats, setSettings, setLoaded } = useAppStore();

  useEffect(() => {
    try {
      getDB(); // triggers migration on first call
      const profile = getProfile();
      const streaks = getStreaks();
      const records = getPersonalRecords();
      const totalSolved = getTotalSolved();
      const focusMinutes = getTotalFocusMinutes();
      const settings = getSettings();

      setProfile(profile);
      setStreaks(streaks);
      setRecords(records);
      setStats(totalSolved, focusMinutes);
      setSettings(settings);
      setLoaded(true);
    } catch (e) {
      console.error('DB init error', e);
    }
  }, []);
}

export function useRefreshAppState(): () => void {
  const { setProfile, setStreaks, setRecords, setStats } = useAppStore();

  return () => {
    const profile = getProfile();
    const streaks = getStreaks();
    const records = getPersonalRecords();
    const totalSolved = getTotalSolved();
    const focusMinutes = getTotalFocusMinutes();
    setProfile(profile);
    setStreaks(streaks);
    setRecords(records);
    setStats(totalSolved, focusMinutes);
  };
}
