import { Select } from '../ui/Select';

/**
 * Numbered pagination for the platform panel's tables.
 *
 * Styled against the panel's own light-only slate palette rather than the
 * app's theme tokens, because that is the surface it lives on — see
 * BillingAdmin, which carries no `dark:` variants at all.
 *
 * Numbers rather than a plain next/prev pair: an admin chasing one payment
 * knows roughly where it is in the list, and stepping there one page at a time
 * is the difference between finding it and giving up.
 */

/**
 * The pages to render, with runs collapsed to a single gap.
 *
 * Always keeps the first, the last, and a window around the current page, then
 * widens that window near either end so the control does not visibly change
 * width as you walk through the first or last few pages — a row of buttons
 * that reflows under the cursor is how you end up on page 7 by accident.
 */
export function pageList(current: number, total: number): (number | 'gap')[] {
  const keep = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => keep.add(n));

  const pages = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  for (const [i, n] of pages.entries()) {
    const previous = pages[i - 1];
    if (previous !== undefined && n - previous > 1) out.push('gap');
    out.push(n);
  }
  return out;
}

const STEP =
  'flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 ' +
  'transition-colors hover:bg-slate-100 hover:text-slate-900 ' +
  'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600';

export function Pager({
  page,
  pageSize,
  total,
  totalPages,
  onPage,
  onPageSize,
  pageSizes = [25, 50, 100],
  noun = 'rows',
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  pageSizes?: number[];
  /** Plural noun for the count line — "attempts", "payments", … */
  noun?: string;
}) {
  // Rendered even for a single page: the count line is the useful half, and a
  // control that appears only once a table grows is one an admin never learns
  // is there. Only the numbers hide.
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">
          {total === 0 ? (
            `No ${noun}`
          ) : (
            <>
              Showing{' '}
              <b className="font-semibold text-slate-700">
                {from}–{to}
              </b>{' '}
              of <b className="font-semibold text-slate-700">{total}</b> {noun}
            </>
          )}
        </span>
        <Select
          value={pageSize}
          aria-label={`${noun} per page`}
          onChange={(next) => onPageSize(Number(next))}
          options={pageSizes.map((n) => ({ value: n, label: `${n} / page` }))}
          triggerClassName="h-8 !py-0 text-xs"
          className="w-28"
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" className={STEP} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
            ‹
          </button>

          {/* Below `sm` the strip is replaced by a plain position readout —
              nine tap targets do not fit beside the arrows on a narrow panel. */}
          <span className="px-2 text-xs text-slate-500 sm:hidden">
            {page} / {totalPages}
          </span>

          <div className="hidden items-center gap-1 sm:flex">
            {pageList(page, totalPages).map((entry, i) =>
              entry === 'gap' ? (
                <span key={`gap-${i}`} className="px-1 text-slate-400" aria-hidden>
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  onClick={() => onPage(entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  className={
                    entry === page
                      ? 'flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-900 px-2 text-sm font-semibold text-white shadow-sm'
                      : 'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900'
                  }
                >
                  {entry}
                </button>
              ),
            )}
          </div>

          <button type="button" className={STEP} disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page">
            ›
          </button>
        </div>
      )}
    </div>
  );
}
