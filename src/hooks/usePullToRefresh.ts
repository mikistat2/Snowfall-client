import { useEffect, useRef, useState } from 'react';

/**
 * Pull-to-refresh for the mobile shell's scroll region.
 *
 * The gesture is bound to the nearest `.mobile-scroll` ancestor rather than to
 * the page element, because that is the element that actually scrolls — the
 * page itself never does. `overscroll-behavior: contain` on that container
 * already suppresses Android's own glow, so the pull reads as ours.
 *
 * Only vertical drags that start at scrollTop 0 are claimed, and a drag is
 * abandoned the moment it looks horizontal, so this never fights a swipe or a
 * list scroll. Resistance is applied so the sheet feels rubber-banded rather
 * than glued to the finger.
 */

/** Drag distance, after resistance, that arms the refresh. */
const THRESHOLD = 72;
/** Hard cap so a long drag cannot push the content off-screen. */
const MAX_PULL = 110;
/** Fraction of finger travel that becomes pull — the rubber-band feel. */
const RESISTANCE = 0.5;

export interface PullState {
  /** Current pull distance in px, already damped. */
  distance: number;
  /** Past the threshold — releasing now triggers `onRefresh`. */
  armed: boolean;
  /** `onRefresh` is in flight. */
  refreshing: boolean;
}

export function usePullToRefresh(
  ref: React.RefObject<HTMLElement | null>,
  onRefresh: () => Promise<unknown>,
): PullState {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Kept in refs so the touch handlers stay stable and never re-subscribe
  // mid-gesture, which would drop the pull.
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const scroller = ref.current?.closest('.mobile-scroll') as HTMLElement | null;
    if (!scroller) return;

    let startY = 0;
    let startX = 0;
    let pulling = false;   // gesture claimed as a pull
    let decided = false;   // axis resolved for this touch
    let current = 0;

    function reset() {
      pulling = false;
      decided = false;
      current = 0;
      setDistance(0);
    }

    function onTouchStart(event: TouchEvent) {
      if (refreshingRef.current || event.touches.length !== 1) return;
      // Only a drag that begins at the very top can become a pull.
      if ((scroller as HTMLElement).scrollTop > 0) return;
      const touch = event.touches[0]!;
      startY = touch.clientY;
      startX = touch.clientX;
      decided = false;
      pulling = true;
    }

    function onTouchMove(event: TouchEvent) {
      if (!pulling || refreshingRef.current) return;
      const touch = event.touches[0]!;
      const dy = touch.clientY - startY;
      const dx = touch.clientX - startX;

      if (!decided) {
        // Wait for a few px before committing, then let the dominant axis win.
        if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return;
        decided = true;
        if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
          pulling = false;
          return;
        }
      }

      // The user scrolled back up into content — hand the gesture back.
      if (dy <= 0 || (scroller as HTMLElement).scrollTop > 0) {
        reset();
        return;
      }

      current = Math.min(MAX_PULL, dy * RESISTANCE);
      // Suppress the native scroll so the container does not also move.
      if (event.cancelable) event.preventDefault();
      setDistance(current);
    }

    function onTouchEnd() {
      if (!pulling || refreshingRef.current) {
        if (!refreshingRef.current) reset();
        return;
      }
      const armed = current >= THRESHOLD;
      pulling = false;
      decided = false;

      if (!armed) {
        current = 0;
        setDistance(0);
        return;
      }

      refreshingRef.current = true;
      setRefreshing(true);
      // Hold the indicator at the threshold while the refetch runs.
      setDistance(THRESHOLD);
      void Promise.resolve(onRefreshRef.current())
        .catch(() => undefined)
        .finally(() => {
          refreshingRef.current = false;
          setRefreshing(false);
          current = 0;
          setDistance(0);
        });
    }

    // `passive: false` on move only — that handler calls preventDefault.
    scroller.addEventListener('touchstart', onTouchStart, { passive: true });
    scroller.addEventListener('touchmove', onTouchMove, { passive: false });
    scroller.addEventListener('touchend', onTouchEnd, { passive: true });
    scroller.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      scroller.removeEventListener('touchstart', onTouchStart);
      scroller.removeEventListener('touchmove', onTouchMove);
      scroller.removeEventListener('touchend', onTouchEnd);
      scroller.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [ref]);

  return { distance, armed: distance >= THRESHOLD, refreshing };
}
