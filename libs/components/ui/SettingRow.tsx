import React from 'react'
import { View, Text, StyleSheet, Switch } from 'react-native'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

export interface SettingRowProps {
    label: string
    description?: string
    value: boolean
    onValueChange: (value: boolean) => void
    showDivider?: boolean
}

/**
 * Reusable setting row component with switch/toggle
 */
export function SettingRow({
    label,
    description,
    value,
    onValueChange,
    showDivider = true,
}: SettingRowProps) {
    return (
        <>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.label}>{label}</Text>
                    {description && (
                        <Text style={styles.description}>{description}</Text>
                    )}
                </View>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{
                        false: colors.dark.divider,
                        true: colors.dark.primary,
                    }}
                    thumbColor={colors.dark.text}
                    ios_backgroundColor={colors.dark.divider}
                />
            </View>
            {showDivider && <View style={styles.divider} />}
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    content: {
        flex: 1,
        marginRight: spacing.sm,
    },
    label: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        marginBottom: spacing.xs,
        color: colors.dark.text,
    },
    description: {
        fontSize: fontSizes.sm,
        color: colors.dark.muted,
    },
    divider: {
        height: 1,
        backgroundColor: colors.dark.divider,
    },
})
