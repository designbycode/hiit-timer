
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, fontSizes, spacing } from '@/libs/constants/theme';

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
  onRequestClose?: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({ visible, title, message, buttons, onRequestClose }) => {
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
    <Modal transparent visible={visible} onRequestClose={onRequestClose}> 
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
    backgroundColor: colors.dark.surface,
    borderRadius: 10,
    padding: spacing.lg,
    width: '80%',
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSizes.md,
    color: colors.dark.muted,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  destructiveButton: {
    backgroundColor: colors.dark.error,
  },
  cancelButton: {
    backgroundColor: colors.dark.border,
  },
  buttonText: {
    color: colors.dark.primary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: colors.dark.text,
  },
  cancelButtonText: {
    color: colors.dark.text,
  }
});

export default CustomModal;
