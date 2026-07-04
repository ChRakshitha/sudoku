import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/appStore';

export function triggerSelection(): void {
  if (!useAppStore.getState().settings.hapticsEnabled) return;
  Haptics.selectionAsync();
}

export function triggerImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
): void {
  if (!useAppStore.getState().settings.hapticsEnabled) return;
  Haptics.impactAsync(style);
}
