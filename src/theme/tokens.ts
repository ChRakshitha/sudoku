export interface ColorTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderStrong: string;
  streak: string;
  streakBg: string;
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  note: string;
  noteBg: string;
  selectedBg: string;
  highlightBg: string;
  sameNumberBg: string;
}

export interface Theme {
  colors: ColorTokens;
  isDark: boolean;
}

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#111111',
    primaryLight: '#F2F2F2',
    primaryDark: '#000000',
    textPrimary: '#0A0A0A',
    textSecondary: '#6B6B6B',
    textTertiary: '#A3A3A3',
    border: '#E5E5E5',
    borderStrong: '#C7C7C7',
    streak: '#262626',
    streakBg: '#F2F2F2',
    success: '#262626',
    successBg: '#F2F2F2',
    error: '#DC2626',
    errorBg: '#FEF2F2',
    note: '#737373',
    noteBg: '#F5F5F5',
    selectedBg: '#E0E0E0',
    highlightBg: '#F5F5F5',
    sameNumberBg: '#D4D4D4',
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#0A0A0A',
    surface: '#141414',
    surfaceElevated: '#1C1C1C',
    primary: '#F5F5F5',
    primaryLight: '#262626',
    primaryDark: '#FFFFFF',
    textPrimary: '#F5F5F5',
    textSecondary: '#A3A3A3',
    textTertiary: '#6B6B6B',
    border: '#262626',
    borderStrong: '#3A3A3A',
    streak: '#E5E5E5',
    streakBg: '#1C1C1C',
    success: '#E5E5E5',
    successBg: '#1C1C1C',
    error: '#F87171',
    errorBg: '#1C0B0B',
    note: '#A3A3A3',
    noteBg: '#1C1C1C',
    selectedBg: '#333333',
    highlightBg: '#1C1C1C',
    sameNumberBg: '#3A3A3A',
  },
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 38,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
};
