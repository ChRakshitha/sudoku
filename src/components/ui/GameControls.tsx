import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing } from '../../theme/tokens';
import { useGameStore } from '../../store/gameStore';
import { useAppStore } from '../../store/appStore';
import { spendHint } from '../../db/repositories/profile';
import { triggerImpact } from '../../utils/haptics';

interface ControlItem {
  icon: string;
  label: string;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export default function GameControls() {
  const { colors } = useTheme();
  const { toggleNotesMode, undo, eraseCell, applyHint, isNotesMode, history } = useGameStore(s => ({
    toggleNotesMode: s.toggleNotesMode,
    undo: s.undo,
    eraseCell: s.eraseCell,
    applyHint: s.applyHint,
    isNotesMode: s.isNotesMode,
    history: s.history,
  }));
  const hints = useAppStore(s => s.profile?.hints ?? 0);
  const decrementHints = useAppStore(s => s.decrementHints);

  const handleHint = () => {
    if (hints <= 0) return;
    if (!applyHint()) return;
    spendHint();
    decrementHints();
    triggerImpact();
  };

  const controls: ControlItem[] = [
    {
      icon: 'arrow-undo',
      label: 'Undo',
      action: () => {
        triggerImpact();
        undo();
      },
    },
    {
      icon: 'backspace-outline',
      label: 'Erase',
      action: () => {
        triggerImpact();
        eraseCell();
      },
    },
    {
      icon: 'pencil',
      label: 'Notes',
      action: () => {
        triggerImpact();
        toggleNotesMode();
      },
      isActive: isNotesMode,
    },
    {
      icon: 'bulb-outline',
      label: `Hint (${hints})`,
      action: handleHint,
      disabled: hints <= 0,
    },
  ];

  return (
    <View style={styles.container}>
      {controls.map(ctrl => (
        <TouchableOpacity
          key={ctrl.label}
          onPress={ctrl.action}
          activeOpacity={0.7}
          disabled={ctrl.disabled}
          style={[
            styles.control,
            ctrl.isActive && { backgroundColor: colors.primaryLight },
            ctrl.disabled && { opacity: 0.4 },
          ]}
        >
          <View
            style={[
              styles.iconWrap,
              { borderColor: ctrl.isActive ? colors.primary : colors.border },
            ]}
          >
            <Ionicons
              name={ctrl.icon as any}
              size={22}
              color={ctrl.isActive ? colors.primary : colors.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.label,
              { color: ctrl.isActive ? colors.primary : colors.textSecondary },
            ]}
          >
            {ctrl.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  control: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
