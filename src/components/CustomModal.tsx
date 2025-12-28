
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';

interface ButtonProps {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface CustomModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: ButtonProps[];
}

const CustomModal: React.FC<CustomModalProps> = ({ visible, title, message, buttons }) => {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  React.useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 300 });
  }, [visible, opacity]);

  return (
    <Modal transparent visible={visible}>
      <Animated.View style={[styles.overlay, animatedStyle]}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'destructive' && styles.destructiveButton,
                  button.style === 'cancel' && styles.cancelButton,
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.dark.surface,
    borderRadius: 10,
    padding: SPACING.lg,
    width: '80%',
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark.muted,
    marginBottom: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 5,
    marginLeft: SPACING.sm,
  },
  destructiveButton: {
    backgroundColor: COLORS.dark.error,
  },
  cancelButton: {
    backgroundColor: COLORS.dark.border,
  },
  buttonText: {
    color: COLORS.dark.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: COLORS.dark.text,
  },
  cancelButtonText: {
    color: COLORS.dark.text,
  }
});

export default CustomModal;
