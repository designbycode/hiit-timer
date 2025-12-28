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
import { hapticManager } from '@/services/alerts/HapticManager';
import { ANIMATIONS } from '@/constants/animations';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.95, ANIMATIONS.spring);
      hapticManager.trigger('light');
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
            color={variant === 'primary' ? '#FFFFFF' : '#007AFF'}
          />
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
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  danger: {
    backgroundColor: '#F44336',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    opacity: 0.6,
  },
});

