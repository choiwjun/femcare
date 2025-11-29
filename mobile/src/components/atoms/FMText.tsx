import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Typography, Colors } from '@/styles/tokens';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'button';
type ColorVariant = 'primary' | 'secondary' | 'light' | 'white' | 'error';

interface FMTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorVariant;
  children: React.ReactNode;
}

export const FMText: React.FC<FMTextProps> = ({
  variant = 'body1',
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const typographyStyle = Typography[variant];
  const colorStyle = getColorStyle(color);

  return (
    <Text style={[typographyStyle, colorStyle, style]} {...props}>
      {children}
    </Text>
  );
};

const getColorStyle = (color: ColorVariant) => {
  switch (color) {
    case 'primary':
      return { color: Colors.textPrimary };
    case 'secondary':
      return { color: Colors.textSecondary };
    case 'light':
      return { color: Colors.textLight };
    case 'white':
      return { color: Colors.textWhite };
    case 'error':
      return { color: Colors.error };
    default:
      return { color: Colors.textPrimary };
  }
};
