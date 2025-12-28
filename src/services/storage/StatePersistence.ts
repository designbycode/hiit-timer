import { storageService } from './StorageService';
import { TimerState } from '@/types/workout';
import { TIMINGS } from '@/constants/timings';

class StatePersistence {
  private saveInterval: NodeJS.Timeout | null = null;
  private isBackgrounded = false;

  startBackgroundPersistence(getState: () => TimerState) {
    this.isBackgrounded = true;
    this.saveInterval = setInterval(() => {
      if (this.isBackgrounded) {
        const state = getState();
        if (state.isRunning && !state.isPaused) {
          storageService.saveTimerState({
            ...state,
            savedAt: Date.now(),
          });
        }
      }
    }, TIMINGS.BACKGROUND_SAVE_INTERVAL);
  }

  stopBackgroundPersistence() {
    this.isBackgrounded = false;
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  async saveState(state: TimerState): Promise<void> {
    await storageService.saveTimerState({
      ...state,
      savedAt: Date.now(),
    });
  }

  async loadState(): Promise<TimerState | null> {
    const saved = await storageService.loadTimerState();
    if (!saved) return null;

    const now = Date.now();
    const savedAt = saved.savedAt || now;
    const elapsed = now - savedAt;

    if (saved.isRunning && !saved.isPaused && elapsed > 0) {
      const newTimeRemaining = Math.max(0, saved.timeRemaining - Math.floor(elapsed / 1000));
      return {
        ...saved,
        timeRemaining: newTimeRemaining,
      };
    }

    return saved;
  }

  async clearState(): Promise<void> {
    await storageService.clearTimerState();
  }
}

export const statePersistence = new StatePersistence();

