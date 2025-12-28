import { Phase } from '@/types/workout';
import { hapticManager, HapticPattern } from './HapticManager';
import { audioManager } from './AudioManager';
import { speechManager } from './SpeechManager';

export type AlertType = 'PHASE_CHANGE' | 'COUNTDOWN' | 'WARNING';

interface AlertOptions {
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
      promises.push(audioManager.play(soundType));
    }

    await Promise.all(promises);

    if (voiceEnabled && phase) {
      if (type === 'COUNTDOWN' && countdownSeconds !== undefined) {
        speechManager.speakCountdown(countdownSeconds);
      } else {
        const text = speechManager.getPhaseText(phase, round);
        if (text) {
          speechManager.speak(text);
        }
      }
    }
  }

  private getHapticPattern(type: AlertType): HapticPattern {
    switch (type) {
      case 'PHASE_CHANGE':
        return 'heavy';
      case 'COUNTDOWN':
        return 'medium';
      case 'WARNING':
        return 'light';
      default:
        return 'medium';
    }
  }

  private getSoundType(type: AlertType): 'phase_change' | 'countdown' | 'complete' {
    switch (type) {
      case 'PHASE_CHANGE':
        return 'phase_change';
      case 'COUNTDOWN':
        return 'countdown';
      case 'WARNING':
        return 'countdown';
      default:
        return 'phase_change';
    }
  }
}

export const alertService = new AlertService();

