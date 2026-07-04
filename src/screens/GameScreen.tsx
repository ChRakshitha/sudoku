import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { typography, spacing, radii } from '../theme/tokens';
import { useGameStore } from '../store/gameStore';
import { useAppStore } from '../store/appStore';
import { useGameTimer } from '../hooks/useTimer';
import { useRefreshAppState } from '../hooks/useDatabase';
import { generateDailyPuzzle, generateRandomPuzzle, getTodayString } from '../engine/dailyPuzzle';
import SudokuBoard from '../components/board/SudokuBoard';
import NumberPad from '../components/ui/NumberPad';
import GameControls from '../components/ui/GameControls';
import CompletionModal from '../components/ui/CompletionModal';
import PauseModal from '../components/ui/PauseModal';
import { formatTime, getDifficultyColor, calculateRatingChange } from '../utils/rating';
import { savePuzzleCompletion } from '../db/repositories/puzzles';
import { updateStreakForCompletion } from '../db/repositories/streaks';
import { checkAndUpdateRecords } from '../db/repositories/records';
import { checkAndGrantAchievements } from '../db/repositories/achievements';
import { addRatingEntry } from '../db/repositories/ratingHistory';
import { updateRating, getRating, awardHintProgress } from '../db/repositories/profile';
import { getTotalSolved, getTotalFocusMinutes } from '../db/repositories/puzzles';
import type { GameScreenProps } from '../types/navigation';
import type { CompletionResult, PuzzleConfig } from '../types';

export default function GameScreen({ route, navigation }: GameScreenProps) {
  const { difficulty, isDaily, puzzleId } = route.params;
  const { colors } = useTheme();
  const refreshAppState = useRefreshAppState();

  const { startGame, status, mistakes, pause, resume, reset } = useGameStore(s => ({
    startGame: s.startGame,
    status: s.status,
    mistakes: s.mistakes,
    pause: s.pause,
    resume: s.resume,
    reset: s.reset,
  }));

  const elapsed = useGameTimer();
  const showErrors = useAppStore(s => s.settings.mistakeHighlighting);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const hasSavedRef = useRef(false);

  // Generate / load puzzle once on mount
  const config: PuzzleConfig = useMemo(() => {
    if (isDaily) {
      const daily = generateDailyPuzzle();
      return {
        id: daily.id,
        difficulty: daily.difficulty,
        puzzle: daily.puzzle,
        solution: daily.solution,
        isDaily: true,
      };
    }
    const generated = generateRandomPuzzle(difficulty);
    return {
      id: generated.id,
      difficulty: generated.difficulty,
      puzzle: generated.puzzle,
      solution: generated.solution,
      isDaily: false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startGame(config);
    hasSavedRef.current = false;
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle completion
  useEffect(() => {
    if (status === 'completed' && !hasSavedRef.current) {
      hasSavedRef.current = true;
      const todayStr = getTodayString();
      const timeSeconds = elapsed;
      const isPerfect = mistakes === 0;
      const ratingChange = calculateRatingChange({ difficulty: config.difficulty, mistakes });
      const currentRating = getRating();
      const newRating = currentRating + ratingChange;

      updateRating(newRating);
      addRatingEntry(newRating);
      const hintsEarned = awardHintProgress(ratingChange);

      savePuzzleCompletion({
        puzzleId: config.id,
        difficulty: config.difficulty,
        timeSeconds,
        mistakes,
        ratingChange,
        isPerfect,
        isDaily: config.isDaily,
      });

      const streakResult = updateStreakForCompletion(todayStr);

      const newRecords = checkAndUpdateRecords({
        difficulty: config.difficulty,
        timeSeconds,
        currentStreak: streakResult.currentStreak,
        isPerfect,
        todayStr,
      });

      checkAndGrantAchievements({
        totalSolved: getTotalSolved(),
        currentStreak: streakResult.currentStreak,
        rating: newRating,
        focusMinutes: getTotalFocusMinutes(),
        isPerfect,
        difficulty: config.difficulty,
        consecutivePerfect: 0,
      });

      refreshAppState();

      setCompletionResult({
        timeSeconds,
        mistakes,
        ratingChange,
        newRating,
        isPerfect,
        newRecords,
        streakContinued: streakResult.continued || streakResult.currentStreak === 1,
        currentStreak: streakResult.currentStreak,
        hintsEarned,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleResume = useCallback(() => {
    resume();
  }, [resume]);

  const handleExit = useCallback(() => {
    reset();
    navigation.goBack();
  }, [navigation, reset]);

  const handlePlayAgain = useCallback(() => {
    setCompletionResult(null);
    hasSavedRef.current = false;
    const generated = generateRandomPuzzle(config.difficulty);
    startGame({
      id: generated.id,
      difficulty: generated.difficulty,
      puzzle: generated.puzzle,
      solution: generated.solution,
      isDaily: false,
    });
  }, [config.difficulty, startGame]);

  const handleHome = useCallback(() => {
    reset();
    navigation.goBack();
  }, [navigation, reset]);

  const diffColor = getDifficultyColor(config.difficulty);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePause} style={styles.headerBtn}>
          <Ionicons name="close" size={26} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.diffBadge, { backgroundColor: `${diffColor}18` }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>
              {config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handlePause} style={styles.headerBtn}>
          <Ionicons name="pause" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textPrimary }]}>
            {formatTime(elapsed)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="close-circle-outline" size={16} color={mistakes > 0 ? colors.error : colors.textSecondary} />
          <Text style={[styles.statText, { color: mistakes > 0 ? colors.error : colors.textPrimary }]}>
            {mistakes} {mistakes === 1 ? 'mistake' : 'mistakes'}
          </Text>
        </View>
      </View>

      {/* Board */}
      <View style={styles.boardWrap}>
        <SudokuBoard showErrors={showErrors} />
      </View>

      {/* Controls */}
      <View style={styles.bottom}>
        <GameControls />
        <NumberPad />
      </View>

      <PauseModal
        visible={status === 'paused'}
        elapsed={elapsed}
        onResume={handleResume}
        onHome={handleExit}
      />

      <CompletionModal
        visible={status === 'completed' && completionResult !== null}
        result={completionResult}
        difficulty={config.difficulty}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  diffBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  diffText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['3xl'],
    paddingVertical: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  bottom: {
    paddingBottom: spacing.lg,
  },
});
