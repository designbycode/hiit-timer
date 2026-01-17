export enum Phase {
  COUNTDOWN = 'COUNTDOWN',
  WARM_UP = 'WARM_UP',
  WORK = 'WORK',
  REST = 'REST',
  COOL_DOWN = 'COOL_DOWN',
  COMPLETE = 'COMPLETE',
}

export interface Workout {
  id: string;
  name: string;
  workDuration: number;
  restDuration: number;
  rounds: number;
  warmUpDuration?: number;
  coolDownDuration?: number;
  isPreset?: boolean;
}

export interface TimerState {
  phase: Phase;
  currentRound: number;
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null; // Start time of current phase
  pausedDuration: number;
  lastPauseTime: number | null;
  workoutStartTime: number | null; // Start time of entire workout
}

export interface WorkoutPreset extends Workout {
  isPreset: true;
}

export interface AlertType {
  PHASE_CHANGE: 'PHASE_CHANGE';
  COUNTDOWN: 'COUNTDOWN';
  WARNING: 'WARNING';
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutName: string;
  completedAt: number;
  duration: number;
  rounds: number;
  workDuration: number;
  restDuration: number;
  pauseCount?: number;
  skipCount?: number;
}

