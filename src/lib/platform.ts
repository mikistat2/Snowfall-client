import { Capacitor } from '@capacitor/core';

/**
 * Platform detection — the one place that answers "are we inside the Android
 * app?". Everything else (navigation shell, storage backend, camera source)
 * branches on these helpers rather than sniffing the user agent.
 *
 * `NATIVE` is captured once at module load: Capacitor's platform cannot change
 * during a session, and a constant lets bundlers tree-shake native-only paths
 * out of the web build.
 */
export const NATIVE: boolean = Capacitor.isNativePlatform();

/** 'android' | 'ios' | 'web' */
export const PLATFORM: string = Capacitor.getPlatform();

export const IS_ANDROID: boolean = PLATFORM === 'android';

/** Is a Capacitor plugin actually available? False in the browser for native-only plugins. */
export function hasPlugin(name: string): boolean {
  return Capacitor.isPluginAvailable(name);
}
