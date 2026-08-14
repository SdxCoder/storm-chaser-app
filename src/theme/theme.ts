export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  action: string;
  warning: string;
  error: string;
  border: string;
};

export const lightColors: ThemeColors = {
  background: '#F4F7F9',
  surface: '#FFFFFF',
  surfaceElevated: '#E8EEF2',
  textPrimary: '#13222C',
  textSecondary: '#526570',
  action: '#006B8F',
  warning: '#8A4D00',
  error: '#B42318',
  border: '#C5D0D6',
};

export const darkColors: ThemeColors = {
  background: '#0D171D',
  surface: '#15242C',
  surfaceElevated: '#20333D',
  textPrimary: '#F3F7F9',
  textSecondary: '#B6C4CB',
  action: '#55C2E8',
  warning: '#FFB65C',
  error: '#FF8A80',
  border: '#3B505B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
} as const;

export const typography = {
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
} as const;
