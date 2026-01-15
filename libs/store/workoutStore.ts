import { create } from 'zustand';
import { Workout, TimerState, Phase } from '@/libs/types/workout';

interface WorkoutState {
  currentWorkout: Workout | null;
  timerState: TimerState;
  isActive: boolean;
  pauseCount: number;
  skipCount: number;
  setWorkout: (workout: Workout | null) => void;
  updateTimerState: (state: Partial<TimerState>) => void;
  resetTimer: () => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skip: () => void;
  restart: () => void;
}

const initialTimerState: TimerState = {
  phase: Phase.COUNTDOWN,
  currentRound: 0,
  timeRemaining: 0,
  totalTime: 0,
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedDuration: 0,
  lastPauseTime: null,
};

export const useWorkoutStore = create<WorkoutState>((set) => ({
  currentWorkout: null,
  timerState: initialTimerState,
  isActive: false,
  pauseCount: 0,
  skipCount: 0,

  setWorkout: (workout) => {
    set({ currentWorkout: workout, isActive: workout !== null, pauseCount: 0, skipCount: 0 });
  },

  updateTimerState: (updates) => {
    set((state) => ({
      timerState: { ...state.timerState, ...updates },
    }));
  },

  resetTimer: () => {
    set({ timerState: initialTimerState, isActive: false });
  },

  start: () => {
    set((state) => ({
      timerState: {
        ...state.timerState,
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
      },
      isActive: true,
    }));
  },

  pause: () => {
    set((state) => ({
      timerState: {
        ...state.timerState,
        isPaused: true,
        lastPauseTime: Date.now(),
      },
      pauseCount: state.pauseCount + 1,
    }));
  },

  resume: () => {
    set((state) => {
      if (state.timerState.lastPauseTime) {
        const pauseDuration = Date.now() - state.timerState.lastPauseTime;
        return {
          timerState: {
            ...state.timerState,
            isPaused: false,
            pausedDuration: state.timerState.pausedDuration + pauseDuration,
            lastPauseTime: null,
          },
        };
      }
      return state;
    });
  },

  stop: () => {
    set({
      timerState: initialTimerState,
      isActive: false,
      pauseCount: 0,
      skipCount: 0,
    });
  },

  skip: () => {
    set((state) => ({
      timerState: {
        ...state.timerState,
        timeRemaining: 0,
      },
      skipCount: state.skipCount + 1,
    }));
  },

  restart: () => {
    set((state) => ({
      timerState: {
        ...initialTimerState,
        phase: state.timerState.phase,
        currentRound: 0,
      },
    }));
  },
}));

export const useTimerState = () => useWorkoutStore((state) => state.timerState);
export const useCurrentWorkout = () => useWorkoutStore((state) => state.currentWorkout);
export const useIsActive = () => useWorkoutStore((state) => state.isActive);

