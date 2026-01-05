import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ImageBackground,
} from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withDelay,
    FadeIn,
    Easing,
} from 'react-native-reanimated'
import * as SplashScreen from 'expo-splash-screen'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '@/libs/constants/theme'

const { width } = Dimensions.get('window')
const SPLASH_DURATION = 3000 // 5 seconds

interface SplashScreenProps {
    onFinish: () => void
}

export const CustomSplashScreen: React.FC<SplashScreenProps> = ({
    onFinish,
}) => {
    const [isVisible, setIsVisible] = useState(true)
    const progress = useSharedValue(0)
    const logoScale = useSharedValue(0.3)
    const titleOpacity = useSharedValue(0)
    const subtitleOpacity = useSharedValue(0)
    const titleTranslateY = useSharedValue(20)
    const subtitleTranslateY = useSharedValue(20)

    useEffect(() => {
        // Start progress animation
        progress.value = withTiming(1, {
            duration: SPLASH_DURATION,
            easing: Easing.linear,
        })

        // Logo animation
        logoScale.value = withTiming(1, {
            duration: 1000,
            easing: Easing.elastic(1),
        })

        // Title animation
        titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }))
        titleTranslateY.value = withDelay(
            300,
            withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
        )

        // Subtitle animation
        subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }))
        subtitleTranslateY.value = withDelay(
            600,
            withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
        )

        // Hide splash after duration
        const timer = setTimeout(() => {
            setIsVisible(false)
            onFinish()
        }, SPLASH_DURATION)

        return () => clearTimeout(timer)
    }, [
        onFinish,
        progress,
        logoScale,
        titleOpacity,
        subtitleOpacity,
        titleTranslateY,
        subtitleTranslateY,
    ])

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }))

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
    }))

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }))

    const subtitleStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
        transform: [{ translateY: subtitleTranslateY.value }],
    }))

    if (!isVisible) {
        return null
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('@/assets/images/splash-bg.png')}
                style={{
                    ...StyleSheet.absoluteFillObject,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View style={styles.content}>
                    <Animated.Image
                        source={require('@/assets/images/splash-icon.png')}
                        style={[
                            { width: 400, height: 400, marginBottom: -80 },
                            logoStyle,
                        ]}
                        resizeMode="contain"
                    />

                    <Animated.View style={titleStyle}>
                        <Animated.View
                            entering={FadeIn.duration(1000).delay(300)}
                        >
                            <Text style={styles.title}>HIIT Timer</Text>
                        </Animated.View>
                    </Animated.View>

                    <Animated.View style={subtitleStyle}>
                        <Animated.View
                            entering={FadeIn.duration(800).delay(600)}
                        >
                            <Text style={styles.subtitle}>
                                Get Ready to Train
                            </Text>
                        </Animated.View>
                    </Animated.View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <Animated.View
                            style={[styles.progressBar, progressStyle]}
                        >
                            <LinearGradient
                                colors={['#FF6B6B', '#FF8E53']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradient}
                            />
                        </Animated.View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
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
        color: colors.dark.secondary,
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
        borderRadius: 4,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        width: '100%',
    },
})
