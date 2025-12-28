import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useSettingsStore } from '@/libs/store/settingsStore';

interface AudioContextType {
  playButtonClick: () => void;
  playTicking: () => void;
  stopTicking: () => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const { soundVolume } = useSettingsStore();
  
  // Create audio players using expo-audio hooks
  const buttonClickPlayer = useAudioPlayer(require('@/assets/sounds/button_click.wav'));
  const tickingPlayer = useAudioPlayer(require('@/assets/sounds/ticking.wav'));

  // Set initial configuration and sync volume
  useEffect(() => {
    if (tickingPlayer) {
      tickingPlayer.loop = true;
      tickingPlayer.volume = soundVolume;
    }
    if (buttonClickPlayer) {
      buttonClickPlayer.volume = soundVolume;
    }
  }, [tickingPlayer, buttonClickPlayer, soundVolume]);

  const playButtonClick = () => {
    if (buttonClickPlayer) {
      // Reset to start if API supports seek, otherwise pause before replay
      try {
        // @ts-ignore - seek may exist depending on expo-audio version
        if (typeof (buttonClickPlayer as any).seek === 'function') {
          (buttonClickPlayer as any).seek(0);
        }
      } catch {}
      try {
        if (buttonClickPlayer.playing) {
          // Pause to allow immediate replay
          // @ts-ignore - pause may be sync/async depending on implementation
          buttonClickPlayer.pause?.();
        }
      } catch {}
      buttonClickPlayer.play();
    }
  };

  const playTicking = () => {
    if (tickingPlayer && !tickingPlayer.playing) {
      tickingPlayer.play();
    }
  };

  const stopTicking = () => {
    if (tickingPlayer) {
      try {
        if (tickingPlayer.playing) {
          tickingPlayer.pause?.();
        }
        // Try to reset position if supported
        // @ts-ignore - seek may exist depending on expo-audio version
        if (typeof (tickingPlayer as any).seek === 'function') {
          (tickingPlayer as any).seek(0);
        }
      } catch {}
    }
  };

  const setVolume = (volume: number) => {
    const v = Math.max(0, Math.min(1, volume));
    if (buttonClickPlayer) buttonClickPlayer.volume = v;
    if (tickingPlayer) tickingPlayer.volume = v;
  };

  return (
    <AudioContext.Provider value={{ playButtonClick, playTicking, stopTicking, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
