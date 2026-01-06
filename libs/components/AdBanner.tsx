import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Platform, Text } from 'react-native'
import { colors } from '@/libs/constants/theme'

interface AdBannerProps {
    unitId?: string
    size?: any
    style?: any
}

export function AdBanner({ unitId, size, style }: AdBannerProps) {
    const [AdModule, setAdModule] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Dynamically import AdMob - will fail gracefully in Expo Go
        const loadAdModule = async () => {
            try {
                const module = await import('react-native-google-mobile-ads')
                setAdModule(module)
                setIsLoading(false)
            } catch (error) {
                console.log(
                    'AdMob not available (Expo Go) - will work in development build'
                )
                setIsLoading(false)
            }
        }

        loadAdModule()
    }, [])

    // Show placeholder if AdMob not available or still loading
    if (!AdModule || isLoading) {
        if (__DEV__) {
            return (
                <View style={[styles.container, styles.placeholder, style]}>
                    <Text style={styles.placeholderText}>
                        {isLoading ? '⏳ Loading Ads...' : '📱 Ad Banner (AdMob not available)'}
                    </Text>
                </View>
            )
        }
        return null
    }

    // Safely extract AdMob components
    const BannerAd = AdModule.BannerAd
    const BannerAdSize = AdModule.BannerAdSize
    const TestIds = AdModule.TestIds
    
    // If any component is missing, don't render
    if (!BannerAd || !BannerAdSize || !TestIds) {
        console.warn('AdMob components not fully loaded')
        if (__DEV__) {
            return (
                <View style={[styles.container, styles.placeholder, style]}>
                    <Text style={styles.placeholderText}>
                        📱 Ad Banner (Components missing)
                    </Text>
                </View>
            )
        }
        return null
    }

    // Use test ads for development, replace with your actual ad unit IDs for production
    const getAdUnitId = () => {
        if (__DEV__) {
            return TestIds.BANNER
        }

        if (unitId) {
            return unitId
        }

        // Android only (iOS disabled per user request)
        return (
            Platform.select({
                android: 'ca-app-pub-8049621865774957/6172986010',
            }) || TestIds.BANNER
        )
    }

    return (
        <View style={[styles.container, style]}>
            <BannerAd
                unitId={getAdUnitId()}
                size={size || BannerAdSize.BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                }}
                onAdLoaded={() => {
                    console.log('Banner ad loaded')
                }}
                onAdFailedToLoad={(error: any) => {
                    console.warn('Banner ad failed to load:', error)
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: colors.dark.background,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: colors.dark.border,
    },
    placeholder: {
        paddingVertical: 20,
        backgroundColor: colors.dark.surface,
    },
    placeholderText: {
        color: colors.dark.muted,
        fontSize: 12,
        fontStyle: 'italic',
    },
})
