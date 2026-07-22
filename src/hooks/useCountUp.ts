import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './useInView';

/**
 * Counts from 0 up to `target` once `active` becomes true, easing out over
 * `duration` ms. Jumps straight to the target when motion is reduced. Keeps the
 * same number of decimals as the target (so 1 stays "1", 1.5 stays "1.5").
 */
export function useCountUp(target: number, active: boolean, duration = 1400): number {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}
