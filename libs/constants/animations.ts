import { Easing } from 'react-native-reanimated';

export const ANIMATIONS = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  timing: {
    duration: 300,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  },
  fastTiming: {
    duration: 150,
    easing: Easing.out(Easing.quad),
  },
  slowTiming: {
    duration: 500,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  },
} as const;

