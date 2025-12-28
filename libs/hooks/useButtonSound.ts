import { useCallback } from 'react';
import { useAudio } from '@/libs/contexts/AudioContext';
import { hapticManager } from '@/libs/services/alerts/HapticManager';

export const useButtonSound = () => {
  const { playButtonClick } = useAudio();

  const playButtonSound = useCallback(() => {
    playButtonClick();
  }, [playButtonClick]);

  const handlePress = useCallback((onPress?: () => void) => {
    return () => {
      hapticManager.trigger('light');
      playButtonSound();
      onPress?.();
    };
  }, [playButtonSound]);

  const handlePressIn = useCallback(() => {
    hapticManager.trigger('light');
    playButtonSound();
  }, [playButtonSound]);

  return { playButtonSound, handlePress, handlePressIn };
};
