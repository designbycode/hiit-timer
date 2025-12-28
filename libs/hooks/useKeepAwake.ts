import { useEffect } from 'react';
import { useKeepAwake } from 'expo-keep-awake';

export function useKeepScreenAwake(enabled: boolean) {
  useKeepAwake(enabled ? 'workout' : undefined);
}

