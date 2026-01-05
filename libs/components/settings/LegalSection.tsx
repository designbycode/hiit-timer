import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
// Inline config to avoid import errors
const LegalConfig = {
    privacyPolicy: 'https://yourwebsite.com/privacy',
    termsOfService: 'https://yourwebsite.com/terms',
    licenses: 'https://yourwebsite.com/licenses',
    supportEmail: 'support@yourapp.com'
}
import { hapticManager } from '@/libs/services/alerts/HapticManager'

export function LegalSection() {
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

    const legalLinks = [
        {
            icon: 'shield-checkmark-outline',
            label: 'Privacy Policy',
            url: LegalConfig.privacyPolicy,
        },
        {
            icon: 'document-text-outline',
            label: 'Terms of Service',
            url: LegalConfig.termsOfService,
        },
        {
            icon: 'mail-outline',
            label: 'Contact Support',
            url: `mailto:${LegalConfig.supportEmail}`,
        },
        {
            icon: 'code-slash-outline',
            label: 'Open Source Licenses',
            url: LegalConfig.licenses,
        },
    ]

    return (
        <View style={styles.sectionCard}>
            <Text style={styles.title}>Legal</Text>

            {legalLinks.map((link, index) => (
                <React.Fragment key={link.label}>
                    <TouchableOpacity 
                        style={styles.linkItem}
                        onPress={() => handleOpenURL(link.url)}
                    >
                        <View style={styles.linkContent}>
                            <Ionicons name={link.icon as any} size={20} color={colors.dark.text} />
                            <Text style={styles.linkText}>{link.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.dark.muted} />
                    </TouchableOpacity>
                    {index < legalLinks.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
            ))}
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
    },
    title: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.dark.text,
        marginBottom: spacing.md,
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
    divider: {
        height: 1,
        backgroundColor: colors.dark.divider,
    },
})
