import { useMemo, useState } from 'react';
import { t } from '../i18n/strings';
import { PageTitle } from '../components/ui/PageTitle';
import { useInfinitePayments, usePaymentSummary } from '../hooks/queries/usePayments';
import { LoadMore } from '../components/ui/LoadMore';
import type { Payment } from '../lib/types';
import { Select } from '../components/ui/Select';
import { paymentMethodOptions, paymentMethodLabel } from '../lib/payments';
import { useMobileShell } from '../hooks/useIsMobile';
import { useAuth } from '../hooks/useAuth';
import { AmendPaymentModal } from '../components/payments/AmendPaymentModal';
import { getDefaultRange, isoDaysAgo, PAYMENTS_RANGE_DAYS } from '../lib/paymentsRange';
import { EditIcon } from '../components/ui/icons';

export function PaymentsPage() {
  const isMobile = useMobileShell();
  /**
   * Only the owner may correct a payment. Staff take the money; the person
   * answerable for the books is the one who rewrites the record of it. The
   * server enforces this on the route — this only decides whether to draw the
   * button.
   */
  const { user } = useAuth();
  const canAmend = user?.role === 'owner';
  const [amending, setAmending] = useState<Payment | null>(null);
  /**
   * The range chips write into these two fields rather than living beside
   * them as a third piece of state. One source of truth for the query, so a
   * chip and a hand-typed date can never describe different windows — and
   * editing a date by hand simply lands on "custom", with neither chip lit.
   */
  const [from, setFrom] = useState(() => (getDefaultRange() === 'all' ? '' : isoDaysAgo(PAYMENTS_RANGE_DAYS)));
  const [to, setTo] = useState('');
  const [method, setMethod] = useState('');

  // Pinned to mount rather than recomputed each render: otherwise a page left
  // open across midnight would move the boundary while `from` kept yesterday's
  // value, and the chip would quietly unhighlight itself.
  const last30 = useMemo(() => isoDaysAgo(PAYMENTS_RANGE_DAYS), []);
  const activeRange = !from && !to ? 'all' : from === last30 && !to ? '30d' : 'custom';

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

      {/* The two answers people actually want, one tap apart. The date boxes
          below stay for the rarer "that week in June" question. */}
      <div className="flex gap-2">
        <RangeChip
          label={t('payments.last30')}
          active={activeRange === '30d'}
          onClick={() => {
            setFrom(last30);
            setTo('');
          }}
        />
        <RangeChip
          label={t('payments.allTime')}
          active={activeRange === 'all'}
          onClick={() => {
            setFrom('');
            setTo('');
          }}
        />
      </div>

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
          {/* Which window this total covers. A bare number with no period
              attached is the thing that gets misread as lifetime revenue. */}
          <span className="block text-xs text-fg-subtle">
            {activeRange === '30d'
              ? t('payments.last30')
              : activeRange === 'all'
                ? t('payments.allTime')
                : t('payments.customRange')}
          </span>
        </span>
        <span className="text-lg font-bold tabular-nums text-fg">
          {(summary?.total ?? 0).toLocaleString()} {t('common.birr')}
        </span>
      </div>

      {isMobile ? (
        <PaymentCards
          payments={payments}
          isLoading={isLoading}
          canAmend={canAmend}
          onAmend={setAmending}
        />
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
              {canAmend && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={canAmend ? 7 : 6} className="px-4 py-8 text-center text-fg-subtle">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {payments.map((p) => {
              /* A voided row stays in the ledger, struck through. Removing it
                 would leave the gym hunting for a payment they know they took,
                 and hide the fact that somebody corrected it. */
              const voided = Boolean(p.voided_at);
              return (
              <tr key={p.id} className={`border-b border-line last:border-0 ${voided ? 'text-fg-subtle' : ''}`}>
                <td className="px-4 py-3 text-fg-muted">{new Date(p.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{p.member_name}</td>
                <td className={`px-4 py-3 font-semibold ${voided ? 'line-through' : ''}`}>
                  {Number(p.amount)} {t('common.birr')}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{p.method}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">{p.marked_by_name}</td>
                <td className="px-4 py-3 text-fg-subtle">
                  {voided ? (
                    <span>
                      <b>{t('payments.voided')}</b>
                      {p.voided_by_name ? ` · ${p.voided_by_name}` : ''}
                      {p.void_reason ? ` — ${p.void_reason}` : ''}
                    </span>
                  ) : p.corrects_id ? (
                    <span>
                      <b>{t('payments.correction')}</b>
                      {p.note ? ` · ${p.note}` : ''}
                    </span>
                  ) : (
                    p.note
                  )}
                </td>
                {canAmend && (
                  <td className="py-3 pr-4 text-right">
                    {!voided && (
                      <button
                        type="button"
                        // Icon only. A labelled button in every row competed
                        // with the amounts for attention, on a screen whose job
                        // is reading numbers — and correcting a payment is a
                        // rare act that does not deserve that weight.
                        title={t('payments.correct')}
                        aria-label={t('payments.correct')}
                        className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
                        onClick={() => setAmending(p)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
              );
            })}
            {!isLoading && payments.length === 0 && (
              <tr>
                <td colSpan={canAmend ? 7 : 6} className="px-4 py-8 text-center text-fg-subtle">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {amending && <AmendPaymentModal payment={amending} onClose={() => setAmending(null)} />}

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

/** A range shortcut. Filled when it matches the dates currently in force. */
function RangeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-slate-900 text-white dark:bg-sky-600' : 'bg-surface-2 text-fg-muted'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * The phone ledger. The amount leads — it is what the row is about — with the
 * member, method and time beneath it, and the note only when there is one.
 */
function PaymentCards({
  payments,
  isLoading,
  canAmend,
  onAmend,
}: {
  payments: Payment[];
  isLoading: boolean;
  canAmend: boolean;
  onAmend: (p: Payment) => void;
}) {
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
      {payments.map((p) => {
        const voided = Boolean(p.voided_at);
        return (
        <div key={p.id} className={`list-card ${voided ? 'opacity-60' : ''}`}>
          <div className="flex items-baseline justify-between gap-3">
            {/* The member's full name wraps here for the same reason it does on
                the roster: a receipt you cannot attribute is not a receipt. */}
            <span className="min-w-0 break-words text-[15px] font-bold leading-snug text-fg">
              {p.member_name}
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5">
              <span
                className={`text-[15px] font-bold tabular-nums text-fg ${voided ? 'line-through' : ''}`}
              >
                {Number(p.amount).toLocaleString()} {t('common.birr')}
              </span>
              {/* Beside the amount rather than a full-width button below it:
                  the old one doubled the height of every card in the ledger to
                  offer something almost nobody taps. */}
              {canAmend && !voided && (
                <button
                  type="button"
                  aria-label={t('payments.correct')}
                  className="-my-1 self-center rounded-md p-1.5 text-fg-subtle active:bg-surface-2"
                  onClick={() => onAmend(p)}
                >
                  <EditIcon className="h-4 w-4" />
                </button>
              )}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-fg-muted">
            <span className="flex min-w-0 items-center gap-2">
              <span className="chip">{paymentMethodLabel(p.method)}</span>
              <span className="truncate">{p.marked_by_name}</span>
            </span>
            <span className="shrink-0 tabular-nums">{new Date(p.created_at).toLocaleDateString()}</span>
          </div>
          {p.note && !voided && <p className="mt-1 break-words text-xs text-fg-subtle">{p.note}</p>}
          {voided && (
            <p className="mt-1 break-words text-xs text-fg-subtle">
              <b>{t('payments.voided')}</b>
              {p.voided_by_name ? ` · ${p.voided_by_name}` : ''}
              {p.void_reason ? ` — ${p.void_reason}` : ''}
            </p>
          )}
        </div>
        );
      })}
    </div>
  );
}
