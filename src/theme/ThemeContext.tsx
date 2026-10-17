import React, { createContext, useContext } from 'react';
import { lightTheme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(lightTheme);

// Always light: the app's look is white-first regardless of the device setting.
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeContext.Provider value={lightTheme}>{children}</ThemeContext.Provider>
);

export const useTheme = (): Theme => useContext(ThemeContext);
