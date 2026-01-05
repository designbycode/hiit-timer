import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { hapticManager } from '@/libs/services/alerts/HapticManager'
import Constants from 'expo-constants'

// Inline config to avoid import errors
const AppConfig = {
    info: {
        version: Constants.expoConfig?.version || '1.0.1'
    }
}

const SocialConfig = {
    twitter: 'https://twitter.com/yourusername',
    instagram: 'https://instagram.com/yourusername', 
    facebook: 'https://facebook.com/yourpage',
    github: 'https://github.com/yourusername'
}

export function AboutSection() {
    const handleOpenURL = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url)
            if (supported) {
                hapticManager.trigger('light')
                await Linking.openURL(url)
            }
        } catch (error) {
            console.error('Error opening URL:', error)
        }
    }

    const socialLinks = [
        { icon: 'logo-twitter', label: 'Twitter', url: SocialConfig.twitter },
        { icon: 'logo-instagram', label: 'Instagram', url: SocialConfig.instagram },
        { icon: 'logo-facebook', label: 'Facebook', url: SocialConfig.facebook },
        { icon: 'logo-github', label: 'GitHub', url: SocialConfig.github },
    ]

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
                        <Text style={styles.versionText}>{AppConfig.info.version}</Text>
                    </View>
                    
                    <View style={styles.buildInfo}>
                        <Text style={styles.buildInfoText}>
                            Made with ❤️ for fitness enthusiasts
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.title}>Connect With Us</Text>
                
                <View style={styles.socialContainer}>
                    {socialLinks.map((social) => (
                        <TouchableOpacity
                            key={social.label}
                            style={styles.socialButton}
                            onPress={() => handleOpenURL(social.url)}
                        >
                            <Ionicons name={social.icon as any} size={24} color={colors.dark.text} />
                            <Text style={styles.socialButtonText}>{social.label}</Text>
                        </TouchableOpacity>
                    ))}
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
})
