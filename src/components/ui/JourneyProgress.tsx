import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing, radii } from '../../theme/tokens';
import { getJourneyLevel } from '../../utils/rating';

const LEVELS = ['Beginner', 'Pattern Spotter', 'Logic Explorer', 'Puzzle Analyst', 'Master Solver'];

interface Props {
  totalSolved: number;
  rating: number;
}

export default function JourneyProgress({ totalSolved, rating }: Props) {
  const { colors } = useTheme();
  const journey = getJourneyLevel(totalSolved, rating);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Your Journey</Text>

      <View style={styles.levelsContainer}>
        {LEVELS.map((level, idx) => {
          const isCompleted = idx < journey.level;
          const isCurrent = idx === journey.level;
          const isLocked = idx > journey.level;

          return (
            <View key={level} style={styles.levelRow}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isCompleted || isCurrent ? colors.primary : colors.border,
                    borderColor: isCurrent ? colors.primary : 'transparent',
                    width: isCurrent ? 14 : 10,
                    height: isCurrent ? 14 : 10,
                    borderRadius: isCurrent ? 7 : 5,
                    borderWidth: isCurrent ? 3 : 0,
                  },
                ]}
              />
              {idx < LEVELS.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted ? colors.primary : colors.border,
                    },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.levelName,
                  {
                    color: isCurrent
                      ? colors.primary
                      : isCompleted
                      ? colors.textPrimary
                      : colors.textTertiary,
                    fontWeight: isCurrent
                      ? typography.weights.bold
                      : typography.weights.regular,
                  },
                ]}
              >
                {level}
                {isCurrent && ' ←'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Progress bar for current level */}
      {journey.nextTitle && (
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.primaryLight }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(journey.progress * 100)}%` as any,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {Math.round(journey.progress * 100)}% to {journey.nextTitle}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  levelsContainer: {
    gap: 0,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dot: {
    marginTop: 3,
    flexShrink: 0,
  },
  connector: {
    position: 'absolute',
    left: 4,
    top: 14,
    width: 2,
    height: 24,
  },
  levelName: {
    fontSize: typography.sizes.md,
    paddingBottom: spacing.md,
  },
  progressSection: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
