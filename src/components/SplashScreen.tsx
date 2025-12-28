import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Dimensions, ImageBackground, Image} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');
const SPLASH_DURATION = 6000; // 6 seconds

interface SplashScreenProps {
  onFinish: () => void;
}

export const CustomSplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const progress = useSharedValue(0);

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync();

    // Start progress animation
    progress.value = withTiming(1, {
      duration: SPLASH_DURATION,
      easing: Easing.linear,
    });

    // Hide splash after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [onFinish, progress]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
          source={require('@assets/images/splash-bg.png')}
          style={{
            ...StyleSheet.absoluteFillObject,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
      >
      <View style={styles.content}>
        <Image source={require('@assets/images/splash-icon.png')} style={{width: 500, height: 500, marginBottom: -100}} />
        <Text style={styles.title}>HIIT Timer</Text>
        <Text style={styles.subtitle}>Get Ready to Train</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
      </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.secondary,
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    width: width * 0.7,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});
