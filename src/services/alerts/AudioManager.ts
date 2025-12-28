import { Audio } from 'expo-av';

type SoundType = 'phase_change' | 'countdown' | 'complete' | 'ticking';

class AudioManager {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isInitialized = false;
  private currentSystemSound: Audio.Sound | null = null;

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

  private tickingSound: Audio.Sound | null = null;
  private isTicking = false;

  async play(type: SoundType): Promise<void> {
    try {
      await this.initialize();
      const sound = this.sounds.get(type);
      if (sound) {
        if (type === 'ticking') {
          if (!this.isTicking) {
            this.isTicking = true;
            this.tickingSound = sound;
            await sound.setIsLoopingAsync(true);
            await sound.playAsync();
          }
        } else {
          await sound.replayAsync();
        }
      } else {
        await this.playSystemSound();
      }
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error);
      await this.playSystemSound();
    }
  }

  async stopTicking(): Promise<void> {
    if (this.isTicking && this.tickingSound) {
      try {
        await this.tickingSound.stopAsync();
        await this.tickingSound.setPositionAsync(0);
        this.isTicking = false;
        this.tickingSound = null;
      } catch (error) {
        console.error('Error stopping ticking sound:', error);
      }
    }
  }

  private isPlayingSystemSound = false;

  private async playSystemSound(): Promise<void> {
    if (this.isPlayingSystemSound) return;
    
    this.isPlayingSystemSound = true;
    
    try {
      // Store reference to the current sound to avoid race conditions
      const previousSound = this.currentSystemSound;
      this.currentSystemSound = null;
      
      // Clean up any existing system sound
      if (previousSound) {
        try {
          // First check if the sound is loaded before trying to stop it
          const status = await previousSound.getStatusAsync();
          if (status.isLoaded) {
            await previousSound.stopAsync();
            await previousSound.unloadAsync();
          }
        } catch (cleanupError: any) {
          // Ignore errors if the sound is already unloaded
          if (cleanupError.message !== 'Player does not exist.') {
            console.warn('Error cleaning up previous system sound:', cleanupError);
          }
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        require('@assets/sounds/ticking-timer.wav'),
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && 'didJustFinish' in status && status.didJustFinish) {
            sound.unloadAsync().catch(console.error);
            if (this.currentSystemSound === sound) {
              this.currentSystemSound = null;
            }
          }
        }
      );
      
      this.currentSystemSound = sound;
    } catch (error) {
      console.error('Error playing system sound:', error);
      this.currentSystemSound = null;
    } finally {
      this.isPlayingSystemSound = false;
    }
  }

  async unloadAll(): Promise<void> {
    await this.stopTicking();
    
    // Clean up system sound
    if (this.currentSystemSound) {
      try {
        await this.currentSystemSound.stopAsync();
        await this.currentSystemSound.unloadAsync();
      } catch (error) {
        console.error('Error unloading system sound:', error);
      } finally {
        this.currentSystemSound = null;
      }
    }
    
    // Clean up other sounds
    const unloadPromises = Array.from(this.sounds.values()).map((sound) =>
      sound.unloadAsync().catch(console.error)
    );
    await Promise.all(unloadPromises);
    this.sounds.clear();
    this.isTicking = false;
    this.tickingSound = null;
  }
}

export const audioManager = new AudioManager();
