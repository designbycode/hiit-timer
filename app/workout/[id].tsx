import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore, useTimerState, useIsActive } from '@/store/workoutStore';
import { useTimer } from '@/hooks/useTimer';
import { useKeepScreenAwake } from '@/hooks/useKeepAwake';
import { useBackgroundPersistence } from '@/hooks/useBackgroundPersistence';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Button } from '@/components/Button';
import { Phase } from '@/types/workout';

export default function WorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const timerState = useTimerState();
  const isActive = useIsActive();
  const { currentWorkout, stop } = useWorkoutStore();
  const { start, pause, resume, skip, stop: stopTimer } = useTimer(id || null);

  useKeepScreenAwake(isActive && timerState.isRunning);

  useBackgroundPersistence(
    () => timerState,
    isActive && timerState.isRunning
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (timerState.isRunning && !timerState.isPaused) {
        Alert.alert(
          'Workout in Progress',
          'Are you sure you want to leave? Your progress will be lost.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Leave',
              style: 'destructive',
              onPress: () => {
                stopTimer();
                router.back();
              },
            },
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [timerState.isRunning, timerState.isPaused, stopTimer, router]);

  const handlePauseResume = useCallback(() => {
    if (timerState.isPaused) {
      resume();
    } else {
      pause();
    }
  }, [timerState.isPaused, pause, resume]);

  const handleStop = useCallback(() => {
    Alert.alert(
      'Stop Workout',
      'Are you sure you want to stop this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            stopTimer();
            router.back();
          },
        },
      ]
    );
  }, [stopTimer, router]);

  const handleSkip = useCallback(() => {
    skip();
  }, [skip]);

  const totalRounds = useMemo(() => {
    return currentWorkout?.rounds || 0;
  }, [currentWorkout]);

  const phaseColor = useMemo(() => {
    const colors: Record<Phase, string> = {
      [Phase.COUNTDOWN]: '#9E9E9E',
      [Phase.WARM_UP]: '#4CAF50',
      [Phase.WORK]: '#F44336',
      [Phase.REST]: '#2196F3',
      [Phase.COOL_DOWN]: '#FF9800',
      [Phase.COMPLETE]: '#9C27B0',
    };
    return colors[timerState.phase] || '#007AFF';
  }, [timerState.phase]);

  useEffect(() => {
    if (!timerState.isRunning && !timerState.isPaused && id) {
      start();
    }
  }, [id, start, timerState.isRunning, timerState.isPaused]);

  if (!currentWorkout) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: phaseColor }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <TimerDisplay timerState={timerState} totalRounds={totalRounds} />

        <View style={styles.controls}>
          {timerState.phase !== Phase.COMPLETE && (
            <>
              <Button
                title={timerState.isPaused ? 'Resume' : 'Pause'}
                onPress={handlePauseResume}
                variant="secondary"
                style={styles.button}
              />
              <Button
                title="Skip"
                onPress={handleSkip}
                variant="secondary"
                style={styles.button}
              />
            </>
          )}
          <Button
            title={timerState.phase === Phase.COMPLETE ? 'Done' : 'Stop'}
            onPress={handleStop}
            variant={timerState.phase === Phase.COMPLETE ? 'primary' : 'danger'}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  controls: {
    width: '100%',
    marginTop: 48,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});

