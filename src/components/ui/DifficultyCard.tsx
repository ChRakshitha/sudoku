import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing, radii } from '../../theme/tokens';
import { getDifficultyColor, getEstimatedTime, formatTime } from '../../utils/rating';
import type { Difficulty } from '../../types';

interface Props {
  difficulty: Difficulty;
  bestTime: number | null;
  completedCount: number;
  onPress: () => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

const DIFFICULTY_ICONS: Record<Difficulty, string> = {
  easy: 'leaf-outline',
  medium: 'flame-outline',
  hard: 'thunderstorm-outline',
  expert: 'skull-outline',
};

export default function DifficultyCard({ difficulty, bestTime, completedCount, onPress }: Props) {
  const { colors } = useTheme();
  const diffColor = getDifficultyColor(difficulty);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${diffColor}18` }]}>
        <Ionicons name={DIFFICULTY_ICONS[difficulty] as any} size={22} color={diffColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {DIFFICULTY_LABELS[difficulty]}
        </Text>
        <Text style={[styles.estimate, { color: colors.textSecondary }]}>
          {getEstimatedTime(difficulty)}
        </Text>
      </View>
      <View style={styles.right}>
        {bestTime !== null ? (
          <Text style={[styles.bestTime, { color: diffColor }]}>{formatTime(bestTime)}</Text>
        ) : (
          <Text style={[styles.bestTime, { color: colors.textTertiary }]}>—</Text>
        )}
        <Text style={[styles.count, { color: colors.textTertiary }]}>
          {completedCount}×
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  estimate: {
    fontSize: typography.sizes.sm,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  bestTime: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  count: {
    fontSize: typography.sizes.sm,
  },
});
