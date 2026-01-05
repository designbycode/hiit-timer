import React from 'react'
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'
import { hapticManager } from '@/libs/services/alerts/HapticManager'

interface PrimaryButtonProps {
    title: string
    onPress: () => void
    icon?: keyof typeof Ionicons.glyphMap
    disabled?: boolean
    loading?: boolean
    style?: ViewStyle
    variant?: 'primary' | 'secondary' | 'danger'
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    icon = 'save-outline',
    disabled = false,
    loading = false,
    style,
    variant = 'primary',
}) => {
    const handlePress = () => {
        if (!disabled && !loading) {
            hapticManager.trigger('medium')
            onPress()
        }
    }

    const buttonStyle = [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        (disabled || loading) && styles.disabledButton,
        style,
    ]

    const textColor =
        variant === 'secondary' ? colors.dark.primary : colors.dark.background

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={textColor}
                            style={styles.icon}
                        />
                    )}
                    <Text style={[styles.buttonText, { color: textColor }]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 16,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    primaryButton: {
        backgroundColor: colors.accent,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.dark.primary,
    },
    dangerButton: {
        backgroundColor: colors.dark.error,
    },
    disabledButton: {
        opacity: 0.5,
    },
    icon: {
        // Icon styles handled inline
    },
    buttonText: {
        fontSize: fontSizes.md,
        fontWeight: '700',
    },
})
