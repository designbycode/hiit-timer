import { Phase } from '@/libs/types/workout';

export const colors = {
    dark: {
        background: '#000000',
        surface: '#1E1E1E',
        surfaceAlt: '#1B1C1F',
        primary: '#FF9800',
        secondary: '#fec64a',
        accent: '#2E7CF6',
        text: '#FFFFFF',
        muted: '#9EA2A8',
        subtle: '#C9CAD1',
        border: '#27282B',
        divider: '#383A40',
        error: '#FF3B30',
        success: '#4CAF50',
    },
    phase: {
        [Phase.COUNTDOWN]: '#FFC107', // Yellow
        [Phase.WARM_UP]: '#4CAF50', // Green
        [Phase.WORK]: '#F44336', // Red
        [Phase.REST]: '#2196F3', // Blue
        [Phase.COOL_DOWN]: '#9C27B0', // Purple
        [Phase.COMPLETE]: '#00BCD4', // Cyan
    },
    accent: '#FF9800', // Orange
}

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
