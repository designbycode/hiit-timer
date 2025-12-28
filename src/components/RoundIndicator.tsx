import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { ANIMATIONS } from '@/constants/animations';

interface RoundIndicatorProps {
  currentRound: number;
  totalRounds: number;
}

export const RoundIndicator: React.FC<RoundIndicatorProps> = React.memo(
  ({ currentRound, totalRounds }) => {
    const scale = useDerivedValue(() => {
      return withSpring(1, ANIMATIONS.spring);
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    return (
      <Animated.View style={animatedStyle}>
        <Text style={styles.text}>
          Round {currentRound} of {totalRounds}
        </Text>
      </Animated.View>
    );
  }
);

RoundIndicator.displayName = 'RoundIndicator';

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
  },
});

