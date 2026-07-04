import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing, radii } from '../../theme/tokens';
import { formatTime } from '../../utils/rating';

interface Props {
  visible: boolean;
  elapsed: number;
  onResume: () => void;
  onHome: () => void;
}

export default function PauseModal({ visible, elapsed, onResume, onHome }: Props) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="pause" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Paused</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(elapsed)}</Text>

          <TouchableOpacity
            onPress={onResume}
            style={[styles.resumeBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.resumeText}>Resume</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onHome}
            style={[styles.homeBtn, { borderColor: colors.border }]}
          >
            <Text style={[styles.homeText, { color: colors.textSecondary }]}>Exit Puzzle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radii.xl,
    padding: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
  },
  time: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['3xl'],
    borderRadius: radii.md,
    width: '100%',
    justifyContent: 'center',
  },
  resumeText: {
    color: '#fff',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  homeBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['3xl'],
    borderRadius: radii.md,
    borderWidth: 1.5,
    width: '100%',
    alignItems: 'center',
  },
  homeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
