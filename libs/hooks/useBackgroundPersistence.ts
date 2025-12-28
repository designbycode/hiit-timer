import { useEffect, useRef } from 'react';
import { statePersistence } from '@/libs/services/storage/StatePersistence';
import { TimerState } from '@/libs/types/workout';
import { useAppState } from '@/libs/hooks/useAppState';

export function useBackgroundPersistence(
  getState: () => TimerState,
  isActive: boolean
) {
  const isBackgroundedRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      statePersistence.startBackgroundPersistence(getState);
    } else {
      statePersistence.stopBackgroundPersistence();
    }

    return () => {
      statePersistence.stopBackgroundPersistence();
    };
  }, [isActive, getState]);

  useAppState(
    async () => {
      if (isBackgroundedRef.current && isActive) {
        const savedState = await statePersistence.loadState();
        if (savedState) {
          const currentState = getState();
          if (currentState.isRunning && !currentState.isPaused) {
            const now = Date.now();
            const savedAt = (savedState as any).savedAt || now;
            const elapsed = now - savedAt;

            if (elapsed > 0) {
              const newTimeRemaining = Math.max(
                0,
                savedState.timeRemaining - Math.floor(elapsed / 1000)
              );
              await statePersistence.saveState({
                ...currentState,
                timeRemaining: newTimeRemaining,
              });
            }
          }
        }
      }
      isBackgroundedRef.current = false;
    },
    async () => {
      isBackgroundedRef.current = true;
      if (isActive) {
        await statePersistence.saveState(getState());
      }
    }
  );
}
