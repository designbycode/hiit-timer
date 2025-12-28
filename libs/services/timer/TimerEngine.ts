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
  private phaseSequence: Phase[] = [];
  private phaseDurations: Map<Phase, number> = new Map();
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
    this.phaseDurations.clear();

    this.phaseDurations.set(Phase.COUNTDOWN, TIMINGS.COUNTDOWN_DURATION);
    this.phaseSequence.push(Phase.COUNTDOWN);

    if (this.workout.warmUpDuration && this.workout.warmUpDuration > 0) {
      this.phaseDurations.set(Phase.WARM_UP, this.workout.warmUpDuration);
      this.phaseSequence.push(Phase.WARM_UP);
    }

    for (let i = 0; i < this.workout.rounds; i++) {
      this.phaseDurations.set(Phase.WORK, this.workout.workDuration);
      this.phaseSequence.push(Phase.WORK);

      if (i < this.workout.rounds - 1) {
        this.phaseDurations.set(Phase.REST, this.workout.restDuration);
        this.phaseSequence.push(Phase.REST);
      }
    }

    if (this.workout.coolDownDuration && this.workout.coolDownDuration > 0) {
      this.phaseDurations.set(Phase.COOL_DOWN, this.workout.coolDownDuration);
      this.phaseSequence.push(Phase.COOL_DOWN);
    }

    this.phaseSequence.push(Phase.COMPLETE);
    this.phaseDurations.set(Phase.COMPLETE, 0);
  }

  start(): void {
    if (!this.workout) return;

    const now = Date.now();
    this.stateManager.start(now);
    this.currentPhaseIndex = 0;
    const initialPhase = this.phaseSequence[0];
    const duration = this.phaseDurations.get(initialPhase) || 0;
    this.stateManager.setState({
      phase: initialPhase,
      currentRound: 0,
      timeRemaining: duration,
      totalTime: duration,
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
      const initialState = this.phaseSequence[0];
      const duration = this.phaseDurations.get(initialState) || 0;
      this.stateManager.setState({
        phase: initialState,
        currentRound: 0,
        timeRemaining: duration,
        totalTime: duration,
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
    const currentPhase = this.phaseSequence[this.currentPhaseIndex];
    const phaseDuration = this.phaseDurations.get(currentPhase) || 0;

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

    const previousPhase = this.phaseSequence[this.currentPhaseIndex];
    this.currentPhaseIndex++;
    const nextPhase = this.phaseSequence[this.currentPhaseIndex];
    const duration = this.phaseDurations.get(nextPhase) || 0;

    let currentRound = this.stateManager.getState().currentRound;
    if (previousPhase === Phase.WORK) {
      currentRound++;
    }

    this.stateManager.setState({
      phase: nextPhase,
      currentRound,
      timeRemaining: duration,
      totalTime: duration,
      startTime: Date.now(),
      pausedDuration: 0,
    });

    this.config.onPhaseChange?.(nextPhase, currentRound);
    this.config.onUpdate?.(this.stateManager.getState());

    if (nextPhase === Phase.COMPLETE) {
      this.complete();
    } else {
      this.lastUpdateTime = Date.now();
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
