import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAudioPlayer, setIsAudioActiveAsync } from 'expo-audio';
import { useSettingsStore } from '@/libs/store/settingsStore';

interface AudioContextType {
  playButtonClick: () => void;
  playTicking: (overrideVolume?: number) => void;
  stopTicking: () => void;
  playTone: () => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const { soundVolume } = useSettingsStore();
  
  // Create audio players using expo-audio hooks (per docs) - using MP3 for better compatibility
  const buttonClickPlayer = useAudioPlayer(require('@/assets/sounds/button_click.mp3'));
  const tickingPlayer = useAudioPlayer(require('@/assets/sounds/ticking.mp3'));
  const tonePlayer = useAudioPlayer(require('@/assets/sounds/tone.mp3'));

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
    if (tonePlayer) {
      tonePlayer.volume = soundVolume;
    }
  }, [tickingPlayer, buttonClickPlayer, tonePlayer, soundVolume]);

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
        // Set volume - use override or default 25%
        // Override with 1.0 (100%) for last 5 seconds
        const targetVolume = overrideVolume ?? 0.25;
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

  const playTone = () => {
    if (tonePlayer) {
      try {
        tonePlayer.seekTo(0);
        tonePlayer.play();
      } catch (e) {
        console.error('❌ Tone play failed:', e);
      }
    }
  };

  const setVolume = (volume: number) => {
    const v = Math.max(0, Math.min(1, volume));
    if (buttonClickPlayer) buttonClickPlayer.volume = v;
    if (tickingPlayer) tickingPlayer.volume = v;
    if (tonePlayer) tonePlayer.volume = v;
  };

  return (
    <AudioContext.Provider value={{ playButtonClick, playTicking, stopTicking, playTone, setVolume }}>
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
