import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { hapticManager } from '@/libs/services/alerts/HapticManager';
import { useAudio } from '@/libs/contexts/AudioContext';
import { ANIMATIONS } from '@/libs/constants/animations';
import { colors } from '@/libs/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'accent';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconOnly?: boolean;
}

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon,
    iconOnly = false,
  }) => {
    const scale = useSharedValue(1);
    const { playButtonClick } = useAudio();

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.95, ANIMATIONS.spring);
      hapticManager.trigger('light');
      playButtonClick();
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, ANIMATIONS.spring);
    };

    const handlePress = () => {
      if (!disabled && !loading) {
        onPress();
      }
    };

    const buttonStyle = [
      styles.button,
      styles[variant],
      disabled && styles.disabled,
      style,
    ];

    const buttonTextStyle = [
      styles.text,
      styles[`${variant}Text`],
      disabled && styles.disabledText,
      textStyle,
    ];

    return (
      <AnimatedTouchable
        style={[buttonStyle, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? colors.dark.text : colors.dark.primary}
          />
        ) : icon ? (
          icon
        ) : (
          <Text style={buttonTextStyle}>{title}</Text>
        )}
      </AnimatedTouchable>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.dark.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.dark.primary,
  },
  danger: {
    backgroundColor: colors.dark.error, // Using the error color from theme
  },
  accent: {
    backgroundColor: colors.accent, // Using the accent color from theme
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.dark.muted,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.dark.text,
  },
  secondaryText: {
    color: colors.dark.primary,
  },
  dangerText: {
    color: colors.dark.text,
  },
  disabledText: {
    color: colors.dark.muted,
  },
  accentText: {
    color: colors.dark.text,
  },
});

