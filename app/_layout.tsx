import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useSettingsStore } from '@/libs/store/settingsStore';
import { CustomSplashScreen } from '@/libs/components/SplashScreen';
import { OnboardingScreen } from '@/libs/components/OnboardingScreen';
import { AudioProvider } from '@/libs/contexts/AudioContext';
import { colors } from '@/libs/constants/theme';
import { storageService } from '@/libs/services/storage/StorageService';

export default function RootLayout() {
  useEffect(() => {
    // Prevent native splash from auto-hiding
    SplashScreen.preventAutoHideAsync().catch(console.error);
  }, []);

  const { loadSettings } = useSettingsStore();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        console.log('Loading settings...');
        await loadSettings();
        console.log('Settings loaded');
        
        // Check if onboarding has been completed
        const onboardingCompleted = await storageService.isOnboardingCompleted();
        setShowOnboarding(!onboardingCompleted);
        console.log('Onboarding completed:', onboardingCompleted);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        // Hide native splash, keep custom splash overlay visible until it finishes its own timer
        console.log('Hiding native splash');
        await SplashScreen.hideAsync();
        console.log('Native splash hidden');
      }
    };
    
    loadAppData().catch(console.error);
  }, [loadSettings]);

  const handleSplashFinish = () => {
    console.log('Splash finish called');
    setIsSplashVisible(false);
  };

  const handleOnboardingComplete = async () => {
    console.log('Onboarding complete');
    await storageService.setOnboardingCompleted();
    setShowOnboarding(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.dark.background }}>
      <SafeAreaProvider>
        <AudioProvider>
          <StatusBar style="light" translucent backgroundColor="transparent" />
          {isSplashVisible && (
            <View style={[styles.fullscreenBg, styles.splashContainer]}>
              <CustomSplashScreen onFinish={handleSplashFinish} />
            </View>
          )}
          {!isSplashVisible && showOnboarding && (
            <View style={styles.fullscreenBg}>
              <OnboardingScreen onComplete={handleOnboardingComplete} />
            </View>
          )}
          {!isSplashVisible && !showOnboarding && (
            <View style={styles.fullscreenBg}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: colors.dark.background },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="create-workout" 
                  options={{ 
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                  }} 
                />
                <Stack.Screen 
                  name="workout/[id]" 
                  options={{ 
                    presentation: 'fullScreenModal',
                    animation: 'fade',
                  }} 
                />
              </Stack>
            </View>
          )}
        </AudioProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  fullscreenBg: {
    flex: 1,
    backgroundColor: colors.dark.background,
  }
});
