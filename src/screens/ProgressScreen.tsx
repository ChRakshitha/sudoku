import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { typography, spacing, radii } from '../theme/tokens';
import { useAppStore } from '../store/appStore';
import RatingChart from '../components/charts/RatingChart';
import CalendarHeatmap from '../components/charts/CalendarHeatmap';
import { getRatingHistory } from '../db/repositories/ratingHistory';
import { getDailyActivity, getSolvedCountByDifficulty } from '../db/repositories/puzzles';
import { getDifficultyColor, formatTime } from '../utils/rating';
import type { Difficulty } from '../types';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { profile, streaks, records, totalSolved, focusMinutes, isLoaded } = useAppStore();

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} />
    );
  }

  const ratingHistory = getRatingHistory(30);
  const dailyActivity = getDailyActivity(91);
  const difficultyCounts = getSolvedCountByDifficulty();
  const maxCount = Math.max(...DIFFICULTIES.map(d => difficultyCounts[d]), 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Progress</Text>

        {/* Overview */}
        <View style={styles.overviewGrid}>
          <OverviewCard
            icon="trophy-outline"
            label="Rating"
            value={String(profile?.rating ?? 1000)}
            colors={colors}
          />
          <OverviewCard
            icon="grid-outline"
            label="Puzzles Solved"
            value={String(totalSolved)}
            colors={colors}
          />
          <OverviewCard
            icon="time-outline"
            label="Focus Time"
            value={`${focusMinutes}m`}
            colors={colors}
          />
          <OverviewCard
            icon="flame-outline"
            label="Current Streak"
            value={`${streaks.currentStreak}d`}
            colors={colors}
          />
        </View>

        {/* Rating Chart */}
        <RatingChart data={ratingHistory} />

        {/* Calendar Heatmap */}
        <CalendarHeatmap data={dailyActivity} />

        {/* Difficulty Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Difficulty Breakdown</Text>
          <View style={styles.breakdownList}>
            {DIFFICULTIES.map(diff => {
              const count = difficultyCounts[diff];
              const widthPct = (count / maxCount) * 100;
              const color = getDifficultyColor(diff);
              return (
                <View key={diff} style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                  <View style={[styles.breakdownTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.breakdownFill,
                        { width: `${widthPct}%` as any, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.breakdownCount, { color: colors.textPrimary }]}>
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Personal Records */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Personal Records</Text>
          <View style={styles.recordsGrid}>
            <RecordItem label="Fastest Easy" value={records.fastestEasy} colors={colors} />
            <RecordItem label="Fastest Medium" value={records.fastestMedium} colors={colors} />
            <RecordItem label="Fastest Hard" value={records.fastestHard} colors={colors} />
            <RecordItem label="Fastest Expert" value={records.fastestExpert} colors={colors} />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.recordsGrid}>
            <View style={styles.recordItem}>
              <Text style={[styles.recordValue, { color: colors.textPrimary }]}>
                {records.longestStreak}
              </Text>
              <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>
                Longest Streak
              </Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={[styles.recordValue, { color: colors.textPrimary }]}>
                {records.mostInOneDay}
              </Text>
              <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>
                Most in One Day
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={[styles.overviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={18} color={colors.primary} />
      <Text style={[styles.overviewValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function RecordItem({ label, value, colors }: { label: string; value: number | null; colors: any }) {
  return (
    <View style={styles.recordItem}>
      <Text style={[styles.recordValue, { color: colors.textPrimary }]}>
        {value !== null ? formatTime(value) : '—'}
      </Text>
      <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
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
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  overviewCard: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  overviewValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  overviewLabel: {
    fontSize: typography.sizes.sm,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  breakdownList: {
    gap: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  breakdownLabel: {
    width: 64,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  breakdownTrack: {
    flex: 1,
    height: 8,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  breakdownCount: {
    width: 28,
    textAlign: 'right',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  recordItem: {
    flexBasis: '45%',
    flexGrow: 1,
    gap: 2,
  },
  recordValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  recordLabel: {
    fontSize: typography.sizes.sm,
  },
  divider: {
    height: 1,
  },
});
