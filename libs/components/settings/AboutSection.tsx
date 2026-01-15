import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import Constants from 'expo-constants'

// Inline config to avoid import errors

export function AboutSection() {
    return (
        <>
            <View style={styles.sectionCard}>
                <Text style={styles.title}>About HIIT Timer</Text>
                
                <View style={styles.aboutContainer}>
                    <Text style={styles.aboutText}>
                        A powerful yet simple interval timer designed for high-intensity training. 
                        Create custom workouts, track your progress with detailed statistics, and stay 
                        motivated with audio cues, voice announcements, and haptic feedback.
                    </Text>
                    
                    <Text style={styles.sectionHeading}>Core Features</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="create-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Custom workout builder</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="flash-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Quick Start for instant sessions</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="duplicate-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>4 preset workouts (Tabata, Beginner, Intermediate, Advanced)</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="timer-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Configurable warm-up, work, rest, and cool-down phases</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.sectionHeading}>Workout Controls</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="play-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Tap timer to start/pause</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="play-skip-forward-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Skip phases during workout</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="refresh-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Reset and restart options</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="volume-high-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Mute button for silent workouts</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.sectionHeading}>Audio & Feedback</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="megaphone-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Voice announcements for phase changes</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="musical-note-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Audio cues and ticking sounds</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="phone-portrait-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Haptic vibration feedback</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="volume-medium-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Adjustable volume control</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.sectionHeading}>Progress Tracking</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="time-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Complete workout history</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="bar-chart-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Weekly workout statistics</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Monthly calendar view</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="flame-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Workout streaks and achievements</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="star-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Perfect session tracking (no pauses/skips)</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.sectionHeading}>Smart Features</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <Ionicons name="phone-landscape-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Keep screen awake during workouts</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="save-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Auto-save progress in background</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="pause-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Auto-pause when screen locks</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="swap-horizontal-outline" size={20} color={colors.accent} />
                            <Text style={styles.featureText}>Swipe to delete custom workouts</Text>
                        </View>
                    </View>
                    
                    <View style={styles.versionContainer}>
                        <Text style={styles.versionLabel}>Version</Text>
                        <Text style={styles.versionText}>
                            {Constants.expoConfig?.version || '1.0.0'}
                        </Text>
                    </View>
                    
                    <View style={styles.buildInfo}>
                        <Text style={styles.buildInfoText}>
                            Made with ❤️ for fitness enthusiasts
                        </Text>
                    </View>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    sectionCard: {
        backgroundColor: colors.dark.surface,
        borderWidth: 1,
        borderColor: colors.dark.border,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.dark.text,
        marginBottom: spacing.md,
    },
    aboutContainer: {
        gap: spacing.md,
    },
    aboutText: {
        fontSize: fontSizes.md,
        color: colors.dark.subtle,
        lineHeight: 22,
    },
    sectionHeading: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.dark.text,
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    featuresList: {
        gap: spacing.sm,
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
})
