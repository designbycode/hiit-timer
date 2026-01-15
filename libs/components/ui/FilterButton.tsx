import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

export interface FilterButtonProps {
    label: string
    active: boolean
    onPress: () => void
    style?: ViewStyle
}

/**
 * Reusable filter button component for filter bars
 */
export function FilterButton({ label, active, onPress, style }: FilterButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.button, active && styles.buttonActive, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        backgroundColor: colors.dark.background,
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    buttonActive: {
        backgroundColor: colors.dark.primary,
        borderColor: colors.dark.primary,
    },
    text: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
        fontWeight: '600',
    },
    textActive: {
        color: colors.dark.background,
    },
})
