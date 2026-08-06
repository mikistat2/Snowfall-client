import { Preferences } from '@capacitor/preferences';
import { NATIVE } from './platform';

/**
 * Persistent key/value store with a **synchronous** read API.
 *
 * Why this exists: the axios interceptor, the auth context's `useState`
 * initializer and `t()` all need a value *now*, but Capacitor Preferences —
 * the durable Android store, which survives WebView data being cleared in a
 * way `localStorage` does not — is async-only.
 *
 * The compromise: every key is read once into an in-memory cache at boot
 * (`hydrate()`, awaited in main.tsx before the first render), reads come from
 * the cache, and writes go to the cache immediately and to the backing store
 * in the background. Callers never see a Promise.
 */

const KEYS = [
  'accessToken',
  'refreshToken',
  'authUser',
  'authGym',
  'locale',
  'cameraSource',
  'theme',
] as const;

export type StorageKey = (typeof KEYS)[number];

const cache = new Map<StorageKey, string>();
let hydrated = false;

/** Fire-and-forget native write; a failed write must never break a render. */
function persist(key: StorageKey, value: string | null): void {
  if (NATIVE) {
    void (value === null
      ? Preferences.remove({ key })
      : Preferences.set({ key, value })
    ).catch(() => undefined);
    return;
  }
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* private-mode browsers: the value just won't survive a reload */
  }
}

function readLocalStorage(key: StorageKey): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Loads every known key into the cache. Must be awaited before the app
 * renders. On native it also migrates any values left in the WebView's
 * localStorage by an earlier build, so an update doesn't log users out.
 */
export async function hydrate(): Promise<void> {
  if (hydrated) return;

  if (NATIVE) {
    await Promise.all(
      KEYS.map(async (key) => {
        let value: string | null = null;
        try {
          value = (await Preferences.get({ key })).value;
        } catch {
          value = null;
        }
        // one-time carry-over from the pre-Preferences web storage
        if (value === null) {
          const legacy = readLocalStorage(key);
          if (legacy !== null) {
            value = legacy;
            void Preferences.set({ key, value: legacy }).catch(() => undefined);
          }
        }
        if (value !== null) cache.set(key, value);
      }),
    );
  } else {
    for (const key of KEYS) {
      const value = readLocalStorage(key);
      if (value !== null) cache.set(key, value);
    }
  }

  hydrated = true;
}

export function get(key: StorageKey): string | null {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  // Before hydrate() resolves the web backend is still readable synchronously,
  // so a very early read (module-eval order) is not a miss on web.
  return NATIVE ? null : readLocalStorage(key);
}

export function set(key: StorageKey, value: string): void {
  cache.set(key, value);
  persist(key, value);
}

export function remove(key: StorageKey): void {
  cache.delete(key);
  persist(key, null);
}

export function getJson<T>(key: StorageKey): T | null {
  const raw = get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJson(key: StorageKey, value: unknown): void {
  set(key, JSON.stringify(value));
}
