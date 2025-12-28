import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { ANIMATIONS } from '@/libs/constants/animations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = React.memo(
  ({ progress, size, strokeWidth, color, backgroundColor = '#E0E0E0' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    const animatedProgress = useDerivedValue(() => {
      return withSpring(progress, ANIMATIONS.spring);
    });

    const animatedProps = useAnimatedProps(() => {
      const strokeDashoffset = circumference * (1 - animatedProgress.value);
      return {
        strokeDashoffset,
      };
    });

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            animatedProps={animatedProps}
          />
        </Svg>
      </View>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

