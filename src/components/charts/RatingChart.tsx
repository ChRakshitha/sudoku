import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { typography, spacing, radii } from '../../theme/tokens';
import type { RatingEntry } from '../../types';

interface Props {
  data: RatingEntry[];
}

export default function RatingChart({ data }: Props) {
  const { colors } = useTheme();
  const width = Dimensions.get('window').width - 64;
  const height = 140;
  const padX = 8;
  const padY = 12;

  if (data.length < 2) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          Complete more puzzles to see your rating chart
        </Text>
      </View>
    );
  }

  const ratings = data.map(d => d.rating);
  const minR = Math.min(...ratings) - 10;
  const maxR = Math.max(...ratings) + 10;
  const range = maxR - minR || 1;

  const toX = (i: number) => padX + (i / (data.length - 1)) * (width - padX * 2);
  const toY = (r: number) => padY + (1 - (r - minR) / range) * (height - padY * 2);

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.rating) }));

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    '',
  );

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${padX} ${height - padY} Z`;

  const last = data[data.length - 1];
  const first = data[0];
  const change = last.rating - first.rating;
  const changeColor = change >= 0 ? colors.success : colors.error;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Rating History</Text>
        <View style={styles.changeRow}>
          <Text style={[styles.currentRating, { color: colors.primary }]}>{last.rating}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {change >= 0 ? '+' : ''}{change}
          </Text>
        </View>
      </View>

      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} stopOpacity="0.25" />
            <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(t => (
          <Line
            key={t}
            x1={padX}
            y1={padY + t * (height - padY * 2)}
            x2={width - padX}
            y2={padY + t * (height - padY * 2)}
            stroke={colors.border}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Area fill */}
        <Path d={areaD} fill="url(#grad)" />

        {/* Line */}
        <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Last point dot */}
        <Circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="4"
          fill={colors.primary}
        />
      </Svg>

      <View style={styles.footer}>
        <Text style={[styles.footerLabel, { color: colors.textTertiary }]}>
          {data.length} entries
        </Text>
        <Text style={[styles.footerLabel, { color: colors.textTertiary }]}>
          Peak: {Math.max(...ratings)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  changeRow: {
    alignItems: 'flex-end',
  },
  currentRating: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  change: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: typography.sizes.xs,
  },
  empty: {
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    height: 140,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
