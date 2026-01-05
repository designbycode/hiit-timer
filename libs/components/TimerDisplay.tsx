import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Text, useWindowDimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { useButtonSound } from '@/libs/hooks/useButtonSound';
import { CircularProgress } from '@/libs/components/CircularProgress';
import { TimerState, Phase } from '@/libs/types/workout';
import { colors } from '@/libs/constants/theme';
import { formatTime } from '@/libs/utils/time';
import { hapticManager } from '@/libs/services/alerts/HapticManager';
import { useSettingsStore } from '@/libs/store/settingsStore';

interface TimerDisplayProps {
  timerState: TimerState;
  totalRounds: number;
  onPress?: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(
  ({ timerState, totalRounds, onPress }) => {
    const { handlePressIn, playButtonSound } = useButtonSound();
    const { vibrationEnabled } = useSettingsStore();

    const handleStartPress = React.useCallback(() => {
      // Stronger feedback combo to ensure it is felt
      if (vibrationEnabled) {
        hapticManager.triggerSequence(['heavy', 'success'], 50);
      }
      playButtonSound();
      onPress?.();
    }, [onPress, playButtonSound, vibrationEnabled]);
    const { width } = useWindowDimensions();
    const size = Math.min(width * 0.8, 320);
    const strokeWidth = 10;
    const animatedTime = useSharedValue(1);
    const pulse = useSharedValue(1);

    const progress = useMemo(() => {
      if (timerState.totalTime === 0) return 0;
      return Math.max(0, Math.min(1, timerState.timeRemaining / timerState.totalTime));
    }, [timerState.timeRemaining, timerState.totalTime]);

    const phaseColor = useMemo(
      () => colors.phase[timerState.phase] || colors.dark.primary,
      [timerState.phase]
    );

    const timeText = useMemo(
      () => formatTime(timerState.timeRemaining),
      [timerState.timeRemaining]
    );

    const showStart = useMemo(
      () => !!onPress && !timerState.isRunning && timerState.phase === Phase.COUNTDOWN,
      [onPress, timerState.isRunning, timerState.phase]
    );

    const showResume = useMemo(
      () => !!onPress && timerState.isRunning && timerState.isPaused,
      [onPress, timerState.isRunning, timerState.isPaused]
    );

    useEffect(() => {
      animatedTime.value = withTiming(0.9, { duration: 200 }, () => {
        animatedTime.value = withTiming(1, { duration: 200 });
      });
    }, [timeText, animatedTime]);

    // Pulse the START/RESUME label
    useEffect(() => {
      if (showStart || showResume) {
        pulse.value = withTiming(1.1, { duration: 650, easing: Easing.inOut(Easing.quad) }, () => {
          pulse.value = withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) });
        });
      }
    }, [showStart, showResume, pulse]);

    const animatedTimeStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: animatedTime.value }],
      };
    });

    const pulseStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: pulse.value }],
      };
    });

    return (
      <View style={styles.container}>
        <View style={[styles.progressContainer, { width: size, height: size }]}>
          <CircularProgress
            progress={progress}
            size={size}
            strokeWidth={strokeWidth}
            color={phaseColor}
            backgroundColor="#333"
          />
          <View style={styles.content}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={showStart ? handleStartPress : onPress}
              onPressIn={onPress ? (showStart ? () => { 
                if (vibrationEnabled) {
                  hapticManager.trigger('heavy');
                }
                playButtonSound();
              } : handlePressIn) : undefined}
              disabled={!onPress}
              accessibilityRole={onPress ? 'button' : undefined}
              style={styles.touchFill}
            >
              <Animated.View style={[styles.timeContainer, animatedTimeStyle]}>
                <Animated.Text style={[
                  styles.time,
                  (showStart || showResume) ? [pulseStyle, styles.actionText] : undefined
                ]}>
                  {showStart ? 'START' : showResume ? 'RESUME' : timeText}
                </Animated.Text>
                {!showStart && !showResume && totalRounds > 0 && (
                  <Text style={styles.roundText}>
                    Round {timerState.currentRound + 1} of {totalRounds}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
);

TimerDisplay.displayName = 'TimerDisplay';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchFill: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 42,
  },
  roundText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
    marginTop: 8,
  },
});
