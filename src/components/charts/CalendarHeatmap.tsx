import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing, radii } from '../../theme/tokens';
import type { DailyActivity } from '../../types';

interface Props {
  data: DailyActivity[];
  weeks?: number;
}

export default function CalendarHeatmap({ data, weeks = 13 }: Props) {
  const { colors } = useTheme();
  const totalDays = weeks * 7;

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of data) map.set(d.date, d.count);
    return map;
  }, [data]);

  const days = useMemo(() => {
    const result: Array<{ dateStr: string; count: number; dayOfWeek: number }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      result.push({ dateStr, count: activityMap.get(dateStr) ?? 0, dayOfWeek: d.getDay() });
    }
    return result;
  }, [activityMap, totalDays]);

  const maxCount = Math.max(...days.map(d => d.count), 1);

  const getCellColor = (count: number): string => {
    if (count === 0) return colors.border;
    const intensity = Math.min(count / maxCount, 1);
    const alpha = Math.round(intensity * 0.85 * 255).toString(16).padStart(2, '0');
    return `${colors.primary}${alpha}`;
  };

  const screenWidth = Dimensions.get('window').width - 64;
  const cellSize = Math.floor((screenWidth - spacing.xl) / weeks) - 2;
  const gap = 2;

  // Group into columns (weeks)
  const columns: Array<typeof days> = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(days.slice(w * 7, (w + 1) * 7));
  }

  const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Monthly Activity</Text>

      <View style={styles.grid}>
        <View style={styles.dayLabels}>
          {DAYS.map((d, i) => (
            <Text
              key={i}
              style={[styles.dayLabel, { color: colors.textTertiary, height: cellSize + gap }]}
            >
              {i % 2 === 1 ? d : ''}
            </Text>
          ))}
        </View>

        <View style={styles.columns}>
          {columns.map((col, wi) => (
            <View key={wi} style={[styles.column, { gap }]}>
              {col.map((day, di) => (
                <View
                  key={day.dateStr}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getCellColor(day.count),
                      borderRadius: 2,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>Less</Text>
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <View
            key={t}
            style={[
              styles.legendCell,
              {
                backgroundColor: t === 0 ? colors.border : `${colors.primary}${Math.round(t * 0.85 * 255).toString(16).padStart(2, '0')}`,
              },
            ]}
          />
        ))}
        <Text style={[styles.legendLabel, { color: colors.textTertiary }]}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dayLabels: {
    gap: 2,
  },
  dayLabel: {
    fontSize: 9,
    color: '#888',
    textAlign: 'center',
    width: 12,
    lineHeight: 12,
  },
  columns: {
    flexDirection: 'row',
    gap: 2,
    flex: 1,
  },
  column: {
    flex: 1,
  },
  cell: {},
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },
  legendLabel: {
    fontSize: 10,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
