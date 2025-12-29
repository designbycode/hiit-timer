import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  const translateY = useRef(new Animated.Value(300)).current;
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        translateY.setValue(300);
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    } else if (isMounted) {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIsMounted(false);
      });
    }
  }, [visible, isMounted, translateY]);

  return (
    <Modal transparent visible={visible || isMounted} onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayFill}
          activeOpacity={1}
          onPress={onRequestClose}
        />
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttonColumn}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sheetButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  button.style === 'cancel' && styles.cancelButton,
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    styles.sheetButtonText,
                    button.style === 'destructive' && styles.sheetButtonTextOnDark,
                    button.style === 'cancel' && styles.sheetButtonTextOnDark,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  overlayFill: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderColor: colors.dark.border,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.border,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.dark.text,
    fontSize: fontSizes['2xl'],
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: colors.dark.muted,
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonColumn: {
    gap: spacing.md,
  },
  sheetButton: {
    width: '100%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.dark.text,
  },
  destructiveButton: {
    backgroundColor: colors.dark.error,
  },
  cancelButton: {
    backgroundColor: colors.dark.border,
  },
  sheetButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: fontSizes.md,
  },
  sheetButtonTextOnDark: {
    color: colors.dark.text,
  },
});

export default CustomModal;
