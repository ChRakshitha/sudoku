import React, { memo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/tokens';

interface Props {
  value: number;
  notes: Set<number>;
  isGiven: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  isError: boolean;
  size: number;
  onPress: () => void;
}

function SudokuCell({
  value,
  notes,
  isGiven,
  isSelected,
  isHighlighted,
  isSameNumber,
  isError,
  size,
  onPress,
}: Props) {
  const { colors } = useTheme();

  const getBgColor = () => {
    if (isSelected) return colors.selectedBg;
    if (isError) return colors.errorBg;
    if (isSameNumber && value !== 0) return colors.sameNumberBg;
    if (isHighlighted) return colors.highlightBg;
    return 'transparent';
  };

  const getTextColor = () => {
    if (isError) return colors.error;
    if (isGiven) return colors.textPrimary;
    return colors.primary;
  };

  const fontSize = size > 40 ? typography.sizes.xl : typography.sizes.lg;
  const noteFontSize = size > 40 ? 9 : 8;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.cell, { width: '100%', height: '100%', backgroundColor: getBgColor() }]}
    >
      {value !== 0 ? (
        <Text
          style={[
            styles.value,
            {
              fontSize,
              color: getTextColor(),
              fontWeight: isGiven ? typography.weights.bold : typography.weights.medium,
            },
          ]}
        >
          {value}
        </Text>
      ) : notes.size > 0 ? (
        <View style={styles.notesGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <Text
              key={n}
              style={[
                styles.note,
                {
                  fontSize: noteFontSize,
                  color: notes.has(n) ? colors.note : 'transparent',
                },
              ]}
            >
              {n}
            </Text>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    textAlign: 'center',
  },
  notesGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  note: {
    width: '33.33%',
    textAlign: 'center',
    lineHeight: 11,
  },
});

export default memo(SudokuCell);
