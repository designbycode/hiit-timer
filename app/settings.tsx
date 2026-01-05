import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native'
import Header from '@/libs/components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useSettingsStore } from '@/libs/store/settingsStore'
import { useButtonSound } from '@/libs/hooks/useButtonSound'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { Button } from '@/libs/components/Button'
import { PrimaryButton } from '@/libs/components/PrimaryButton'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { hapticManager } from '@/libs/services/alerts/HapticManager'

export default function SettingsScreen() {
    const {
        soundEnabled,
        vibrationEnabled,
        voiceEnabled,
        soundVolume,
        setSoundVolume,
        toggleSound,
        toggleVibration,
        toggleVoice,
        loadSettings,
    } = useSettingsStore()
    const { handlePressIn } = useButtonSound()

    useEffect(() => {
        const loadUserSettings = async () => {
            try {
                await loadSettings()
            } catch (error) {
                console.error('Failed to load settings:', error)
            }
        }

        loadUserSettings()
    }, [loadSettings])

    const router = useRouter()
    const [appVersion] = useState(Constants.expoConfig?.version || '1.0.0')

    const handleOpenURL = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url)
            if (supported) {
                hapticManager.trigger('light')
                await Linking.openURL(url)
            } else {
                console.error('Cannot open URL:', url)
            }
        } catch (error) {
            console.error('Error opening URL:', error)
        }
    }

    const handleRateApp = async () => {
        try {
            // App Store URLs - replace with your actual app IDs when published
            const appStoreId = 'YOUR_APP_STORE_ID' // iOS App Store ID
            const playStoreId = 'com.yourcompany.hiittimer' // Android package name
            
            let url = ''
            
            if (Platform.OS === 'ios') {
                // iOS App Store rating URL
                url = `itms-apps://itunes.apple.com/app/id${appStoreId}?action=write-review`
            } else if (Platform.OS === 'android') {
                // Google Play Store rating URL
                url = `market://details?id=${playStoreId}`
            } else {
                // Web fallback
                url = 'https://www.example.com/rate'
            }
            
            const supported = await Linking.canOpenURL(url)
            
            if (supported) {
                await Linking.openURL(url)
            } else {
                // Fallback to web version
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
        <SafeAreaView style={styles.container}>
            <Header
                title="Settings"
                onBackPress={() => router.back()}
                hideRightIcon
            />
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.sectionCard}>
                    <Text style={styles.title}>Alerts</Text>

                    <View style={styles.setting}>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingLabel}>Sound</Text>
                            <Text style={styles.settingDescription}>
                                Play sound alerts at phase changes
                            </Text>
                        </View>
                        <Switch
                            value={soundEnabled}
                            onValueChange={toggleSound}
                            trackColor={{
                                false: colors.dark.divider,
                                true: colors.dark.primary,
                            }}
                            thumbColor={colors.dark.text}
                            ios_backgroundColor={colors.dark.divider}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.setting}>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingLabel}>Vibration</Text>
                            <Text style={styles.settingDescription}>
                                Vibrate at phase changes
                            </Text>
                        </View>
                        <Switch
                            value={vibrationEnabled}
                            onValueChange={toggleVibration}
                            trackColor={{
                                false: colors.dark.divider,
                                true: colors.dark.primary,
                            }}
                            thumbColor={colors.dark.text}
                            ios_backgroundColor={colors.dark.divider}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.setting}>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingLabel}>Voice Cues</Text>
                            <Text style={styles.settingDescription}>
                                Announce phase changes and countdown
                            </Text>
                        </View>
                        <Switch
                            value={voiceEnabled}
                            onValueChange={toggleVoice}
                            trackColor={{
                                false: colors.dark.divider,
                                true: colors.dark.primary,
                            }}
                            thumbColor={colors.dark.text}
                            ios_backgroundColor={colors.dark.divider}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View
                        style={[styles.setting, { alignItems: 'flex-start' }]}
                    >
                        <View style={styles.settingContent}>
                            <Text style={styles.settingLabel}>
                                Sound Volume
                            </Text>
                            <Text style={styles.settingDescription}>
                                Adjust alert volume
                            </Text>
                            <View style={styles.volumeRow}>
                                {[
                                    { label: 'Low', value: 0.3 },
                                    { label: 'Med', value: 0.6 },
                                    { label: 'High', value: 1.0 },
                                ].map((opt) => (
                                    <TouchableOpacity
                                        key={opt.label}
                                        style={[
                                            styles.volumeOption,
                                            Math.abs(soundVolume - opt.value) <
                                                0.05 &&
                                                styles.volumeOptionActive,
                                        ]}
                                        onPress={() =>
                                            setSoundVolume(opt.value)
                                        }
                                        onPressIn={handlePressIn}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.volumeOptionText,
                                                Math.abs(
                                                    soundVolume - opt.value
                                                ) < 0.05 &&
                                                    styles.volumeOptionTextActive,
                                            ]}
                                        >
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Rate This App Section */}
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

                {/* About Section */}
                <View style={styles.sectionCard}>
                    <Text style={styles.title}>About</Text>
                    
                    <View style={styles.aboutContainer}>
                        <Text style={styles.aboutText}>
                            HIIT Timer is a simple, powerful interval timer designed for high-intensity interval training. 
                            Create custom workouts, track your progress, and stay motivated with audio cues and haptic feedback.
                        </Text>
                        
                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                <Text style={styles.featureText}>Custom workout intervals</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                <Text style={styles.featureText}>Audio & voice announcements</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                <Text style={styles.featureText}>Haptic feedback</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                <Text style={styles.featureText}>Preset workouts</Text>
                            </View>
                        </View>
                        
                        <View style={styles.versionContainer}>
                            <Text style={styles.versionLabel}>Version</Text>
                            <Text style={styles.versionText}>{appVersion}</Text>
                        </View>
                        
                        <View style={styles.buildInfo}>
                            <Text style={styles.buildInfoText}>
                                Made with ❤️ for fitness enthusiasts
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tips & Tricks Section */}
                <View style={styles.sectionCard}>
                    <Text style={styles.title}>Tips & Tricks</Text>
                    
                    <View style={styles.tipsContainer}>
                        <View style={styles.tipItem}>
                            <View style={styles.tipIcon}>
                                <Ionicons name="bulb" size={24} color={colors.accent} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>Start with Beginner Preset</Text>
                                <Text style={styles.tipText}>
                                    New to HIIT? Try the "Beginner HIIT" preset (30s work, 30s rest) to build your endurance.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.tipItem}>
                            <View style={styles.tipIcon}>
                                <Ionicons name="fitness" size={24} color={colors.accent} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>Keep Your Phone Close</Text>
                                <Text style={styles.tipText}>
                                    Make sure your phone volume is up and the device is nearby to hear audio cues during your workout.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.tipItem}>
                            <View style={styles.tipIcon}>
                                <Ionicons name="water" size={24} color={colors.accent} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>Stay Hydrated</Text>
                                <Text style={styles.tipText}>
                                    Use rest intervals to hydrate. Set longer rest periods if you need more recovery time.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.tipItem}>
                            <View style={styles.tipIcon}>
                                <Ionicons name="repeat" size={24} color={colors.accent} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>Warm Up & Cool Down</Text>
                                <Text style={styles.tipText}>
                                    Always enable warm-up and cool-down periods to prevent injury and improve performance.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.sectionCard}>
                    <Text style={styles.title}>Frequently Asked Questions</Text>
                    
                    <View style={styles.faqContainer}>
                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>How do I create a custom workout?</Text>
                            <Text style={styles.faqAnswer}>
                                Tap the "Create New Workout" button on the home screen, then configure your work/rest intervals, rounds, and optional warm-up/cool-down periods.
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>Can I edit preset workouts?</Text>
                            <Text style={styles.faqAnswer}>
                                Preset workouts cannot be edited, but you can create a custom workout with similar settings and adjust them to your preference.
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>How do I adjust the volume?</Text>
                            <Text style={styles.faqAnswer}>
                                Use the Sound Volume setting above to choose between Low, Medium, or High volume for audio cues.
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>Does the timer work in the background?</Text>
                            <Text style={styles.faqAnswer}>
                                Yes! The timer continues running even when your screen is locked or you switch to another app. Audio cues will keep you on track.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Social Media Section */}
                <View style={styles.sectionCard}>
                    <Text style={styles.title}>Connect With Us</Text>
                    
                    <View style={styles.socialContainer}>
                        <TouchableOpacity 
                            style={styles.socialButton}
                            onPress={() => handleOpenURL('https://twitter.com/yourusername')}
                        >
                            <Ionicons name="logo-twitter" size={24} color={colors.dark.text} />
                            <Text style={styles.socialButtonText}>Twitter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.socialButton}
                            onPress={() => handleOpenURL('https://instagram.com/yourusername')}
                        >
                            <Ionicons name="logo-instagram" size={24} color={colors.dark.text} />
                            <Text style={styles.socialButtonText}>Instagram</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.socialButton}
                            onPress={() => handleOpenURL('https://facebook.com/yourpage')}
                        >
                            <Ionicons name="logo-facebook" size={24} color={colors.dark.text} />
                            <Text style={styles.socialButtonText}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.socialButton}
                            onPress={() => handleOpenURL('https://github.com/yourusername')}
                        >
                            <Ionicons name="logo-github" size={24} color={colors.dark.text} />
                            <Text style={styles.socialButtonText}>GitHub</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Legal Section */}
                <View style={styles.sectionCard}>
                    <Text style={styles.title}>Legal</Text>

                    <TouchableOpacity 
                        style={styles.linkItem}
                        onPress={() => handleOpenURL('https://yourwebsite.com/privacy')}
                    >
                        <View style={styles.linkContent}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={colors.dark.text} />
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.dark.muted} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity 
                        style={styles.linkItem}
                        onPress={() => handleOpenURL('https://yourwebsite.com/terms')}
                    >
                        <View style={styles.linkContent}>
                            <Ionicons name="document-text-outline" size={20} color={colors.dark.text} />
                            <Text style={styles.linkText}>Terms of Service</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.dark.muted} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity 
                        style={styles.linkItem}
                        onPress={() => handleOpenURL('mailto:support@yourapp.com')}
                    >
                        <View style={styles.linkContent}>
                            <Ionicons name="mail-outline" size={20} color={colors.dark.text} />
                            <Text style={styles.linkText}>Contact Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.dark.muted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footerActions}>
                    <Button
                        title="Reset to defaults"
                        variant="secondary"
                        onPress={async () => {
                            try {
                                if (!soundEnabled) toggleSound()
                                if (!vibrationEnabled) toggleVibration()
                                if (!voiceEnabled) toggleVoice()
                                await setSoundVolume(1.0)
                            } catch (e) {
                                console.error('Failed to reset settings', e)
                            }
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },
    contentContainer: {
        padding: spacing.md,
    },
    sectionCard: {
        backgroundColor: colors.dark.surface,
        borderWidth: 1,
        borderColor: colors.dark.border,
        borderRadius: 16,
        padding: spacing.lg,
    },
    title: {
        fontSize: fontSizes['2xl'],
        fontWeight: '700',
        marginBottom: spacing.md,
        color: colors.dark.text,
    },
    setting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: colors.dark.divider,
    },
    settingContent: {
        flex: 1,
        marginRight: spacing.md,
    },
    settingLabel: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        marginBottom: spacing.xs,
        color: colors.dark.text,
    },
    settingDescription: {
        fontSize: fontSizes.sm,
        color: colors.dark.muted,
    },
    volumeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    volumeOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.dark.border,
        paddingVertical: spacing.sm,
        borderRadius: 10,
        backgroundColor: colors.dark.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    volumeOptionActive: {
        backgroundColor: colors.dark.primary,
        borderColor: colors.dark.primary,
    },
    volumeOptionText: {
        color: colors.dark.text,
        fontWeight: '700',
        fontSize: fontSizes.sm,
    },
    volumeOptionTextActive: {
        color: colors.dark.text,
    },
    rateAppContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    rateAppIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${colors.accent}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
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
    aboutContainer: {
        gap: spacing.md,
    },
    aboutText: {
        fontSize: fontSizes.md,
        color: colors.dark.subtle,
        lineHeight: 22,
    },
    versionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.dark.divider,
    },
    versionLabel: {
        fontSize: fontSizes.md,
        color: colors.dark.muted,
        fontWeight: '600',
    },
    versionText: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '700',
    },
    featuresList: {
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    featureText: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '500',
    },
    buildInfo: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.dark.divider,
        alignItems: 'center',
    },
    buildInfoText: {
        fontSize: fontSizes.sm,
        color: colors.dark.muted,
        fontStyle: 'italic',
    },
    faqContainer: {
        gap: spacing.sm,
    },
    faqItem: {
        paddingVertical: spacing.xs,
    },
    faqQuestion: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    faqAnswer: {
        fontSize: fontSizes.sm,
        color: colors.dark.subtle,
        lineHeight: 20,
    },
    tipsContainer: {
        gap: spacing.sm,
    },
    tipItem: {
        flexDirection: 'row',
        paddingVertical: spacing.xs,
        gap: spacing.md,
    },
    tipIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${colors.accent}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    tipText: {
        fontSize: fontSizes.sm,
        color: colors.dark.subtle,
        lineHeight: 20,
    },
    socialContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    socialButton: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.dark.surfaceAlt,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    socialButtonText: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '600',
    },
    linkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    linkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    linkText: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '600',
    },
    footerActions: {
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
})
