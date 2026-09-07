import { useEffect, useState } from 'react';
import { formatEthiopianAm } from '../../lib/ethiopian';

/** Current date + time, ticking every 30s. Shown at the top of every page. */
export function LiveDate() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const date = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // Recomputed from `now`, so it rolls over with the rest of the line rather
  // than being pinned to whenever the app was opened.
  const ethiopian = formatEthiopianAm(now);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-fg-muted">
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4.5" width="14" height="12" rx="2" />
        <path d="M3 8.5h14M7 2.5v3.5M13 2.5v3.5" />
      </svg>
      <span className="font-medium text-fg">{date}</span>
      {/* A step down in size: the Ethiopian date is the one most people here
          read first, but it is an addition to this line, not a replacement,
          and two equal-weight dates side by side read as a mistake. */}
      <span className="text-xs text-fg-subtle">{ethiopian}</span>
      <span aria-hidden>·</span>
      <span>{time}</span>
    </div>
  );
}
