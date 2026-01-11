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
  totalProgress?: number;
  totalProgressColor?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = React.memo(
  ({ 
    progress, 
    size, 
    strokeWidth, 
    color, 
    backgroundColor = '#E0E0E0',
    totalProgress,
    totalProgressColor = '#666'
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    // Outer ring (total progress) calculations
    const outerStrokeWidth = 4; // Thin stroke for total progress
    const spacing = 8; // Space between inner and outer rings
    const outerRadius = radius + strokeWidth / 2 + spacing + outerStrokeWidth / 2;
    const outerCircumference = 2 * Math.PI * outerRadius;

    const animatedProgress = useDerivedValue(() => {
      return withSpring(progress, ANIMATIONS.spring);
    });

    const animatedTotalProgress = useDerivedValue(() => {
      return withSpring(totalProgress ?? 0, ANIMATIONS.spring);
    });

    const animatedProps = useAnimatedProps(() => {
      const strokeDashoffset = circumference * (1 - animatedProgress.value);
      return {
        strokeDashoffset,
      };
    });

    const animatedTotalProps = useAnimatedProps(() => {
      // For counter-clockwise starting at 0: offset starts at 0 and goes to negative
      const strokeDashoffset = -outerCircumference * animatedTotalProgress.value;
      return {
        strokeDashoffset,
      };
    });

    // Calculate the actual SVG size needed to fit outer ring
    const svgSize = totalProgress !== undefined 
      ? outerRadius * 2 + outerStrokeWidth 
      : size;
    const svgCenter = svgSize / 2;

    return (
      <View style={[styles.container, { width: svgSize, height: svgSize }]}>
        <Svg width={svgSize} height={svgSize}>
          {/* Outer ring - Total progress background */}
          {totalProgress !== undefined && (
            <>
              <Circle
                cx={svgCenter}
                cy={svgCenter}
                r={outerRadius}
                stroke="#1a1a1a"
                strokeWidth={outerStrokeWidth}
                fill="transparent"
              />
              <AnimatedCircle
                cx={svgCenter}
                cy={svgCenter}
                r={outerRadius}
                stroke={totalProgressColor}
                strokeWidth={outerStrokeWidth}
                fill="transparent"
                strokeDasharray={outerCircumference}
                strokeLinecap="round"
                transform={`rotate(90 ${svgCenter} ${svgCenter}) scale(-1, 1) translate(-${svgSize}, 0)`}
                animatedProps={animatedTotalProps}
              />
            </>
          )}
          
          {/* Inner ring - Phase progress */}
          <Circle
            cx={svgCenter}
            cy={svgCenter}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx={svgCenter}
            cy={svgCenter}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform={`rotate(-90 ${svgCenter} ${svgCenter})`}
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

