import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  useSharedValue,
  withSequence,
  Easing,
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
  [Phase.COMPLETE]: 'WORKOUT COMPLETE',
};

export const PhaseLabel: React.FC<PhaseLabelProps> = React.memo(({ phase }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const prevPhase = useSharedValue(phase);

  const color = useDerivedValue(() => {
    return colors.phase[phase] || colors.accent;
  });

  useEffect(() => {
    // Only animate if phase actually changed (not initial mount)
    if (prevPhase.value !== phase) {
      // Slide out to left and slide in from right with back-out easing
      translateX.value = withSequence(
        withTiming(-300, { duration: 300, easing: Easing.in(Easing.back(1.5)) }), // Slide out to left with back-in
        withTiming(300, { duration: 0 }), // Jump to right (instant)
        withTiming(0, { duration: 400, easing: Easing.out(Easing.back(1.7)) }) // Slide in from right with back-out
      );

      opacity.value = withSequence(
        withTiming(0, { duration: 300 }), // Fade out
        withTiming(0, { duration: 0 }), // Stay invisible
        withTiming(1, { duration: 400 }) // Fade in (matches slide in duration)
      );
    }
    
    prevPhase.value = phase;
  }, [phase]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(color.value, ANIMATIONS.timing),
      opacity: opacity.value,
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.label, animatedStyle]}>
        {phaseLabels[phase]}
      </Animated.Text>
    </View>
  );
});

PhaseLabel.displayName = 'PhaseLabel';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  label: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
});
