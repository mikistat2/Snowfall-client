import { useEffect, useState } from 'react';
import { NATIVE } from '../lib/platform';

/** Tailwind's `md` breakpoint — below this the desktop layout stops working. */
const MOBILE_QUERY = '(max-width: 767px)';

function matches(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

/** True on a narrow viewport, in the browser or in the app. Re-renders on resize/rotate. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(matches);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    // the media query may already have flipped between render and effect
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

/**
 * Should this render the mobile shell (bottom tabs + stack headers) instead of
 * the desktop sidebar? Always true in the Android app; in the browser it
 * follows the viewport, which is what makes the mobile UI developable and
 * testable without a device.
 */
export function useMobileShell(): boolean {
  const isMobile = useIsMobile();
  return NATIVE || isMobile;
}
