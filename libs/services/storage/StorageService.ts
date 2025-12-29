import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout } from '@/libs/types/workout';

const STORAGE_KEYS = {
  WORKOUTS: '@hiit_timer:workouts',
  SETTINGS: '@hiit_timer:settings',
  LAST_WORKOUT: '@hiit_timer:last_workout',
  TIMER_STATE: '@hiit_timer:timer_state',
} as const;

class StorageService {
  private writeQueue: Map<string, any> = new Map();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private debouncedWrite = () => {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      const writes = Array.from(this.writeQueue.entries());
      this.writeQueue.clear();
      writes.forEach(([key, value]) => {
        AsyncStorage.setItem(key, JSON.stringify(value)).catch(console.error);
      });
    }, 300);
  };

  async flush(): Promise<void> {
    try {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      const writes = Array.from(this.writeQueue.entries());
      this.writeQueue.clear();
      if (writes.length === 0) return;
      await Promise.all(
        writes.map(([key, value]) =>
          AsyncStorage.setItem(key, JSON.stringify(value))
        )
      );
    } catch (error) {
      console.error('Error flushing storage writes:', error);
    }
  }

  async saveWorkout(workout: Workout): Promise<void> {
    try {
      const workouts = await this.loadWorkouts();
      const index = workouts.findIndex((w) => w.id === workout.id);
      if (index >= 0) {
        workouts[index] = workout;
      } else {
        workouts.push(workout);
      }
      this.writeQueue.set(STORAGE_KEYS.WORKOUTS, workouts);
      this.debouncedWrite();
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  }

  async loadWorkouts(): Promise<Workout[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading workouts:', error);
      return [];
    }
  }

  async deleteWorkout(id: string): Promise<void> {
    try {
      const workouts = await this.loadWorkouts();
      const filtered = workouts.filter((w) => w.id !== id);
      this.writeQueue.set(STORAGE_KEYS.WORKOUTS, filtered);
      this.debouncedWrite();
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }

  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      const current = await this.loadSettings();
      const updated = { ...current, ...settings };
      this.writeQueue.set(STORAGE_KEYS.SETTINGS, updated);
      this.debouncedWrite();
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async loadSettings(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  async saveLastWorkout(workoutId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_WORKOUT, workoutId);
    } catch (error) {
      console.error('Error saving last workout:', error);
    }
  }

  async loadLastWorkout(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_WORKOUT);
    } catch (error) {
      console.error('Error loading last workout:', error);
      return null;
    }
  }

  async saveTimerState(state: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }

  async loadTimerState(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading timer state:', error);
      return null;
    }
  }

  async clearTimerState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
    } catch (error) {
      console.error('Error clearing timer state:', error);
    }
  }
}

export const storageService = new StorageService();

