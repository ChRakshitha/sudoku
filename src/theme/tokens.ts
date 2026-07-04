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
    background: '#F7F7FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#5C6AC4',
    primaryLight: '#EEF0FB',
    primaryDark: '#3D4A9E',
    textPrimary: '#0D0D14',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: '#E8E8F0',
    borderStrong: '#C4C4D4',
    streak: '#F97316',
    streakBg: '#FFF7ED',
    success: '#10B981',
    successBg: '#ECFDF5',
    error: '#EF4444',
    errorBg: '#FEF2F2',
    note: '#7C3AED',
    noteBg: '#F5F3FF',
    selectedBg: '#EEF0FB',
    highlightBg: '#F3F4FF',
    sameNumberBg: '#E8EAFC',
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#09090F',
    surface: '#111119',
    surfaceElevated: '#18181F',
    primary: '#818CF8',
    primaryLight: '#1E2043',
    primaryDark: '#6366F1',
    textPrimary: '#F1F1FA',
    textSecondary: '#8892A4',
    textTertiary: '#5A6478',
    border: '#1E1E2E',
    borderStrong: '#2D2D3D',
    streak: '#FB923C',
    streakBg: '#1C1209',
    success: '#34D399',
    successBg: '#0B1F17',
    error: '#F87171',
    errorBg: '#1C0B0B',
    note: '#A78BFA',
    noteBg: '#1A1231',
    selectedBg: '#1E2043',
    highlightBg: '#161830',
    sameNumberBg: '#18193A',
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
