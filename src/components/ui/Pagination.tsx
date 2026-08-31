import { useRef } from 'react';
import { t } from '../../i18n/strings';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

/** The `meta` block every paginated endpoint returns. */
export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Props {
  meta: PageMeta | undefined;
  onChange: (page: number) => void;
  /** Dims the control while a page is in flight, without collapsing it. */
  busy?: boolean;
}

/**
 * Pager for the log tables (notifications, audit).
 *
 * The row count shows whenever there is anything to count, even on a single
 * page: "3 entries" answers the question the reader actually has, which the
 * arrows alone cannot. The arrows appear only when there is somewhere to go.
 *
 * `page / totalPages` is deliberately written as a fraction rather than
 * "page 1 of 5" — with no interpolation in `t()`, a sentence would have to be
 * glued from fragments and would land in the wrong order in Amharic and Oromo.
 * A fraction reads the same in all three.
 */
export function Pagination({ meta, onChange, busy = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * Turning a page should land on its first row, not leave the reader parked
   * at the pager they just clicked with the new rows off-screen above.
   *
   * Which element to move is not fixed: the desktop layout scrolls the window,
   * while the mobile shell scrolls a `<main class="mobile-scroll">` inside a
   * window that never moves. Rather than branch on the breakpoint, walk up to
   * whichever ancestor is actually scrolling and move that one.
   */
  function go(next: number) {
    onChange(next);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';

    for (let node = ref.current?.parentElement; node; node = node.parentElement) {
      const { overflowY } = getComputedStyle(node);
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
        node.scrollTo({ top: 0, behavior });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior });
  }

  if (!meta || meta.total === 0) return null;
  const { page, total, totalPages } = meta;
  const single = totalPages <= 1;

  return (
    <div
      ref={ref}
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-1 text-sm transition-opacity ${
        busy ? 'opacity-60' : ''
      }`}
    >
      {!single && (
        <button
          type="button"
          className="btn-secondary px-2.5 py-1.5"
          disabled={page <= 1 || busy}
          aria-label={t('pager.prev')}
          onClick={() => go(page - 1)}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      )}

      <span className="text-fg-muted">
        {!single && (
          <>
            <span className="font-medium text-fg tabular-nums">
              {page} / {totalPages}
            </span>
            <span aria-hidden className="px-2">
              ·
            </span>
          </>
        )}
        <span className="tabular-nums">{total}</span> {t('pager.entries')}
      </span>

      {!single && (
        <button
          type="button"
          className="btn-secondary px-2.5 py-1.5"
          disabled={page >= totalPages || busy}
          aria-label={t('pager.next')}
          onClick={() => go(page + 1)}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
