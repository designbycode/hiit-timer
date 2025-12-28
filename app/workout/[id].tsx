import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {View, StyleSheet, Alert, BackHandler, StatusBar, TouchableOpacity, Text, Modal} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore, useTimerState, useIsActive } from '@/store/workoutStore';
import { useTimer } from '@/hooks/useTimer';
import { useKeepScreenAwake } from '@/hooks/useKeepAwake';
import { useBackgroundPersistence } from '@/hooks/useBackgroundPersistence';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Phase } from '@/types/workout';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function WorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const timerState = useTimerState();
  const isActive = useIsActive();
  const { currentWorkout } = useWorkoutStore();
  const { start, pause, resume, skip, stop: stopTimer, restart } = useTimer(id || null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);


  const handleBackPress = useCallback(() => {
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
  }, [router, stopTimer, timerState.isPaused, timerState.isRunning]);

  useKeepScreenAwake(isActive && timerState.isRunning);

  useBackgroundPersistence(
    useCallback(() => timerState, [timerState]),
    isActive && timerState.isRunning
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);

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

  const handleNewTimer = useCallback(() => {
    stopTimer();
    router.back();
  }, [stopTimer, router]);

  const handleRestart = useCallback(() => {
    Alert.alert(
      'Restart Workout',
      'Are you sure you want to restart this workout from the beginning?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: () => {
            restart();
          },
        },
      ]
    );
  }, [restart]);

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

  const getNextPhaseLabel = useCallback(() => {
    if (timerState.phase === Phase.WORK) return 'Next Rest';
    if (timerState.phase === Phase.REST) return 'Next Work';
    return 'Next';
  }, [timerState.phase]);

  if (!currentWorkout) {
    return null;
  }



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Completion Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCompletionModal}
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Workout Complete!</Text>
            <Text style={styles.modalText}>Great job! You&apos;ve completed your workout.</Text>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.restartButton]}
              onPress={handleRestart}
            >
              <Text style={styles.buttonText}>Restart Workout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.newTimerButton]}
              onPress={handleNewTimer}
            >
              <Text style={[styles.buttonText, { color: '#000' }]}>Select New Timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleStop} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACTIVE WORKOUT</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Workout Label */}
      <View style={[styles.workoutLabel, { backgroundColor: phaseColor }]}>
        <Text style={styles.workoutLabelText}>workout</Text>
      </View>

      <View style={styles.content}>
        <TimerDisplay timerState={timerState} totalRounds={totalRounds} />

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#333' }]}
              onPress={handlePauseResume}
            >
              <Ionicons 
                name={timerState.isPaused ? 'play' : 'pause'} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#FFA500' }]}
              onPress={handleRestart}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: phaseColor }]}
              onPress={handleSkip}
            >
              <Ionicons name="play-skip-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: '#333' }]}
            onPress={handleSkip}
          >
            <Text style={styles.nextButtonText}>
              {getNextPhaseLabel()} ({formatTime(timerState.phase === Phase.WORK ? 30 : 45)}s)
            </Text>
            <View style={styles.nextButtonIcon}>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  modalButton: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
  },
  newTimerButton: {
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    padding: 8,
  },
  workoutLabel: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  workoutLabelText: {
    color: '#fff',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    minWidth: 200,
    justifyContent: 'space-between',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
