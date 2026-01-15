import React from 'react'
import { View, Text, StyleSheet, Linking, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '@/libs/components/PrimaryButton'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
// Inline config to avoid import errors
const AppConfig = {
    storeId: {
        ios: 'YOUR_APP_STORE_ID',
        android: 'co.za.designbycode.hiittimer',
    },
}

export function RateAppSection() {
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
                url = 'https://www.designbycode.co.za'
            }

            const supported = await Linking.canOpenURL(url)

            if (supported) {
                await Linking.openURL(url)
            } else {
                const webUrl =
                    Platform.OS === 'ios'
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
            <View style={styles.headerContainer}>
                <Ionicons name="heart" size={28} color={colors.accent} />
                <Text style={styles.title}>Love HIIT Timer?</Text>
            </View>

            <View style={styles.starsContainer}>
                <Ionicons name="star" size={20} color={colors.accent} />
                <Ionicons name="star" size={20} color={colors.accent} />
                <Ionicons name="star" size={20} color={colors.accent} />
                <Ionicons name="star" size={20} color={colors.accent} />
                <Ionicons name="star" size={20} color={colors.accent} />
            </View>

            <Text style={styles.mainText}>We'd love to hear from you!</Text>

            <Text style={styles.description}>
                Your feedback helps us improve and helps other fitness
                enthusiasts discover this app. It only takes a moment to leave a
                review, and it means the world to us!
            </Text>
            <Text style={{ fontSize: 42, marginBottom: spacing.md }}>🙏</Text>

            <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                    <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.accent}
                    />
                    <Text style={styles.benefitText}>
                        Support indie developers
                    </Text>
                </View>
                <View style={styles.benefitItem}>
                    <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.accent}
                    />
                    <Text style={styles.benefitText}>
                        Help others find great apps
                    </Text>
                </View>
                <View style={styles.benefitItem}>
                    <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.accent}
                    />
                    <Text style={styles.benefitText}>Shape future updates</Text>
                </View>
            </View>

            <PrimaryButton
                title="Rate on App Store"
                icon="star"
                onPress={handleRateApp}
                style={styles.rateButton}
            />

            <Text style={styles.thanksText}>
                Thank you for being awesome! 💪
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    sectionCard: {
        backgroundColor: colors.dark.surface,
        borderWidth: 1,
        borderColor: colors.dark.border,
        borderRadius: 16,
        padding: spacing.lg,
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSizes['2xl'],
        fontWeight: '700',
        color: colors.dark.text,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    mainText: {
        fontSize: fontSizes.xl,
        fontWeight: '600',
        color: colors.dark.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    description: {
        fontSize: fontSizes.md,
        color: colors.dark.subtle,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    benefitsContainer: {
        width: '100%',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    benefitText: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '500',
    },
    rateButton: {
        marginTop: 0,
        width: '100%',
    },
    thanksText: {
        fontSize: fontSizes.md,
        color: colors.dark.muted,
        marginTop: spacing.md,
        textAlign: 'center',
        fontStyle: 'italic',
    },
})
