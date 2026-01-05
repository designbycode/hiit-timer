import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAudioPlayer, setIsAudioActiveAsync } from 'expo-audio';
import { useSettingsStore } from '@/libs/store/settingsStore';

interface AudioContextType {
  playButtonClick: () => void;
  playTicking: (overrideVolume?: number) => void;
  stopTicking: () => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const { soundVolume } = useSettingsStore();
  
  // Create audio players using expo-audio hooks (per docs) - using MP3 for better compatibility
  const buttonClickPlayer = useAudioPlayer(require('@/assets/sounds/button_click.mp3'));
  const tickingPlayer = useAudioPlayer(require('@/assets/sounds/ticking.mp3'));

  // Activate audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        await setIsAudioActiveAsync(true);
      } catch (e) {
        console.error('❌ Failed to activate audio:', e);
      }
    };
    
    initAudio();
  }, []);

  // Configure players and sync volume
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
      try {
        buttonClickPlayer.seekTo(0);
        buttonClickPlayer.play();
      } catch (e) {
        console.error('❌ Button click failed:', e);
      }
    }
  };

  const playTicking = (overrideVolume?: number) => {
    if (tickingPlayer) {
      try {
        // Set volume - use override (75% for last 5 seconds) or default 10%
        const targetVolume = overrideVolume ?? 0.10;
        tickingPlayer.volume = targetVolume * soundVolume; // Multiply by user's volume preference
        
        if (!tickingPlayer.playing) {
          tickingPlayer.play();
        }
      } catch (e) {
        console.error('❌ Ticking play failed:', e);
      }
    }
  };

  const stopTicking = () => {
    if (tickingPlayer && tickingPlayer.playing) {
      try {
        tickingPlayer.pause();
        tickingPlayer.seekTo(0);
      } catch (e) {
        console.error('❌ Stop ticking failed:', e);
      }
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
