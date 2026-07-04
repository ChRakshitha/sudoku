import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing } from '../../theme/tokens';
import { useGameStore } from '../../store/gameStore';
import { triggerImpact } from '../../utils/haptics';

export default function NumberPad() {
  const { colors } = useTheme();
  const { enterNumber, board, config, pendingNumber, setPendingNumber } = useGameStore(s => ({
    enterNumber: s.enterNumber,
    board: s.board,
    config: s.config,
    pendingNumber: s.pendingNumber,
    setPendingNumber: s.setPendingNumber,
  }));

  const getUsedCount = (num: number): number => {
    if (!board.length) return 0;
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell === num) count++;
      }
    }
    return count;
  };

  const handlePress = (num: number) => {
    triggerImpact();
    if (pendingNumber !== null) setPendingNumber(null);
    enterNumber(num);
  };

  const handleLongPress = (num: number) => {
    triggerImpact();
    setPendingNumber(num);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
        const used = getUsedCount(num);
        const exhausted = used >= 9;
        const isPending = pendingNumber === num;
        return (
          <TouchableOpacity
            key={num}
            onPress={() => handlePress(num)}
            onLongPress={() => handleLongPress(num)}
            delayLongPress={350}
            activeOpacity={0.6}
            disabled={exhausted}
            style={[
              styles.button,
              {
                backgroundColor: isPending ? colors.primary : colors.surface,
                borderColor: isPending ? colors.primary : colors.border,
                opacity: exhausted ? 0.3 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.number,
                {
                  color: isPending ? colors.surface : colors.textPrimary,
                },
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 6,
  },
  button: {
    flex: 1,
    aspectRatio: 0.75,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  number: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
  },
});
