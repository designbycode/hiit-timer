import { Phase } from '@/types/workout';

export const COLORS = {

  primary: '#ff7a0a',
  secondary: '#fec64a',
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1e1e1c',
    textSecondary: '#666666',
    border: '#E0E0E0',
  },
  dark: {
    background: '#1e1e1c',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#999999',
    border: '#333333',
  },
  phase: {
    [Phase.COUNTDOWN]: '#9E9E9E',
    [Phase.WARM_UP]: '#4CAF50',
    [Phase.WORK]: '#F44336',
    [Phase.REST]: '#2196F3',
    [Phase.COOL_DOWN]: '#FF9800',
    [Phase.COMPLETE]: '#9C27B0',
  },
  accent: '#007AFF',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
};
