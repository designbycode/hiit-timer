import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

export interface SectionCardProps {
    title?: string
    children: React.ReactNode
    style?: ViewStyle
}

/**
 * Reusable section card wrapper component
 */
export function SectionCard({ title, children, style }: SectionCardProps) {
    return (
        <View style={[styles.card, style]}>
            {title && <Text style={styles.title}>{title}</Text>}
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
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
})
