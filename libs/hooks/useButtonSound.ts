import { useCallback } from 'react';
import { useAudio } from '@/libs/contexts/AudioContext';
import { hapticManager } from '@/libs/services/alerts/HapticManager';
import { useSettingsStore } from '@/libs/store/settingsStore';

export const useButtonSound = () => {
  const { playButtonClick } = useAudio();
  const { soundEnabled, vibrationEnabled } = useSettingsStore();

  const playButtonSound = useCallback(() => {
    if (soundEnabled) {
      playButtonClick();
    }
  }, [playButtonClick, soundEnabled]);

  const handlePress = useCallback((onPress?: () => void) => {
    return () => {
      if (vibrationEnabled) {
        hapticManager.trigger('light');
      }
      playButtonSound();
      onPress?.();
    };
  }, [playButtonSound, vibrationEnabled]);

  const handlePressIn = useCallback(() => {
    if (vibrationEnabled) {
      hapticManager.trigger('light');
    }
    playButtonSound();
  }, [playButtonSound, vibrationEnabled, soundEnabled]);

  return { playButtonSound, handlePress, handlePressIn };
};
