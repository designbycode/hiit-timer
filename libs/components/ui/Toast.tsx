import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

export interface ToastProps {
    visible: boolean
    message: string
    action?: {
        label: string
        onPress: () => void
    }
    style?: object
}

/**
 * Reusable Toast/Snackbar component for displaying temporary messages
 */
export function Toast({ visible, message, action, style }: ToastProps) {
    if (!visible) return null

    return (
        <View style={[styles.container, style]}>
            <View style={styles.toast}>
                <Text style={styles.message}>{message}</Text>
                {action && (
                    <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
                        <Text style={styles.actionText}>{action.label}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: spacing.sm,
        right: spacing.sm,
        bottom: 70,
    },
    toast: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.dark.surfaceAlt,
        borderColor: colors.dark.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    message: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '500',
    },
    actionText: {
        color: colors.dark.primary,
        fontSize: fontSizes.md,
        fontWeight: '700',
        marginLeft: spacing.md,
    },
})
