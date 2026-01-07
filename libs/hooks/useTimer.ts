import { useEffect, useRef, useCallback } from 'react';
import { TimerEngine } from '@/libs/services/timer/TimerEngine';
import { Phase } from '@/libs/types/workout';
import { alertService } from '@/libs/services/alerts/AlertService';
import { useAudio } from '@/libs/contexts/AudioContext';
import { speechManager } from '@/libs/services/alerts/SpeechManager';
import { useWorkoutStore } from '@/libs/store/workoutStore';
import { useSettingsStore } from '@/libs/store/settingsStore';
import { useAppState } from '@/libs/hooks/useAppState';

export function useTimer(workoutId: string | null) {
  const engineRef = useRef<TimerEngine | null>(null);
  const workoutRef = useRef(useWorkoutStore.getState().currentWorkout);
  const lastPhaseRef = useRef<Phase | null>(null);
  const lastRoundRef = useRef<number>(0);
  const lastCountdownSecondRef = useRef<number>(0);

  const { currentWorkout, updateTimerState, setWorkout } = useWorkoutStore();
  const { soundEnabled, vibrationEnabled, voiceEnabled } = useSettingsStore();
  const { playTicking, stopTicking, playTone } = useAudio();

  useEffect(() => {
    workoutRef.current = currentWorkout;
  }, [currentWorkout]);

  useEffect(() => {
    // Sounds are loaded by AudioContext, no need to preload here

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
          
          // Voice countdown announcements during COUNTDOWN phase
          if (state.phase === Phase.COUNTDOWN && voiceEnabled) {
            const secondsLeft = Math.ceil(state.timeRemaining);
            // Announce "Start in 3" at the beginning
            if (secondsLeft === 3 && lastCountdownSecondRef.current !== 3) {
              speechManager.speak('Start in 3');
              lastCountdownSecondRef.current = 3;
            }
            // Then announce "2" and "1"
            else if ((secondsLeft === 2 || secondsLeft === 1) && secondsLeft !== lastCountdownSecondRef.current) {
              speechManager.speak(secondsLeft.toString());
              lastCountdownSecondRef.current = secondsLeft;
            }
          }
          
          // Play ticking sound during WORK and REST phases
          // Use full volume (100%) in last 5 seconds, otherwise 25%
          if (soundEnabled && (state.phase === Phase.WORK || state.phase === Phase.REST)) {
            if (state.timeRemaining <= 5 && state.timeRemaining > 0) {
              // Last 5 seconds: 100% volume
              playTicking(1.0);
            } else {
              // Normal time: 25% volume
              playTicking(0.25);
            }
          } else {
            stopTicking();
          }
        },
        onPhaseChange: async (phase, round) => {
          if (phase !== lastPhaseRef.current || round !== lastRoundRef.current) {
            // Stop ticking when phase changes (it will restart in last 5 seconds via onUpdate)
            stopTicking();
            
            try {
              // Play tone at the end of each phase (when phase changes, except from COUNTDOWN)
              if (lastPhaseRef.current !== null && lastPhaseRef.current !== Phase.COUNTDOWN && soundEnabled) {
                playTone();
              }
              
              // Special announcement when transitioning from COUNTDOWN
              if (lastPhaseRef.current === Phase.COUNTDOWN && phase !== Phase.COUNTDOWN) {
                if (voiceEnabled) {
                  speechManager.speak('Start workout');
                }
              }
              
              await alertService.triggerAlert('PHASE_CHANGE', {
                soundEnabled,
                vibrationEnabled,
                voiceEnabled,
                phase,
                round,
              });
              lastPhaseRef.current = phase;
              lastRoundRef.current = round;
            } catch (error) {
              console.error('Error triggering alert:', error);
            }
          }
        },
        onComplete: async () => {
          try {
            // Play tone when timer reaches zero
            if (soundEnabled) {
              playTone();
            }
            
            await alertService.triggerAlert('COMPLETE', {
              soundEnabled,
              vibrationEnabled,
              voiceEnabled,
              phase: Phase.COMPLETE,
            });
          } catch (error) {
            console.error('Error triggering completion alert:', error);
            // Optionally handle the error, e.g., show a user-friendly message
          }
        },
      });
    }

    engineRef.current.setWorkout(currentWorkout);
    lastPhaseRef.current = null;
    lastRoundRef.current = 0;
    lastCountdownSecondRef.current = 0;

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      // Clean up audio on unmount
      speechManager.stop();
      stopTicking();
    };
  }, [workoutId, currentWorkout, updateTimerState, soundEnabled, vibrationEnabled, voiceEnabled, playTicking, stopTicking, playTone]);

  const start = useCallback(() => {
    engineRef.current?.start();
    useWorkoutStore.getState().start();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    useWorkoutStore.getState().pause();
    // Ensure audio and speech pause immediately when the timer is paused
    stopTicking();
    speechManager.stop();
  }, [stopTicking]);

  const resume = useCallback(() => {
    engineRef.current?.resume();
    useWorkoutStore.getState().resume();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    useWorkoutStore.getState().stop();
    setWorkout(null);
    // Stop any ongoing speech and audio
    speechManager.stop();
    stopTicking();
  }, [setWorkout, stopTicking]);

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
