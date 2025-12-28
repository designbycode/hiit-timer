import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useSettingsStore } from '@/libs/store/settingsStore';
import { CustomSplashScreen } from '@/libs/components/SplashScreen';
import { AudioProvider } from '@/libs/contexts/AudioContext';

export default function RootLayout() {
  useEffect(() => {
    // Prevent native splash from auto-hiding
    SplashScreen.preventAutoHideAsync().catch(console.error);
  }, []);

  const { loadSettings } = useSettingsStore();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        await loadSettings();
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        // Hide native splash, keep custom splash overlay visible until it finishes its own timer
        await SplashScreen.hideAsync();
      }
    };
    
    loadAppData().catch(console.error);
  }, [loadSettings]);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AudioProvider>
          <StatusBar style="auto" />
          {isSplashVisible && (
            <View style={styles.splashContainer}>
              <CustomSplashScreen onFinish={handleSplashFinish} />
            </View>
          )}
          {!isSplashVisible && (
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
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
});
