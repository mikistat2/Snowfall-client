import { NATIVE } from './platform';

/**
 * Native-only startup: everything that has to happen once, before the first
 * paint, inside the Android app. No-ops in the browser so the web bundle
 * never pays for it.
 *
 * The plugins are imported dynamically for exactly that reason — a static
 * import would pull the whole native bridge into the web chunk.
 */
export async function initNative(): Promise<void> {
  if (!NATIVE) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    // content draws behind the status bar; the shell adds safe-area padding
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Default });
  } catch {
    /* status bar is cosmetic — never block boot on it */
  }
}

/**
 * Hides the splash screen. Called after the first render so the user never
 * sees a white flash between the splash and the app shell.
 */
export async function hideSplash(): Promise<void> {
  if (!NATIVE) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    /* if the plugin is missing the splash auto-hides on its own timer */
  }
}
