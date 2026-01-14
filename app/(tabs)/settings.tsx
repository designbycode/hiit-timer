import React, { useEffect } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useSettingsStore } from '@/libs/store/settingsStore'
import { useButtonSound } from '@/libs/hooks/useButtonSound'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { Button } from '@/libs/components/Button'
import { AlertsSection } from '@/libs/components/settings/AlertsSection'
import { SupportSection } from '@/libs/components/settings/SupportSection'

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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <AlertsSection
                    soundEnabled={soundEnabled}
                    vibrationEnabled={vibrationEnabled}
                    voiceEnabled={voiceEnabled}
                    soundVolume={soundVolume}
                    onToggleSound={toggleSound}
                    onToggleVibration={toggleVibration}
                    onToggleVoice={toggleVoice}
                    onSetVolume={setSoundVolume}
                    onPressIn={handlePressIn}
                />

                <SupportSection />

                {/*<AboutSection />*/}

                {/*<TipsSection />*/}

                {/*<FAQSection />*/}

                {/*<LegalSection />*/}

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
    header: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.dark.border,
    },
    headerTitle: {
        fontSize: fontSizes['2xl'],
        fontWeight: 'bold',
        color: colors.dark.text,
    },
    contentContainer: {
        padding: spacing.sm,
        gap: spacing.sm,
    },
    footerActions: {
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
})
