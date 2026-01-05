import { Phase } from '@/libs/types/workout';
import { hapticManager, HapticPattern } from '@/libs/services/alerts/HapticManager';
import { audioManager } from '@/libs/services/alerts/AudioManager';
import { speechManager } from '@/libs/services/alerts/SpeechManager';

export type AlertType = 'PHASE_CHANGE' | 'COUNTDOWN' | 'WARNING' | 'COMPLETE';

interface AlertOptions {
  mute?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  voiceEnabled?: boolean;
  phase?: Phase;
  round?: number;
  countdownSeconds?: number;
}

class AlertService {
  async triggerAlert(
    type: AlertType,
    options: AlertOptions = {}
  ): Promise<void> {
    const {
      soundEnabled = true,
      vibrationEnabled = true,
      voiceEnabled = false,
      phase,
      round,
      countdownSeconds,
    } = options;

    const promises: Promise<void>[] = [];

    if (vibrationEnabled) {
      const pattern = this.getHapticPattern(type);
      promises.push(hapticManager.trigger(pattern));
    }

    if (soundEnabled) {
      const soundType = this.getSoundType(type);
      if (soundType) {
        promises.push(audioManager.play(soundType));
      }
    }

    await Promise.all(promises);

    // Voice announcements (respect voiceEnabled and mute)
    if (phase && voiceEnabled && !options.mute) {
      if (type === 'COUNTDOWN' && countdownSeconds !== undefined) {
        speechManager.speakCountdown(countdownSeconds);
      } else {
        const text = this.getPhaseMessage(type, phase, round);
        if (text) {
          speechManager.speak(text);
        }
      }
    }
  }

  private getPhaseMessage(type: AlertType, phase: Phase, round?: number): string {
    const phaseNames: Record<Phase, string> = {
      [Phase.COUNTDOWN]: 'Get ready',
      [Phase.WARM_UP]: 'Warm up',
      [Phase.WORK]: 'Workout',
      [Phase.REST]: 'Rest',
      [Phase.COOL_DOWN]: 'Cool down',
      [Phase.COMPLETE]: 'Complete',
    };

    // Customize message based on alert type
    if (type === 'COMPLETE') {
      return 'Workout complete! Great job!';
    }
    if (type === 'COUNTDOWN') {
      return 'Get ready to start';
    }
    
    const phaseName = phaseNames[phase];
    // Only announce round number for WORK phase
    if (phase === Phase.WORK && round !== undefined) {
      return `${phaseName}, Round ${round + 1}`;
    }
    return phaseName;
  }

  private getHapticPattern(type: AlertType): HapticPattern {
    switch (type) {
      case 'PHASE_CHANGE':
        return 'heavy';
      case 'COUNTDOWN':
        return 'medium';
      case 'WARNING':
        return 'light';
      case 'COMPLETE':
        return 'success';
      default:
        return 'medium';
    }
  }

  private getSoundType(type: AlertType): 'ticking' | null {
    // Only use sound for warnings, phase changes use voice
    switch (type) {
      case 'WARNING':
        return 'ticking';
      default:
        return null; // Use voice instead of sound
    }
  }
}

export const alertService = new AlertService();

