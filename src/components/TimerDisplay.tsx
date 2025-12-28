import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { CircularProgress } from './CircularProgress';
import { TimerState } from '@/types/workout';
import { COLORS } from '@/constants/theme';
import { formatTime } from '@/utils/time';

interface TimerDisplayProps {
  timerState: TimerState;
  totalRounds: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(
  ({ timerState, totalRounds }) => {
    const { width } = useWindowDimensions();
    const size = Math.min(width * 0.8, 320);
    const strokeWidth = 10;
    const animatedTime = useSharedValue(1);

    const progress = useMemo(() => {
      if (timerState.totalTime === 0) return 0;
      return Math.max(0, Math.min(1, timerState.timeRemaining / timerState.totalTime));
    }, [timerState.timeRemaining, timerState.totalTime]);

    const phaseColor = useMemo(
      () => COLORS.phase[timerState.phase] || COLORS.dark.primary,
      [timerState.phase]
    );

    const timeText = useMemo(
      () => formatTime(timerState.timeRemaining),
      [timerState.timeRemaining]
    );

    useEffect(() => {
      animatedTime.value = withTiming(0.9, { duration: 200 }, () => {
        animatedTime.value = withTiming(1, { duration: 200 });
      });
    }, [timeText, animatedTime]);

    const animatedTimeStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: animatedTime.value }],
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
            <Animated.View style={[styles.timeContainer, animatedTimeStyle]}>
              <Text style={styles.time}>{timeText}</Text>
              {totalRounds > 0 && (
                <Text style={styles.roundText}>
                  Round {timerState.currentRound + 1} of {totalRounds}
                </Text>
              )}
            </Animated.View>
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
  roundText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
    marginTop: 8,
  },
});

