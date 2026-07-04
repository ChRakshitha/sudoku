import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { typography, spacing, radii } from '../theme/tokens';
import DifficultyCard from '../components/ui/DifficultyCard';
import { getPersonalRecords } from '../db/repositories/records';
import { getSolvedCountByDifficulty } from '../db/repositories/puzzles';
import { getDailyPuzzleId, getDailyDifficulty, getTodayString } from '../engine/dailyPuzzle';
import { wasDailyCompletedToday } from '../db/repositories/puzzles';
import { getDifficultyColor, formatTime } from '../utils/rating';
import type { Difficulty } from '../types';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export default function PlayScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState<Difficulty | null>(null);

  const records = getPersonalRecords();
  const counts = getSolvedCountByDifficulty();
  const todayStr = getTodayString();
  const dailyCompleted = wasDailyCompletedToday(todayStr);
  const dailyDifficulty = getDailyDifficulty();
  const diffColor = getDifficultyColor(dailyDifficulty);

  const getBestTime = (difficulty: Difficulty): number | null => {
    const map: Record<Difficulty, number | null> = {
      easy: records.fastestEasy,
      medium: records.fastestMedium,
      hard: records.fastestHard,
      expert: records.fastestExpert,
    };
    return map[difficulty];
  };

  const handleDifficulty = useCallback(
    async (difficulty: Difficulty) => {
      setLoading(difficulty);
      // Small delay to show loading state, then navigate (generation happens in GameScreen)
      setTimeout(() => {
        setLoading(null);
        navigation.navigate('Game', {
          difficulty,
          isDaily: false,
          puzzleId: `${difficulty}-${Date.now()}`,
        });
      }, 50);
    },
    [navigation],
  );

  const handleDaily = useCallback(() => {
    navigation.navigate('Game', {
      difficulty: dailyDifficulty,
      isDaily: true,
      puzzleId: getDailyPuzzleId(),
    });
  }, [dailyDifficulty, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Play</Text>

        {/* Daily Puzzle Section */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Daily Puzzle</Text>
          <TouchableOpacity
            onPress={handleDaily}
            activeOpacity={0.85}
            style={[
              styles.dailyCard,
              {
                backgroundColor: colors.surface,
                borderColor: dailyCompleted ? colors.success : diffColor,
                borderWidth: dailyCompleted ? 1 : 1.5,
              },
            ]}
          >
            <View style={styles.dailyLeft}>
              <View
                style={[
                  styles.calIcon,
                  {
                    backgroundColor: dailyCompleted ? colors.successBg : `${diffColor}18`,
                  },
                ]}
              >
                <Ionicons
                  name={dailyCompleted ? 'checkmark-circle' : 'calendar-outline'}
                  size={28}
                  color={dailyCompleted ? colors.success : diffColor}
                />
              </View>
              <View>
                <Text style={[styles.dailyTitle, { color: colors.textPrimary }]}>
                  Today's Challenge
                </Text>
                <Text style={[styles.dailySub, { color: colors.textSecondary }]}>
                  {dailyDifficulty.charAt(0).toUpperCase() + dailyDifficulty.slice(1)} •{' '}
                  {dailyCompleted ? 'Completed' : 'Not started'}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Choose Difficulty */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Choose Difficulty
          </Text>
          <View style={styles.diffList}>
            {DIFFICULTIES.map(diff => (
              <View key={diff} style={styles.diffRow}>
                {loading === diff ? (
                  <View
                    style={[
                      styles.loadingCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Generating...
                    </Text>
                  </View>
                ) : (
                  <DifficultyCard
                    difficulty={diff}
                    bestTime={getBestTime(diff)}
                    completedCount={counts[diff]}
                    onPress={() => handleDifficulty(diff)}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: spacing['2xl'],
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  screenTitle: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  section: {
    gap: 0,
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  dailyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  calIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  dailySub: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  diffList: {
    gap: spacing.md,
  },
  diffRow: {},
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    height: 70,
  },
  loadingText: {
    fontSize: typography.sizes.md,
  },
});
