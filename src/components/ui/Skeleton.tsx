import type { CSSProperties } from 'react';

/**
 * Placeholder blocks shaped like the content that is coming.
 *
 * Used instead of a spinner wherever a list or a form is loading. An empty
 * table with a spinner over it tells you the app is busy; a skeleton tells you
 * what is about to arrive and how much of it, and the page does not jump when
 * it does. A card that renders empty while it loads is worse than either —
 * "no packages yet" and "packages still loading" look identical, and only one
 * of them is worth acting on.
 *
 * Filled with `bg-line`, not `bg-surface-2`. Looked at on a real card, the
 * surface-2 tint is slate-50 against a white surface — three values apart, and
 * the placeholders simply were not visible. `line` is the token for a grey
 * that has to read against a surface (it is what every divider and border in
 * the app uses), so it contrasts in both themes by construction rather than by
 * luck. Static under `prefers-reduced-motion`: the shape alone still reads as
 * a placeholder.
 */
export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  /** For sizes that are data-shaped rather than utility-shaped (chart bars). */
  style?: CSSProperties;
}) {
  return (
    <span
      className={`block rounded bg-line motion-safe:animate-pulse ${className}`}
      style={style}
      aria-hidden
    />
  );
}

/**
 * A run of skeleton lines standing in for rows of a list.
 *
 * `aria-busy` on the container, and the rows themselves hidden from the
 * accessibility tree — a screen reader should hear "busy", not a dozen empty
 * items. Widths alternate slightly so the block reads as text rather than as
 * a solid slab.
 */
export function SkeletonRows({ rows = 3, className = 'h-10' }: { rows?: number; className?: string }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={`${className} ${i % 2 ? 'w-11/12' : 'w-full'}`} />
      ))}
    </div>
  );
}
