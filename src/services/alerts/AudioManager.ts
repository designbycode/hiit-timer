import { Audio } from 'expo-av';

type SoundType = 'phase_change' | 'countdown' | 'complete';

class AudioManager {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Audio initialization error:', error);
    }
  }

  async loadSound(type: SoundType, source: any): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume: 1.0,
      });
      this.sounds.set(type, sound);
    } catch (error) {
      console.error(`Error loading sound ${type}:`, error);
    }
  }

  async play(type: SoundType): Promise<void> {
    try {
      await this.initialize();
      const sound = this.sounds.get(type);
      if (sound) {
        await sound.replayAsync();
      } else {
        this.playSystemSound();
      }
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error);
      this.playSystemSound();
    }
  }

  private async playSystemSound(): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { shouldPlay: true, volume: 0.1 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing system sound:', error);
    }
  }

  async unloadAll(): Promise<void> {
    const unloadPromises = Array.from(this.sounds.values()).map((sound) =>
      sound.unloadAsync().catch(console.error)
    );
    await Promise.all(unloadPromises);
    this.sounds.clear();
  }
}

export const audioManager = new AudioManager();

