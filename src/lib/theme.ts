import * as storage from './storage';
import { NATIVE } from './platform';

/**
 * Light/dark theme.
 *
 * Default is 'light'. Following the phone's setting sounds friendlier, but it
 * means two staff on the same shift see different-looking apps and neither can
 * say why; the product is designed and screenshotted light, so that is what a
 * fresh install gets. 'system' is still one tap away in Settings → Appearance.
 *
 * It is a class on <html> rather than a pure `prefers-color-scheme` media
 * query precisely so a pinned choice can win over the OS.
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
    // Anything already pinned wins — including 'system', which is only ever
    // stored because someone chose it.
    mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'light';
  }
  return mode;
}

export function resolveTheme(m: ThemeMode = getMode()): ResolvedTheme {
  if (m === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return m;
}

/**
 * Status bar icons are white in BOTH themes, because what sits behind them is
 * not the page — it is the app bar, which draws the same sky gradient light or
 * dark (the WebView renders under the status bar). Capacitor's naming is the
 * trap here: `Style.Dark` means "dark background, so use light content".
 */
async function syncNativeChrome(_theme: ResolvedTheme): Promise<void> {
  if (!NATIVE) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
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
