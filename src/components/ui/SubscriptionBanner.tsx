import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { daysUntil, fetchCheckout, formatDate } from '../../lib/billing';

/**
 * In-app nudge when the subscription is running out. Renders nothing until the
 * last two weeks, and nothing at all while payments are switched off or the
 * gym is comped — a "renew now" banner that cannot be true is worse than none.
 */
const WARN_WITHIN_DAYS = 14;

export function SubscriptionBanner() {
  const { data } = useQuery({
    queryKey: ['billing'],
    queryFn: fetchCheckout,
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (!data?.paymentsRequired || data.comped) return null;
  const left = daysUntil(data.expiresAt);
  if (left === null || left > WARN_WITHIN_DAYS) return null;

  const urgent = left <= 3;
  return (
    <div
      className={`mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${
        urgent
          ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
          : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
      }`}
    >
      <span className="min-w-0 flex-1">
        {left < 0 ? (
          <>
            Your {data.isTrial ? 'free trial' : 'subscription'} expired on{' '}
            <b>{formatDate(data.expiresAt)}</b>.
            {data.graceDays > 0 && ' You are in the grace period — access stops soon.'}
          </>
        ) : left === 0 ? (
          <>
            Your {data.isTrial ? 'free trial' : 'subscription'} ends <b>today</b>.
          </>
        ) : (
          <>
            Your {data.isTrial ? 'free trial' : 'subscription'} ends in{' '}
            <b>
              {left} day{left === 1 ? '' : 's'}
            </b>{' '}
            — on {formatDate(data.expiresAt)}.
          </>
        )}
      </span>
      <Link to="/billing" className="btn-primary shrink-0 !py-1.5">
        Renew now
      </Link>
    </div>
  );
}
