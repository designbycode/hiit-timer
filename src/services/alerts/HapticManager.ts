import * as Haptics from 'expo-haptics';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

class HapticManager {
  async trigger(pattern: HapticPattern): Promise<void> {
    try {
      switch (pattern) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.error('Haptic error:', error);
    }
  }

  async triggerSequence(patterns: HapticPattern[], delay = 100): Promise<void> {
    for (const pattern of patterns) {
      await this.trigger(pattern);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export const hapticManager = new HapticManager();

