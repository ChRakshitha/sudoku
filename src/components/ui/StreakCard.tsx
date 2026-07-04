import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing, radii } from '../../theme/tokens';

interface Props {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCard({ currentStreak, longestStreak }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.left}>
        <View style={styles.flameRow}>
          <Text style={styles.flame}>🔥</Text>
          <View>
            <Text style={[styles.streakNumber, { color: colors.streak }]}>
              {currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              Day Streak
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.right}>
        <Text style={[styles.recordValue, { color: colors.textPrimary }]}>
          {longestStreak}
        </Text>
        <Text style={[styles.recordLabel, { color: colors.textSecondary }]}>Best Streak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 1,
    alignItems: 'center',
  },
  flameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flame: {
    fontSize: 36,
  },
  streakNumber: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    lineHeight: 36,
  },
  streakLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  divider: {
    width: 1,
    height: 48,
    marginHorizontal: spacing.xl,
  },
  recordValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  recordLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
