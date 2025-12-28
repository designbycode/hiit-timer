import { Phase, TimerState } from '@/libs/types/workout';

export type TimerCallback = (state: TimerState) => void;
export type PhaseChangeCallback = (phase: Phase, round: number) => void;

export interface TimerEngineConfig {
  onUpdate?: TimerCallback;
  onPhaseChange?: PhaseChangeCallback;
  onComplete?: () => void;
}

export interface TimerEngineState {
  phase: Phase;
  currentRound: number;
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedDuration: number;
  lastPauseTime: number | null;
}

