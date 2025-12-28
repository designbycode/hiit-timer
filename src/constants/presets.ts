import { WorkoutPreset } from '@/types/workout';

export const PRESETS: WorkoutPreset[] = [
  {
    id: 'tabata',
    name: 'Tabata',
    workDuration: 20,
    restDuration: 10,
    rounds: 8,
    isPreset: true,
  },
  {
    id: 'beginner',
    name: 'Beginner HIIT',
    workDuration: 30,
    restDuration: 30,
    rounds: 5,
    warmUpDuration: 60,
    coolDownDuration: 60,
    isPreset: true,
  },
  {
    id: 'intermediate',
    name: 'Intermediate HIIT',
    workDuration: 45,
    restDuration: 15,
    rounds: 6,
    warmUpDuration: 90,
    coolDownDuration: 90,
    isPreset: true,
  },
  {
    id: 'advanced',
    name: 'Advanced HIIT',
    workDuration: 60,
    restDuration: 20,
    rounds: 8,
    warmUpDuration: 120,
    coolDownDuration: 120,
    isPreset: true,
  },
];

