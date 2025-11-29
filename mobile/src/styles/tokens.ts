/**
 * Lanove 디자인 시스템 토큰
 */

export const Colors = {
  // Primary
  primary: '#F7C8C0',
  primaryDark: '#F5A97F',
  primaryLight: 'rgba(247, 200, 192, 0.1)',

  // Background
  background: '#F5EEE8',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#8C6762',
  textSecondary: '#5A5A5A',
  textLight: '#9B9B9B',
  textWhite: '#FFFFFF',

  // Border
  border: '#E5E5E5',
  borderLight: '#F5EEE8',

  // Status
  success: '#7BC9A6',
  warning: '#F5A97F',
  error: '#E89B9B',
  info: '#A8C5E8',
} as const;

export const Typography = {
  fontFamily: 'Pretendard',

  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 39.2,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 33.6,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 27,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 25.6,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22.4,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 22,
  round: 9999,
} as const;

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
