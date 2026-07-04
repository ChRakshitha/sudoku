import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { typography, spacing, radii } from '../theme/tokens';
import { useAppStore } from '../store/appStore';
import StreakCard from '../components/ui/StreakCard';
import JourneyProgress from '../components/ui/JourneyProgress';
import { getDailyPuzzleId, getDailyDifficulty, getTodayString } from '../engine/dailyPuzzle';
import { wasDailyCompletedToday } from '../db/repositories/puzzles';
import { formatTime, getDifficultyColor } from '../utils/rating';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { profile, streaks, records, totalSolved, isLoaded } = useAppStore();

  const todayStr = getTodayString();
  const dailyCompleted = isLoaded ? wasDailyCompletedToday(todayStr) : false;
  const dailyDifficulty = getDailyDifficulty();
  const diffColor = getDifficultyColor(dailyDifficulty);

  const handleDailyPuzzle = useCallback(() => {
    navigation.navigate('Game', {
      difficulty: dailyDifficulty,
      isDaily: true,
      puzzleId: getDailyPuzzleId(),
    });
  }, [dailyDifficulty, navigation]);

  const recentRecord = (() => {
    if (records.fastestEasy !== null) return { label: 'Fastest Easy', value: formatTime(records.fastestEasy) };
    if (records.fastestMedium !== null) return { label: 'Fastest Medium', value: formatTime(records.fastestMedium) };
    return null;
  })();

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: colors.textTertiary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good day,</Text>
            <Text style={[styles.name, { color: colors.textPrimary }]}>
              {profile?.name ?? 'Solver'}
            </Text>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.ratingText, { color: colors.primary }]}>
              {profile?.rating ?? 1000}
            </Text>
            <Text style={[styles.ratingLabel, { color: colors.primary }]}>pts</Text>
          </View>
        </View>

        {/* Streak Card */}
        <StreakCard
          currentStreak={streaks.currentStreak}
          longestStreak={streaks.longestStreak}
        />

        {/* Today's Status */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: dailyCompleted ? colors.successBg : colors.surface,
              borderColor: dailyCompleted ? colors.success : colors.border,
            },
          ]}
        >
          <View style={styles.statusLeft}>
            <Ionicons
              name={dailyCompleted ? 'checkmark-circle' : 'today-outline'}
              size={24}
              color={dailyCompleted ? colors.success : colors.textSecondary}
            />
            <View>
              <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
                Daily Puzzle
              </Text>
              <Text style={[styles.statusSub, { color: dailyCompleted ? colors.success : colors.textSecondary }]}>
                {dailyCompleted ? 'Completed today!' : 'Not yet completed'}
              </Text>
            </View>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: `${diffColor}20` }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>
              {dailyDifficulty.charAt(0).toUpperCase() + dailyDifficulty.slice(1)}
            </Text>
          </View>
        </View>

        {/* Quick Start */}
        <TouchableOpacity
          onPress={handleDailyPuzzle}
          activeOpacity={0.85}
          style={[styles.ctaButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="play-circle" size={22} color="#fff" />
          <Text style={styles.ctaText}>
            {dailyCompleted ? 'Play Daily Again' : 'Start Daily Puzzle'}
          </Text>
        </TouchableOpacity>

        {/* Journey Progress */}
        <JourneyProgress totalSolved={totalSolved} rating={profile?.rating ?? 1000} />

        {/* Recent Record */}
        {recentRecord && (
          <View style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.trophyWrap, { backgroundColor: colors.streakBg }]}>
              <Text style={{ fontSize: 20 }}>🏆</Text>
            </View>
            <View style={styles.recordInfo}>
              <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>Personal Best</Text>
              <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>
                {recentRecord.label}
              </Text>
            </View>
            <Text style={[styles.recordValue, { color: colors.primary }]}>
              {recentRecord.value}
            </Text>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox
            label="Puzzles Solved"
            value={String(totalSolved)}
            icon="grid-outline"
            color={colors.primary}
            colors={colors}
          />
          <StatBox
            label="Focus Time"
            value={`${useAppStore.getState().focusMinutes}m`}
            icon="time-outline"
            color={colors.success}
            colors={colors}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  colors: any;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: typography.sizes.md },
  scroll: {
    padding: spacing['2xl'],
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  name: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  ratingText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  ratingLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  statusSub: {
    fontSize: typography.sizes.sm,
    marginTop: 1,
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
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    borderRadius: radii.lg,
  },
  ctaText: {
    color: '#fff',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  trophyWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: { flex: 1 },
  recordLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium },
  recordTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold },
  recordValue: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
  },
});
