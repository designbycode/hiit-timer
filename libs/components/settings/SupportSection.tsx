import React from 'react'
import { View, Text, StyleSheet, Linking, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '@/libs/components/PrimaryButton'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
// Inline config to avoid import errors
const AppConfig = {
    storeId: {
        ios: 'YOUR_APP_STORE_ID',
        android: 'co.za.designbycode.hiittimer'
    }
}

export function SupportSection() {
    const handleRateApp = async () => {
        try {
            const appStoreId = AppConfig.storeId.ios
            const playStoreId = AppConfig.storeId.android
            
            let url = ''
            
            if (Platform.OS === 'ios') {
                url = `itms-apps://itunes.apple.com/app/id${appStoreId}?action=write-review`
            } else if (Platform.OS === 'android') {
                url = `market://details?id=${playStoreId}`
            } else {
                url = 'https://www.example.com/rate'
            }
            
            const supported = await Linking.canOpenURL(url)
            
            if (supported) {
                await Linking.openURL(url)
            } else {
                const webUrl = Platform.OS === 'ios'
                    ? `https://apps.apple.com/app/id${appStoreId}`
                    : `https://play.google.com/store/apps/details?id=${playStoreId}`
                await Linking.openURL(webUrl)
            }
        } catch (error) {
            console.error('Error opening app store:', error)
        }
    }

    return (
        <View style={styles.sectionCard}>
            <Text style={styles.title}>Support</Text>
            
            <View style={styles.rateAppContainer}>
                <View style={styles.rateAppIcon}>
                    <Ionicons name="star" size={32} color={colors.accent} />
                </View>
                <View style={styles.rateAppContent}>
                    <Text style={styles.rateAppTitle}>Enjoying HIIT Timer?</Text>
                    <Text style={styles.rateAppDescription}>
                        Rate us on the App Store and help others discover the app!
                    </Text>
                </View>
            </View>

            <PrimaryButton
                title="Rate This App"
                icon="star-outline"
                onPress={handleRateApp}
                style={styles.rateButton}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    sectionCard: {
        backgroundColor: colors.dark.surface,
        borderWidth: 1,
        borderColor: colors.dark.border,
        borderRadius: 12,
        padding: spacing.sm,
    },
    title: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.dark.text,
        marginBottom: spacing.sm,
    },
    rateAppContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    rateAppIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${colors.accent}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    rateAppContent: {
        flex: 1,
    },
    rateAppTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.dark.text,
        marginBottom: spacing.xs,
    },
    rateAppDescription: {
        fontSize: fontSizes.sm,
        color: colors.dark.muted,
        lineHeight: 20,
    },
    rateButton: {
        marginTop: 0,
    },
})
