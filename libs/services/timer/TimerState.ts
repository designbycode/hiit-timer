import { Phase, TimerState } from '@/libs/types/workout';

export class TimerStateManager {
  private state: TimerState;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): TimerState {
    return {
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
  }

  getState(): TimerState {
    return { ...this.state };
  }

  setState(updates: Partial<TimerState>): void {
    this.state = { ...this.state, ...updates };
  }

  reset(): void {
    this.state = this.createInitialState();
  }

  calculateElapsedTime(): number {
    if (!this.state.startTime) return 0;
    if (this.state.isPaused && this.state.lastPauseTime) {
      return this.state.lastPauseTime - this.state.startTime - this.state.pausedDuration;
    }
    return Date.now() - this.state.startTime - this.state.pausedDuration;
  }

  updateTimeRemaining(totalDuration: number): void {
    const elapsed = this.calculateElapsedTime();
    const remaining = Math.max(0, totalDuration - Math.floor(elapsed / 1000));
    this.state.timeRemaining = remaining;
  }

  pause(): void {
    if (this.state.isRunning && !this.state.isPaused && this.state.startTime) {
      this.state.lastPauseTime = Date.now();
      this.state.isPaused = true;
    }
  }

  resume(): void {
    if (this.state.isRunning && this.state.isPaused && this.state.lastPauseTime) {
      const pauseDuration = Date.now() - this.state.lastPauseTime;
      this.state.pausedDuration += pauseDuration;
      this.state.lastPauseTime = null;
      this.state.isPaused = false;
    }
  }

  start(startTime: number): void {
    this.state.startTime = startTime;
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.lastPauseTime = null;
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.startTime = null;
    this.state.lastPauseTime = null;
    this.state.pausedDuration = 0;
  }
}

