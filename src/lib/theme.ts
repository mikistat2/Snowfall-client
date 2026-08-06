import * as storage from './storage';
import { NATIVE } from './platform';

/**
 * Light/dark theme.
 *
 * Default is 'system' — gym floors are often dim and the phone is usually
 * already set to dark there — but staff can pin a theme from Settings, so this
 * is a class on <html> rather than a pure `prefers-color-scheme` media query.
 */

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const DARK_QUERY = '(prefers-color-scheme: dark)';

let mode: ThemeMode | null = null;
const listeners = new Set<() => void>();

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
}

export function getMode(): ThemeMode {
  if (mode === null) {
    const stored = storage.get('theme');
    mode = stored === 'light' || stored === 'dark' ? stored : 'system';
  }
  return mode;
}

export function resolveTheme(m: ThemeMode = getMode()): ResolvedTheme {
  if (m === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return m;
}

/** Status bar icons must invert with the theme or they vanish against it. */
async function syncNativeChrome(theme: ResolvedTheme): Promise<void> {
  if (!NATIVE) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
  } catch {
    /* cosmetic only */
  }
}

function apply(): void {
  const theme = resolveTheme();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
  void syncNativeChrome(theme);
  for (const listener of listeners) listener();
}

export function setMode(next: ThemeMode): void {
  mode = next;
  storage.set('theme', next);
  apply();
}

/** Called once at boot, before the first render. */
export function initTheme(): void {
  apply();
  if (typeof window === 'undefined') return;
  // Follow the OS only while the user has not pinned a theme.
  window.matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (getMode() === 'system') apply();
  });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
