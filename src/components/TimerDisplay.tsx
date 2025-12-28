import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { CircularProgress } from './CircularProgress';
import { PhaseLabel } from './PhaseLabel';
import { RoundIndicator } from './RoundIndicator';
import { TimerState } from '@/types/workout';
import { COLORS } from '@/constants/colors';
import { formatTime } from '@/utils/time';
import { ANIMATIONS } from '@/constants/animations';

interface TimerDisplayProps {
  timerState: TimerState;
  totalRounds: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = React.memo(
  ({ timerState, totalRounds }) => {
    const progress = useMemo(() => {
      if (timerState.totalTime === 0) return 0;
      return Math.max(0, Math.min(1, timerState.timeRemaining / timerState.totalTime));
    }, [timerState.timeRemaining, timerState.totalTime]);

    const phaseColor = useMemo(
      () => COLORS.phase[timerState.phase] || COLORS.accent,
      [timerState.phase]
    );

    const timeText = useMemo(
      () => formatTime(timerState.timeRemaining),
      [timerState.timeRemaining]
    );

    const animatedTime = useDerivedValue(() => {
      return withSpring(1, ANIMATIONS.spring);
    });

    const animatedTimeStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: animatedTime.value }],
      };
    });

    return (
      <View style={styles.container}>
        <CircularProgress
          progress={progress}
          size={280}
          strokeWidth={12}
          color={phaseColor}
        />
        <View style={styles.content}>
          <PhaseLabel phase={timerState.phase} />
          <Animated.View style={animatedTimeStyle}>
            <Text style={styles.time}>{timeText}</Text>
          </Animated.View>
          {totalRounds > 0 && (
            <RoundIndicator
              currentRound={timerState.currentRound}
              totalRounds={totalRounds}
            />
          )}
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
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 72,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
  },
});

