import { useSyncExternalStore } from 'react';
import { getMode, resolveTheme, setMode, subscribe, type ResolvedTheme, type ThemeMode } from '../lib/theme';

/**
 * Re-renders whenever the theme changes — including when the OS flips while
 * the mode is 'system'.
 */
export function useTheme(): {
  mode: ThemeMode;
  theme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
} {
  const mode = useSyncExternalStore(subscribe, getMode, getMode);
  const theme = resolveTheme(mode);
  return { mode, theme, setMode };
}
