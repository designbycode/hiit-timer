import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { Phase } from '@/libs/types/workout';
import { colors } from '@/libs/constants/theme';
import { ANIMATIONS } from '@/libs/constants/animations';

interface PhaseLabelProps {
  phase: Phase;
}

const phaseLabels: Record<Phase, string> = {
  [Phase.COUNTDOWN]: 'GET READY',
  [Phase.WARM_UP]: 'WARM UP',
  [Phase.WORK]: 'WORKOUT',
  [Phase.REST]: 'REST',
  [Phase.COOL_DOWN]: 'COOL DOWN',
  [Phase.COMPLETE]: 'COMPLETE',
};

export const PhaseLabel: React.FC<PhaseLabelProps> = React.memo(({ phase }) => {
  const color = useDerivedValue(() => {
    return colors.phase[phase] || colors.accent;
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(color.value, ANIMATIONS.timing),
      opacity: withTiming(1, ANIMATIONS.fastTiming),
      transform: [
        {
          translateY: withTiming(0, ANIMATIONS.timing),
        },
      ],
    };
  });

  return (
    <Animated.Text style={[styles.label, animatedStyle]}>
      {phaseLabels[phase]}
    </Animated.Text>
  );
});

PhaseLabel.displayName = 'PhaseLabel';

const styles = StyleSheet.create({
  label: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
