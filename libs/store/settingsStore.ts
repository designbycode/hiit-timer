import { create } from 'zustand';
import { storageService } from '@/libs/services/storage/StorageService';

interface SettingsState {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  voiceEnabled: boolean;
  soundVolume: number; // 0..1
  setSoundVolume: (volume: number) => Promise<void>;
  toggleSound: () => void;
  toggleVibration: () => void;
  toggleVoice: () => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: false,
  soundVolume: 1.0,

  toggleSound: () => {
    const newValue = !get().soundEnabled;
    set({ soundEnabled: newValue });
    storageService.saveSettings({ soundEnabled: newValue });
  },

  toggleVibration: async () => {
    const newValue = !get().vibrationEnabled;
    set({ vibrationEnabled: newValue });
    try {
      await storageService.saveSettings({ vibrationEnabled: newValue });
    } catch (error) {
      console.error('Failed to save vibration settings:', error);
      // Revert the state if save fails
      set({ vibrationEnabled: !newValue });
    }
  },

  toggleVoice: async () => {
    const newValue = !get().voiceEnabled;
    set({ voiceEnabled: newValue });
    try {
      await storageService.saveSettings({ voiceEnabled: newValue });
    } catch (error) {
      console.error('Failed to save voice settings:', error);
      // Revert the state if save fails
      set({ voiceEnabled: !newValue });
    }
  },

  setSoundVolume: async (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ soundVolume: clamped });
    await storageService.saveSettings({ soundVolume: clamped });
    // Volume will be applied by AudioContext when it reads the setting
  },

  loadSettings: async () => {
    const settings = await storageService.loadSettings();
    set({
      soundEnabled: settings.soundEnabled ?? true,
      vibrationEnabled: settings.vibrationEnabled ?? true,
      voiceEnabled: settings.voiceEnabled ?? false,
      soundVolume: settings.soundVolume ?? 1.0,
    });
  },
}));

