import { useEffect, useRef, useCallback } from 'react';
import { TimerEngine } from '@/services/timer/TimerEngine';
import { TimerState, Phase } from '@/types/workout';
import { alertService } from '@/services/alerts/AlertService';
import { useWorkoutStore } from '@/store/workoutStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppState } from './useAppState';

export function useTimer(workoutId: string | null) {
  const engineRef = useRef<TimerEngine | null>(null);
  const workoutRef = useRef(useWorkoutStore.getState().currentWorkout);
  const lastPhaseRef = useRef<Phase | null>(null);
  const lastRoundRef = useRef<number>(0);

  const { currentWorkout, updateTimerState, setWorkout } = useWorkoutStore();
  const { soundEnabled, vibrationEnabled, voiceEnabled } = useSettingsStore();

  useEffect(() => {
    workoutRef.current = currentWorkout;
  }, [currentWorkout]);

  useEffect(() => {
    if (!workoutId || !currentWorkout) {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      return;
    }

    if (!engineRef.current) {
      engineRef.current = new TimerEngine({
        onUpdate: (state) => {
          updateTimerState(state);
        },
        onPhaseChange: (phase, round) => {
          if (phase !== lastPhaseRef.current || round !== lastRoundRef.current) {
            alertService.triggerAlert('PHASE_CHANGE', {
              soundEnabled,
              vibrationEnabled,
              voiceEnabled,
              phase,
              round,
            });
            lastPhaseRef.current = phase;
            lastRoundRef.current = round;
          }
        },
        onComplete: () => {
          alertService.triggerAlert('PHASE_CHANGE', {
            soundEnabled,
            vibrationEnabled,
            voiceEnabled,
            phase: Phase.COMPLETE,
          });
        },
      });
    }

    engineRef.current.setWorkout(currentWorkout);
    lastPhaseRef.current = null;
    lastRoundRef.current = 0;

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [workoutId, currentWorkout, updateTimerState, soundEnabled, vibrationEnabled, voiceEnabled]);

  const start = useCallback(() => {
    engineRef.current?.start();
    useWorkoutStore.getState().start();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    useWorkoutStore.getState().pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
    useWorkoutStore.getState().resume();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    useWorkoutStore.getState().stop();
    setWorkout(null);
  }, [setWorkout]);

  const skip = useCallback(() => {
    engineRef.current?.skip();
    useWorkoutStore.getState().skip();
  }, []);

  const restart = useCallback(() => {
    engineRef.current?.restart();
    useWorkoutStore.getState().restart();
  }, []);

  useAppState(
    () => {
      if (engineRef.current && workoutRef.current) {
        const state = engineRef.current.getState();
        if (state.isRunning && !state.isPaused) {
          const now = Date.now();
          if (state.startTime) {
            const elapsed = now - state.startTime - state.pausedDuration;
            const currentPhase = state.phase;
            const phaseDuration = getPhaseDuration(currentWorkout, currentPhase);
            const newTimeRemaining = Math.max(0, phaseDuration - Math.floor(elapsed / 1000));
            engineRef.current.setState({
              timeRemaining: newTimeRemaining,
            });
          }
        }
      }
    },
    () => {
      if (engineRef.current) {
        const state = engineRef.current.getState();
        if (state.isRunning && !state.isPaused) {
          engineRef.current.pause();
        }
      }
    }
  );

  return {
    start,
    pause,
    resume,
    stop,
    skip,
    restart,
  };
}

function getPhaseDuration(workout: any, phase: Phase): number {
  if (!workout) return 0;
  switch (phase) {
    case Phase.COUNTDOWN:
      return 3;
    case Phase.WARM_UP:
      return workout.warmUpDuration || 0;
    case Phase.WORK:
      return workout.workDuration || 0;
    case Phase.REST:
      return workout.restDuration || 0;
    case Phase.COOL_DOWN:
      return workout.coolDownDuration || 0;
    default:
      return 0;
  }
}

