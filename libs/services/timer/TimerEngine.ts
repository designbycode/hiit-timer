import { TIMINGS } from '@/libs/constants/timings';
import { TimerEngineConfig, TimerEngineState } from '@/libs/types/timer';
import { Phase, Workout } from '@/libs/types/workout';
import { TimerStateManager } from '@/libs/services/timer/TimerState';
import { audioManager } from '@/libs/services/alerts/AudioManager';

export class TimerEngine {
  private workout: Workout | null = null;
  private stateManager: TimerStateManager;
  private animationFrameId: number | null = null;
  private config: TimerEngineConfig;
  private phaseSequence: Array<{ phase: Phase; round: number; duration: number }> = [];
  private currentPhaseIndex = 0;
  private lastUpdateTime = 0;
  private audioManager = audioManager;

  constructor(config: TimerEngineConfig = {}) {
    this.config = config;
    this.stateManager = new TimerStateManager();
  }

  setWorkout(workout: Workout): void {
    this.workout = workout;
    this.buildPhaseSequence();
    this.reset();
  }

  private buildPhaseSequence(): void {
    if (!this.workout) return;

    this.phaseSequence = [];

    // Countdown phase (round 0)
    this.phaseSequence.push({
      phase: Phase.COUNTDOWN,
      round: 0,
      duration: TIMINGS.COUNTDOWN_DURATION,
    });

    // Warm-up phase (round 0)
    if (this.workout.warmUpDuration && this.workout.warmUpDuration > 0) {
      this.phaseSequence.push({
        phase: Phase.WARM_UP,
        round: 0,
        duration: this.workout.warmUpDuration,
      });
    }

    // Work and Rest phases for each round
    for (let i = 0; i < this.workout.rounds; i++) {
      const roundNumber = i + 1; // Rounds are 1-indexed for display

      // Work phase
      this.phaseSequence.push({
        phase: Phase.WORK,
        round: roundNumber,
        duration: this.workout.workDuration,
      });

      // Rest phase (skip after last round)
      if (i < this.workout.rounds - 1) {
        this.phaseSequence.push({
          phase: Phase.REST,
          round: roundNumber,
          duration: this.workout.restDuration,
        });
      }
    }

    // Cool-down phase (round is total rounds)
    if (this.workout.coolDownDuration && this.workout.coolDownDuration > 0) {
      this.phaseSequence.push({
        phase: Phase.COOL_DOWN,
        round: this.workout.rounds,
        duration: this.workout.coolDownDuration,
      });
    }

    // Complete phase
    this.phaseSequence.push({
      phase: Phase.COMPLETE,
      round: this.workout.rounds,
      duration: 0,
    });
  }

  start(): void {
    if (!this.workout) return;

    const now = Date.now();
    this.stateManager.start(now);
    this.currentPhaseIndex = 0;
    const initialPhaseData = this.phaseSequence[0];
    this.stateManager.setState({
      phase: initialPhaseData.phase,
      currentRound: initialPhaseData.round,
      timeRemaining: initialPhaseData.duration,
      totalTime: initialPhaseData.duration,
    });
    this.lastUpdateTime = now;
    this.tick();
  }

  pause(): void {
    this.stateManager.pause();
    this.stopTicking();
  }

  resume(): void {
    if (!this.workout) return;
    this.stateManager.resume();
    this.lastUpdateTime = Date.now();
    this.tick();
  }

  stop(): void {
    this.stateManager.stop();
    this.stopTicking();
    this.reset();
  }

  skip(): void {
    if (!this.workout) return;
    this.transitionToNextPhase();
  }

  restart(): void {
    this.stop();
    this.start();
  }

  private reset(): void {
    this.currentPhaseIndex = 0;
    this.stateManager.reset();
    if (this.phaseSequence.length > 0) {
      const initialPhaseData = this.phaseSequence[0];
      this.stateManager.setState({
        phase: initialPhaseData.phase,
        currentRound: initialPhaseData.round,
        timeRemaining: initialPhaseData.duration,
        totalTime: initialPhaseData.duration,
      });
    }
  }

  private tick = (): void => {
    if (!this.workout) return;

    const state = this.stateManager.getState();
    if (!state.isRunning || state.isPaused) {
      this.animationFrameId = null;
      audioManager.stopTicking();
      return;
    }

    const now = Date.now();
    const currentPhaseData = this.phaseSequence[this.currentPhaseIndex];
    const phaseDuration = currentPhaseData.duration;

    this.stateManager.updateTimeRemaining(phaseDuration);

    const updatedState = this.stateManager.getState();

    // Handle ticking sound for the last 5 seconds of each phase when actively counting down
    if (updatedState.timeRemaining <= 5 && updatedState.timeRemaining > 0 && updatedState.isRunning && !updatedState.isPaused) {
      audioManager.play('ticking');
    } else {
      audioManager.stopTicking();
    }

    if (updatedState.timeRemaining <= 0) {
      audioManager.stopTicking();
      this.transitionToNextPhase();
    } else {
      if (now - this.lastUpdateTime >= TIMINGS.UI_UPDATE_INTERVAL) {
        this.config.onUpdate?.(updatedState);
        this.lastUpdateTime = now;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private stopTicking(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private transitionToNextPhase(): void {
    if (this.currentPhaseIndex >= this.phaseSequence.length - 1) {
      this.complete();
      return;
    }

    this.currentPhaseIndex++;
    const nextPhaseData = this.phaseSequence[this.currentPhaseIndex];

    // Reset start time for the new phase
    const now = Date.now();
    this.stateManager.setState({
      phase: nextPhaseData.phase,
      currentRound: nextPhaseData.round,
      timeRemaining: nextPhaseData.duration,
      totalTime: nextPhaseData.duration,
      startTime: now,
      pausedDuration: 0,
      lastPauseTime: null,
    });

    this.config.onPhaseChange?.(nextPhaseData.phase, nextPhaseData.round);
    this.config.onUpdate?.(this.stateManager.getState());

    if (nextPhaseData.phase === Phase.COMPLETE) {
      this.complete();
    } else {
      this.lastUpdateTime = now;
      if (this.stateManager.getState().isRunning) {
        this.tick();
      }
    }
  }

  private complete(): void {
    this.stateManager.setState({
      phase: Phase.COMPLETE,
      timeRemaining: 0,
      isRunning: false,
    });
    this.stopTicking();
    this.config.onUpdate?.(this.stateManager.getState());
    this.config.onComplete?.();
  }

  getState(): TimerEngineState {
    return this.stateManager.getState();
  }

  setState(state: Partial<TimerEngineState>): void {
    this.stateManager.setState(state);
  }

  destroy(): void {
    this.stopTicking();
    this.workout = null;
    this.stateManager.reset();
  }
}
