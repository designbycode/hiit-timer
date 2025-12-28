import { create } from 'zustand';
import { storageService } from '@/services/storage/StorageService';

interface SettingsState {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  voiceEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;
  toggleVoice: () => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  vibrationEnabled: true,
  voiceEnabled: false,

  toggleSound: () => {
    const newValue = !get().soundEnabled;
    set({ soundEnabled: newValue });
    storageService.saveSettings({ soundEnabled: newValue });
  },

  toggleVibration: () => {
    const newValue = !get().vibrationEnabled;
    set({ vibrationEnabled: newValue });
    storageService.saveSettings({ vibrationEnabled: newValue });
  },

  toggleVoice: () => {
    const newValue = !get().voiceEnabled;
    set({ voiceEnabled: newValue });
    storageService.saveSettings({ voiceEnabled: newValue });
  },

  loadSettings: async () => {
    const settings = await storageService.loadSettings();
    set({
      soundEnabled: settings.soundEnabled ?? true,
      vibrationEnabled: settings.vibrationEnabled ?? true,
      voiceEnabled: settings.voiceEnabled ?? false,
    });
  },
}));

