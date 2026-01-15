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
