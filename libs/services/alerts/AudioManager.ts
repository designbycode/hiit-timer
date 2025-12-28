// AudioManager: minimal implementation to satisfy alerts/timer needs
// NOTE: This is a lightweight placeholder that can be expanded to use expo-audio players
// following the project guidance (expo-audio preferred).

export type SoundType = 'ticking';

class AudioManager {
  private tickingActive = false;

  async play(type: SoundType): Promise<void> {
    // In a fuller implementation, route to expo-audio players and respect global volume
    if (type === 'ticking') {
      this.tickingActive = true;
      // TODO: integrate with a shared audio layer if needed
    }
  }

  stopTicking(): void {
    this.tickingActive = false;
  }
}

export const audioManager = new AudioManager();
