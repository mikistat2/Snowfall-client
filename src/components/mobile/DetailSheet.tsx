import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { pushBackInterceptor } from '../../lib/backInterceptor';
import { t } from '../../i18n/strings';
import type { StringKey } from '../../i18n/strings';

/**
 * Bottom sheet for drilling into a home-screen stat.
 *
 * A centred dialog (components/ui/Modal) is a desktop shape — on a phone the
 * content would land under the thumb's reach and above the keyboard line. This
 * slides up from the bottom edge, caps itself at 85dvh so the hero stays
 * visible behind it, and scrolls internally.
 *
 * Dismissal follows every Android convention at once: backdrop tap, the drag
 * handle, and the hardware/gesture back button.
 */
export function DetailSheet({
  title,
  subtitle,
  viewAllTo,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Optional "see the full page" link rendered as a pinned footer. */
  viewAllTo?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  // Keep the latest onClose without re-registering the interceptor each render.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => pushBackInterceptor(() => closeRef.current()), []);

  // The sheet owns the viewport while it is open; letting the page behind it
  // scroll is the classic "scroll chaining" bug.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/50 motion-safe:animate-fade-in"
      />

      <div className="relative flex max-h-[85dvh] flex-col rounded-t-3xl bg-surface shadow-2xl motion-safe:animate-sheet-up">
        {/* drag handle — visual affordance for "this dismisses downward" */}
        <div className="flex shrink-0 justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-fg-subtle/40" />
        </div>

        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-fg">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-xs text-fg-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-fg-subtle active:bg-surface-2"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94z" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2">{children}</div>

        {viewAllTo ? (
          <div className="shrink-0 border-t border-line px-5 pb-safe-b pt-3">
            <Link
              to={viewAllTo}
              onClick={onClose}
              className="btn-secondary flex min-h-touch w-full items-center justify-center"
            >
              {t('home.viewAll')}
            </Link>
          </div>
        ) : (
          <div className="shrink-0 pb-safe-b" />
        )}
      </div>
    </div>
  );
}

/** Empty state shared by every sheet. */
export function SheetEmpty({ messageKey }: { messageKey: StringKey }) {
  return <p className="py-8 text-center text-sm text-fg-muted">{t(messageKey)}</p>;
}

/** Skeleton rows while the digest is still loading. */
export function SheetLoading() {
  return (
    <div className="space-y-2 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-2" />
      ))}
    </div>
  );
}
