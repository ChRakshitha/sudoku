import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { typography, spacing, radii } from '../theme/tokens';
import { useAppStore } from '../store/appStore';
import { useRefreshAppState } from '../hooks/useDatabase';
import { updateName } from '../db/repositories/profile';
import { getAllAchievements } from '../db/repositories/achievements';
import { updateSettings } from '../db/repositories/settings';
import { getDB } from '../db/database';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { profile, streaks, totalSolved, settings, isLoaded, setSettings } = useAppStore();
  const refreshAppState = useRefreshAppState();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name ?? '');

  const handleToggleMistakeHighlighting = (value: boolean) => {
    setSettings(updateSettings({ mistakeHighlighting: value }));
  };

  const handleToggleHaptics = (value: boolean) => {
    setSettings(updateSettings({ hapticsEnabled: value }));
  };

  if (!isLoaded) {
    return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const achievements = getAllAchievements();
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      updateName(trimmed);
      refreshAppState();
    }
    setEditingName(false);
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress',
      'This will permanently delete your puzzle history, streaks, records, and achievements. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const db = getDB();
            db.execSync(`DELETE FROM puzzle_history;`);
            db.execSync(`DELETE FROM personal_records;`);
            db.execSync(`DELETE FROM achievements;`);
            db.execSync(`DELETE FROM rating_history;`);
            db.execSync(`UPDATE streaks SET current_streak = 0, longest_streak = 0, last_played_date = NULL WHERE id = 1;`);
            db.execSync(`UPDATE profile SET rating = 1000 WHERE id = 1;`);
            refreshAppState();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Profile</Text>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {(profile?.name ?? 'S').charAt(0).toUpperCase()}
            </Text>
          </View>

          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                style={[styles.nameInput, { color: colors.textPrimary, borderColor: colors.border }]}
                autoFocus
                maxLength={20}
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity onPress={handleSaveName}>
                <Ionicons name="checkmark-circle" size={28} color={colors.success} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setNameInput(profile?.name ?? '');
                setEditingName(true);
              }}
              style={styles.nameRow}
            >
              <Text style={[styles.name, { color: colors.textPrimary }]}>{profile?.name}</Text>
              <Ionicons name="pencil" size={14} color={colors.textTertiary} />
            </TouchableOpacity>
          )}

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{profile?.rating}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.streak }]}>
                {streaks.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{totalSolved}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Solved</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Achievements</Text>
            <Text style={[styles.cardCount, { color: colors.textSecondary }]}>
              {unlockedCount}/{achievements.length}
            </Text>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.map(a => {
              const unlocked = a.unlockedAt !== null;
              return (
                <View
                  key={a.id}
                  style={[
                    styles.achievementItem,
                    {
                      backgroundColor: unlocked ? colors.primaryLight : colors.background,
                      borderColor: unlocked ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={(a.icon as any) ?? 'star'}
                    size={22}
                    color={unlocked ? colors.primary : colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.achievementTitle,
                      { color: unlocked ? colors.textPrimary : colors.textTertiary },
                    ]}
                    numberOfLines={2}
                  >
                    {a.title}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Settings */}
        {/* <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Settings</Text>

          <SettingRow
            icon="alert-circle-outline"
            label="Mistake Highlighting"
            colors={colors}
            right={
              <Switch
                value={settings.mistakeHighlighting}
                onValueChange={handleToggleMistakeHighlighting}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            }
          />
          <SettingRow
            icon="phone-portrait-outline"
            label="Haptics"
            colors={colors}
            right={
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            }
          />
        </View> */}

        {/* Danger zone */}
        <TouchableOpacity
          onPress={handleResetProgress}
          style={[styles.resetBtn, { borderColor: colors.error }]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.resetText, { color: colors.error }]}>Reset All Progress</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  right,
  colors,
}: {
  icon: string;
  label: string;
  right: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
        <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: spacing['2xl'],
    gap: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  screenTitle: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing['2xl'],
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nameInput: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    borderBottomWidth: 1,
    minWidth: 150,
    textAlign: 'center',
    paddingVertical: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  cardCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementItem: {
    flexBasis: '30%',
    flexGrow: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 80,
    justifyContent: 'center',
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  resetText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
