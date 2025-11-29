import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/styles/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface FMButtonProps {
  text: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const FMButton: React.FC<FMButtonProps> = ({
  text,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const buttonStyle = [
    styles.button,
    getVariantStyle(variant),
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    getTextVariantStyle(variant),
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.textWhite} />
      ) : (
        <Text style={textStyle}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

const getVariantStyle = (variant: ButtonVariant): ViewStyle => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: Colors.primary,
      };
    case 'secondary':
      return {
        backgroundColor: Colors.success,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
      };
  }
};

const getTextVariantStyle = (variant: ButtonVariant): TextStyle => {
  switch (variant) {
    case 'primary':
    case 'secondary':
      return {
        color: Colors.textWhite,
      };
    case 'outline':
      return {
        color: Colors.primary,
      };
  }
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.5,
  },
});
