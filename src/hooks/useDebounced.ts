import { useEffect, useState } from 'react';

/**
 * Delays a fast-changing value so it can be used as a query key.
 *
 * The members search box is the reason this exists. Its value is part of the
 * React Query key, so before this every keystroke was a distinct query and a
 * separate request: typing a six-letter name fired six full roster fetches, of
 * which five were thrown away before they arrived. On a gym's mobile data that
 * is five wasted round-trips per search, on the largest response the API serves.
 *
 * 300ms is below the pause between words when typing and above the gap between
 * letters, so a search fires when someone stops typing rather than while they
 * still are.
 */
export function useDebounced<T>(value: T, delayMs = 300): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    // Each new keystroke cancels the pending one, so only the final value in a
    // burst is ever committed.
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
}
