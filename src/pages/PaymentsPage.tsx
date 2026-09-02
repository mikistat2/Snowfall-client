import { useMemo, useState } from 'react';
import { t } from '../i18n/strings';
import { PageTitle } from '../components/ui/PageTitle';
import { useInfinitePayments, usePaymentSummary } from '../hooks/queries/usePayments';
import { LoadMore } from '../components/ui/LoadMore';
import type { Payment } from '../lib/types';
import { Select } from '../components/ui/Select';
import { paymentMethodOptions, paymentMethodLabel } from '../lib/payments';
import { useMobileShell } from '../hooks/useIsMobile';

export function PaymentsPage() {
  const isMobile = useMobileShell();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [method, setMethod] = useState('');

  const filter = { from, to, method };
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfinitePayments(filter);
  const payments = useMemo(() => data?.pages.flat() ?? [], [data]);

  // Counted and summed by the database over every matching payment, not by
  // adding up the rows on screen — the list is paged, so summing it would
  // report the most recent page's takings as the period's revenue.
  const { data: summary } = usePaymentSummary(filter);

  return (
    <div className="space-y-4">
      <PageTitle>{t('payments.title')}</PageTitle>

      <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
        <div>
          <label className="label">{t('payments.from')}</label>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('payments.to')}</label>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">{t('payments.method')}</label>
          <Select
            value={method}
            onChange={setMethod}
            label={t('payments.method')}
            options={[{ value: '', label: t('payments.allMethods') }, ...paymentMethodOptions()]}
          />
        </div>
      </div>

      {/* The running total is the answer people open this screen for, so it is
          a result line above the list rather than a note beside the filters. */}
      <div className="flex items-baseline justify-between gap-3 rounded-2xl bg-surface-2 px-4 py-3">
        <span className="text-sm text-fg-muted">
          {summary?.count ?? payments.length} {t('home.paymentsSummary')}
        </span>
        <span className="text-lg font-bold tabular-nums text-fg">
          {(summary?.total ?? 0).toLocaleString()} {t('common.birr')}
        </span>
      </div>

      {isMobile ? (
        <PaymentCards payments={payments} isLoading={isLoading} />
      ) : (
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-fg-muted">
              <th className="px-4 py-3">{t('payments.date')}</th>
              <th className="px-4 py-3">{t('payments.member')}</th>
              <th className="px-4 py-3">{t('payments.amount')}</th>
              <th className="px-4 py-3">{t('payments.method')}</th>
              <th className="px-4 py-3">{t('payments.markedBy')}</th>
              <th className="px-4 py-3">{t('enroll.note')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-subtle">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-fg-muted">{new Date(p.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{p.member_name}</td>
                <td className="px-4 py-3 font-semibold">
                  {Number(p.amount)} {t('common.birr')}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{p.method}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">{p.marked_by_name}</td>
                <td className="px-4 py-3 text-fg-subtle">{p.note}</td>
              </tr>
            ))}
            {!isLoading && payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-subtle">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {!isLoading && (
        <LoadMore
          loaded={payments.length}
          hasMore={Boolean(hasNextPage)}
          isFetching={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
          noun={t('nav.payments').toLowerCase()}
        />
      )}
    </div>
  );
}

/**
 * The phone ledger. The amount leads — it is what the row is about — with the
 * member, method and time beneath it, and the note only when there is one.
 */
function PaymentCards({ payments, isLoading }: { payments: Payment[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="list-stack">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="list-card space-y-2">
            <span className="flex items-center justify-between gap-3">
              <span className="h-3.5 w-1/2 animate-pulse rounded bg-surface-2" />
              <span className="h-3.5 w-20 animate-pulse rounded bg-surface-2" />
            </span>
            <span className="block h-3 w-1/3 animate-pulse rounded bg-surface-2" />
          </div>
        ))}
      </div>
    );
  }
  if (payments.length === 0) {
    return <p className="card py-10 text-center text-sm text-fg-muted">{t('home.emptyPayments')}</p>;
  }
  return (
    <div className="list-stack">
      {payments.map((p) => (
        <div key={p.id} className="list-card">
          <div className="flex items-baseline justify-between gap-3">
            {/* The member's full name wraps here for the same reason it does on
                the roster: a receipt you cannot attribute is not a receipt. */}
            <span className="min-w-0 break-words text-[15px] font-bold leading-snug text-fg">
              {p.member_name}
            </span>
            <span className="shrink-0 text-[15px] font-bold tabular-nums text-fg">
              {Number(p.amount).toLocaleString()} {t('common.birr')}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-fg-muted">
            <span className="flex min-w-0 items-center gap-2">
              <span className="chip">{paymentMethodLabel(p.method)}</span>
              <span className="truncate">{p.marked_by_name}</span>
            </span>
            <span className="shrink-0 tabular-nums">{new Date(p.created_at).toLocaleDateString()}</span>
          </div>
          {p.note && <p className="mt-1 break-words text-xs text-fg-subtle">{p.note}</p>}
        </div>
      ))}
    </div>
  );
}
