import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameTimer(): number {
  const [elapsed, setElapsed] = useState(0);
  const status = useGameStore(s => s.status);
  const getElapsedSeconds = useGameStore(s => s.getElapsedSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === 'playing') {
      intervalRef.current = setInterval(() => {
        setElapsed(getElapsedSeconds());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsed(getElapsedSeconds());
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  return elapsed;
}
