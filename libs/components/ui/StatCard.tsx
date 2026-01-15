import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

export interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap
    iconColor?: string
    iconBackground?: string
    value: string | number
    label: string
    subtext?: string
    style?: ViewStyle
}

/**
 * Reusable stat card component for displaying metrics
 */
export function StatCard({
    icon,
    iconColor = colors.dark.primary,
    iconBackground = 'rgba(255, 152, 0, 0.2)',
    value,
    label,
    subtext,
    style,
}: StatCardProps) {
    return (
        <View style={[styles.card, style]}>
            <View style={[styles.iconCircle, { backgroundColor: iconBackground }]}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
            {subtext && <Text style={styles.subtext}>{subtext}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
        minHeight: 140,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    value: {
        fontSize: fontSizes['3xl'],
        fontWeight: 'bold',
        color: colors.dark.text,
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
        textAlign: 'center',
    },
    subtext: {
        fontSize: fontSizes.xs,
        color: colors.dark.muted,
        marginTop: spacing.xs,
    },
})
