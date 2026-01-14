import React from 'react'
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

interface AlertsSectionProps {
    soundEnabled: boolean
    vibrationEnabled: boolean
    voiceEnabled: boolean
    soundVolume: number
    onToggleSound: () => void
    onToggleVibration: () => void
    onToggleVoice: () => void
    onSetVolume: (volume: number) => void
    onPressIn?: () => void
}

export function AlertsSection({
    soundEnabled,
    vibrationEnabled,
    voiceEnabled,
    soundVolume,
    onToggleSound,
    onToggleVibration,
    onToggleVoice,
    onSetVolume,
    onPressIn,
}: AlertsSectionProps) {
    return (
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
                    onValueChange={onToggleSound}
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
                    onValueChange={onToggleVibration}
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
                    onValueChange={onToggleVoice}
                    trackColor={{
                        false: colors.dark.divider,
                        true: colors.dark.primary,
                    }}
                    thumbColor={colors.dark.text}
                    ios_backgroundColor={colors.dark.divider}
                />
            </View>

            <View style={styles.divider} />

            <View style={[styles.setting, { alignItems: 'flex-start' }]}>
                <View style={styles.settingContent}>
                    <Text style={styles.settingLabel}>Sound Volume</Text>
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
                                    Math.abs(soundVolume - opt.value) < 0.05 &&
                                        styles.volumeOptionActive,
                                ]}
                                onPress={() => onSetVolume(opt.value)}
                                onPressIn={onPressIn}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.volumeOptionText,
                                        Math.abs(soundVolume - opt.value) <
                                            0.05 &&
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
    setting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    divider: {
        height: 1,
        backgroundColor: colors.dark.divider,
    },
    settingContent: {
        flex: 1,
        marginRight: spacing.sm,
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
        flex: 1,
        width: '100%',
        marginTop: spacing.xs,
        gap: spacing.xs,
    },
    volumeOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.dark.border,
        paddingVertical: spacing.xs,
        borderRadius: 8,
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
})
