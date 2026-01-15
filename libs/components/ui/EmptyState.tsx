import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

export interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap
    title: string
    message: string
    actionLabel?: string
    onAction?: () => void
}

/**
 * Reusable empty state component for displaying when lists/data are empty
 */
export function EmptyState({
    icon = 'information-circle-outline',
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color={colors.dark.textSecondary} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={onAction}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing['2xl'],
    },
    title: {
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.dark.text,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: fontSizes.md,
        color: colors.dark.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    button: {
        backgroundColor: colors.dark.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 12,
    },
    buttonText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.dark.text,
    },
})
