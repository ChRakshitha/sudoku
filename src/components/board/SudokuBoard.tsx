import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import SudokuCell from './SudokuCell';
import { useGameStore } from '../../store/gameStore';
import { triggerSelection } from '../../utils/haptics';

const BOARD_PADDING = 16;
const THIN = 0.5;
const THICK = 2;

function SudokuBoard({ showErrors }: { showErrors: boolean }) {
  const { colors } = useTheme();
  const { config, board, notes, selectedCell, selectCell, status, pendingNumber, enterNumber } = useGameStore(s => ({
    config: s.config,
    board: s.board,
    notes: s.notes,
    selectedCell: s.selectedCell,
    selectCell: s.selectCell,
    status: s.status,
    pendingNumber: s.pendingNumber,
    enterNumber: s.enterNumber,
  }));

  if (!config) return null;

  const screenWidth = Dimensions.get('window').width;
  const boardSize = Math.min(screenWidth - BOARD_PADDING * 2, 400);
  // Border is drawn inside the box (border-box sizing), so cells must fill
  // the content area (boardSize minus the outer border on both sides), not
  // the full boardSize, or the last row/column overflow past the border.
  const innerSize = boardSize - THICK * 2;
  const cellSize = innerSize / 9;

  const selectedValue =
    selectedCell ? board[selectedCell.row][selectedCell.col] : 0;

  const handleCellPress = (row: number, col: number) => {
    if (status !== 'playing') return;
    triggerSelection();
    if (pendingNumber !== null) {
      selectCell({ row, col });
      enterNumber(pendingNumber);
      return;
    }
    if (selectedCell?.row === row && selectedCell?.col === col) {
      selectCell(null);
    } else {
      selectCell({ row, col });
    }
  };

  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const { row: sr, col: sc } = selectedCell;
    return (
      row === sr ||
      col === sc ||
      (Math.floor(row / 3) === Math.floor(sr / 3) && Math.floor(col / 3) === Math.floor(sc / 3))
    );
  };

  const isSameNumber = (row: number, col: number): boolean => {
    if (!selectedValue || selectedValue === 0) return false;
    return board[row][col] === selectedValue;
  };

  const isError = (row: number, col: number): boolean => {
    if (!showErrors) return false;
    const v = board[row][col];
    return v !== 0 && v !== config.solution[row][col];
  };

  return (
    <View
      style={[
        styles.board,
        {
          width: boardSize,
          height: boardSize,
          borderColor: colors.borderStrong,
          borderWidth: THICK,
        },
      ]}
    >
      {Array.from({ length: 9 }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: 9 }, (_, col) => {
            const isSelected =
              selectedCell?.row === row && selectedCell?.col === col;

            const borderRight =
              col === 2 || col === 5 ? THICK : THIN;
            const borderBottom =
              row === 2 || row === 5 ? THICK : THIN;
            const borderRightColor = col === 2 || col === 5
              ? colors.borderStrong
              : colors.border;
            const borderBottomColor = row === 2 || row === 5
              ? colors.borderStrong
              : colors.border;

            return (
              <View
                key={col}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRightWidth: col < 8 ? borderRight : 0,
                  borderBottomWidth: row < 8 ? borderBottom : 0,
                  borderRightColor,
                  borderBottomColor,
                }}
              >
                <SudokuCell
                  value={board[row][col]}
                  notes={notes[row][col]}
                  isGiven={config.puzzle[row][col] !== 0}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted(row, col)}
                  isSameNumber={isSameNumber(row, col)}
                  isError={isError(row, col)}
                  size={cellSize}
                  onPress={() => handleCellPress(row, col)}
                />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});

export default memo(SudokuBoard);
