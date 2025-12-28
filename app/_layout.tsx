import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useSettingsStore } from '@/store/settingsStore';
import { CustomSplashScreen } from '@/components/SplashScreen';

// Prevent native splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadSettings } = useSettingsStore();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
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
