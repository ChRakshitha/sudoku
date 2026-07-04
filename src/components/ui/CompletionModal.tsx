import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing, radii } from '../../theme/tokens';
import { formatTime, getDifficultyColor } from '../../utils/rating';
import type { CompletionResult } from '../../types';
import type { Difficulty } from '../../types';

interface Props {
  visible: boolean;
  result: CompletionResult | null;
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onHome: () => void;
}

export default function CompletionModal({ visible, result, difficulty, onPlayAgain, onHome }: Props) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!result) return null;

  const diffColor = getDifficultyColor(difficulty);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.successBg }]}>
              <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Puzzle Complete
            </Text>
            {result.isPerfect && (
              <View style={[styles.badge, { backgroundColor: colors.successBg }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Perfect Solve</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { borderColor: colors.border }]}>
            <Stat label="Time" value={formatTime(result.timeSeconds)} color={colors.textPrimary} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Stat label="Mistakes" value={String(result.mistakes)} color={result.mistakes === 0 ? colors.success : colors.error} />
          </View>

          {/* Rating */}
          <View style={[styles.ratingRow, { backgroundColor: colors.primaryLight }]}>
            <View style={styles.ratingItem}>
              <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Rating Change</Text>
              <Text style={[styles.ratingValue, { color: colors.primary }]}>
                +{result.ratingChange}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.ratingItem}>
              <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>New Rating</Text>
              <Text style={[styles.ratingValue, { color: colors.primary }]}>
                {result.newRating}
              </Text>
            </View>
          </View>

          {/* Hints earned */}
          {result.hintsEarned > 0 && (
            <View style={[styles.streakRow, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="bulb" size={18} color={colors.primary} />
              <Text style={[styles.streakText, { color: colors.primary }]}>
                +{result.hintsEarned} {result.hintsEarned === 1 ? 'Hint' : 'Hints'} Earned
              </Text>
            </View>
          )}

          {/* Streak */}
          {result.streakContinued && (
            <View style={[styles.streakRow, { backgroundColor: colors.streakBg }]}>
              <Text style={{ fontSize: 20 }}>🔥</Text>
              <Text style={[styles.streakText, { color: colors.streak }]}>
                {result.currentStreak} Day Streak!
              </Text>
            </View>
          )}

          {/* New Records */}
          {result.newRecords.length > 0 && (
            <View style={styles.recordsSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>New Records</Text>
              {result.newRecords.map(r => (
                <View key={r} style={styles.recordRow}>
                  <Ionicons name="trophy" size={14} color={colors.streak} />
                  <Text style={[styles.recordText, { color: colors.textPrimary }]}>{r}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onHome}
              style={[styles.btn, styles.btnSecondary, { borderColor: colors.border }]}
            >
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPlayAgain}
              style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  card: {
    width: '100%',
    borderRadius: radii.xl,
    padding: spacing['2xl'],
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
  },
  ratingRow: {
    flexDirection: 'row',
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  ratingItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2,
  },
  ratingLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  ratingValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  streakText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  recordsSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  btnPrimary: {},
  btnSecondary: {
    borderWidth: 1.5,
  },
  btnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
