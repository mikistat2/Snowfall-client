import { useEffect, useRef } from 'react';
import { NATIVE } from '../lib/platform';

type BackHandler = (info: { canGoBack: boolean }) => void;

/**
 * Android hardware/gesture back.
 *
 * Capacitor's default is to exit the app, which is wrong everywhere except the
 * home tab — so the listener is registered unconditionally and the caller
 * decides. The handler is held in a ref so changing it does not tear down and
 * re-register the native listener on every render.
 */
export function useAndroidBackButton(handler: BackHandler): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!NATIVE) return;

    let remove: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('backButton', (info) => {
          handlerRef.current({ canGoBack: Boolean(info?.canGoBack) });
        });
        if (cancelled) {
          void listener.remove();
          return;
        }
        remove = () => void listener.remove();
      } catch {
        /* plugin unavailable — Android's default behaviour stands */
      }
    })();

    return () => {
      cancelled = true;
      remove?.();
    };
  }, []);
}

/** Closes the app. Only ever called from the home tab, after a confirm tap. */
export async function exitApp(): Promise<void> {
  if (!NATIVE) return;
  try {
    const { App } = await import('@capacitor/app');
    await App.exitApp();
  } catch {
    /* nothing sensible to fall back to */
  }
}
