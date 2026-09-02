import { t } from '../../i18n/strings';

/**
 * The footer of a paged list: how many rows are loaded, and a button to fetch
 * the next page.
 *
 * A button rather than infinite scroll on purpose. These lists are read on
 * metered mobile data, and auto-loading spends it on rows the reader may never
 * have scrolled to — a scroll to re-read the row above should not cost another
 * request. It also degrades honestly on a bad connection: a button that says
 * "Loading more…" is legible, where a scroll trigger that silently failed
 * looks like the end of the list.
 *
 * Renders nothing at all when everything fits in one page, which is the normal
 * case for a small gym — the pager should not appear until it has a job.
 */
export function LoadMore({
  loaded,
  hasMore,
  isFetching,
  onLoadMore,
  noun,
}: {
  /** Rows currently on screen. */
  loaded: number;
  hasMore: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  /** What is being counted, already pluralised — "members", "payments". */
  noun: string;
}) {
  if (!hasMore && loaded === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <p className="text-sm text-fg-subtle">
        {loaded} {noun}
        {/* No total is shown because the API does not return one: counting the
            table would double the cost of every page for a number nothing on
            this screen uses. */}
        {hasMore ? '+' : ''}
      </p>
      {hasMore ? (
        <button type="button" className="btn-secondary" onClick={onLoadMore} disabled={isFetching}>
          {isFetching ? t('common.loadingMore') : t('common.loadMore')}
        </button>
      ) : (
        loaded > 0 && <span className="text-sm text-fg-subtle">{t('common.allLoaded')}</span>
      )}
    </div>
  );
}
