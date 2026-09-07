import { t } from '../../i18n/strings';

/**
 * The app's activity indicator.
 *
 * Two arcs, not one: a faint full ring holds the shape while a bright quarter
 * sweeps it. A lone spinning arc reads as a fragment of something missing,
 * whereas a track gives the motion an object to travel around — which is the
 * difference between a spinner that looks drawn and one that looks left over.
 * The round cap is the other half of that; a blunt-ended arc looks clipped.
 *
 * Drawn in `currentColor` and sized by class, so it inherits the colour of
 * whatever it sits in: white inside a primary button, red beside a delete
 * link, muted in a card. Nothing has to pass it a palette.
 *
 * Under `prefers-reduced-motion` it pulses instead of rotating. Spinning is
 * exactly the kind of continuous motion that setting exists to suppress, but
 * removing the animation entirely would leave a static ring claiming to be
 * busy — so the signal survives in a gentler form.
 */
export function Spinner({ className = 'h-4 w-4', label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`motion-safe:animate-spin motion-reduce:animate-pulse ${className}`}
      role="status"
      aria-label={label ?? t('common.loading')}
      focusable="false"
    >
      {/* Geometry picked by looking at it at every size it is used at, not by
          eye on a big preview. A quarter-turn arc at a 2.5 stroke was fine at
          40px and nearly invisible at 14px — which is where almost every one
          of these actually sits, inside a button. A 140° arc at stroke 3 reads
          at 12px and still looks light at 40px.

          r 9 plus half the 3 stroke puts the outer edge at 10.5, inside the 12
          half-box, so nothing clips as it rotates. The arc ends at
          (17.79, 18.89): 140° clockwise from the top of a radius-9 circle. */}
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path
        d="M12 3A9 9 0 0 1 17.79 18.89"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A spinner that takes the place of a button's label while it works.
 *
 * Swapping the text out rather than adding a spinner beside it keeps the
 * button from changing width mid-click — a button that grows under the cursor
 * is how a second, unintended click happens. The label is still announced,
 * through the spinner's own `aria-label`.
 */
export function ButtonSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center justify-center">
      <Spinner className="h-4 w-4" label={label} />
    </span>
  );
}
