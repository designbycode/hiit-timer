import * as Speech from 'expo-speech';
import { Phase } from '@/types/workout';

class SpeechManager {
  private isSpeaking = false;
  private queue: string[] = [];

  async speak(text: string, options?: Speech.SpeechOptions): Promise<void> {
    if (this.isSpeaking) {
      this.queue.push(text);
      return;
    }

    try {
      this.isSpeaking = true;
      const customOnDone = options?.onDone;
      await Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        ...options,
        onDone: () => {
          customOnDone?.();
          this.processQueue();
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
      this.isSpeaking = false;
      this.processQueue();
    }
  }

  private processQueue(): void {
    this.isSpeaking = false;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        this.speak(next);
      }
    }
  }

  getPhaseText(phase: Phase, round?: number): string {
    switch (phase) {
      case Phase.COUNTDOWN:
        return 'Get ready';
      case Phase.WARM_UP:
        return 'Warm up';
      case Phase.WORK:
        return round ? `Round ${round}, Go!` : 'Go!';
      case Phase.REST:
        return 'Rest';
      case Phase.COOL_DOWN:
        return 'Cool down';
      case Phase.COMPLETE:
        return 'Workout complete!';
      default:
        return '';
    }
  }

  speakCountdown(seconds: number): void {
    if (seconds > 0 && seconds <= 3) {
      this.speak(seconds.toString());
    }
  }

  stop(): void {
    Speech.stop();
    this.isSpeaking = false;
    this.queue = [];
  }
}

export const speechManager = new SpeechManager();

