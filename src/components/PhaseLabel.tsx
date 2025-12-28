import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { Phase } from '@/types/workout';
import { COLORS } from '@/constants/colors';
import { ANIMATIONS } from '@/constants/animations';

interface PhaseLabelProps {
  phase: Phase;
}

const phaseLabels: Record<Phase, string> = {
  [Phase.COUNTDOWN]: 'GET READY',
  [Phase.WARM_UP]: 'WARM UP',
  [Phase.WORK]: 'WORK',
  [Phase.REST]: 'REST',
  [Phase.COOL_DOWN]: 'COOL DOWN',
  [Phase.COMPLETE]: 'COMPLETE',
};

export const PhaseLabel: React.FC<PhaseLabelProps> = React.memo(({ phase }) => {
  const color = useDerivedValue(() => {
    return COLORS.phase[phase] || COLORS.accent;
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

