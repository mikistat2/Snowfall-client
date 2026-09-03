import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { daysUntil, fetchCheckout, formatDate } from '../../lib/billing';

/**
 * In-app nudge as a subscription runs out, on every screen of both shells.
 *
 * Shown whether or not billing is switched on, because the platform can turn
 * payments on at any moment and `hasAccess` is evaluated live: a gym whose date
 * has already passed goes from working to locked out in the same second, with
 * no transition. While payments are off it is also the ONLY warning a gym gets
 * — the renewal reminder emails return early in that state — so a gym that
 * never sees this banner has been told nothing at all.
 *
 * What changes with the switch is the tone and the action, not the fact:
 *
 *  - payments OFF — informational. No alarm colour and no button, because the
 *    API refuses a payment outright while billing is off (PAYMENTS_OFF), and a
 *    "Renew now" that dead-ends on an error is worse than no button.
 *  - payments ON  — amber, then red inside three days, with a route to pay.
 *
 * Nothing is shown to a comped gym: it has an expiry date that will never be
 * enforced, so counting it down would be a countdown to nothing.
 */
/**
 * Was 14. Two weeks of the same banner is two weeks of learning to ignore it,
 * and the message has not changed by the time it matters.
 */
const WARN_WITHIN_DAYS = 7;

/** Red at three days or fewer, but only where the date actually bites. */
const URGENT_WITHIN_DAYS = 3;

export function SubscriptionBanner() {
  const { data } = useQuery({
    queryKey: ['billing'],
    queryFn: fetchCheckout,
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (!data || data.comped) return null;
  const left = daysUntil(data.expiresAt);
  // Only the upper bound is a window. Negative values fall through on purpose
  // and the banner stays up indefinitely once the date has passed — an
  // already-lapsed gym is exactly who needs to see this, and needs to see it
  // most while payments are off.
  if (left === null || left > WARN_WITHIN_DAYS) return null;

  const enforced = data.paymentsRequired;
  const what = data.isTrial ? 'free trial' : 'subscription';
  const tone = !enforced
    ? 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200'
    : left <= URGENT_WITHIN_DAYS
      ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
      : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200';

  return (
    <div className={`mb-4 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${tone}`}>
      <span className="min-w-0 flex-1">
        {left < 0 ? (
          <>
            Your {what} ended on <b>{formatDate(data.expiresAt)}</b>.
            {enforced && data.graceDays > 0 && ' You are in the grace period — access stops soon.'}
          </>
        ) : left === 0 ? (
          <>
            Your {what} ends <b>today</b>.
          </>
        ) : (
          <>
            Your {what} ends in{' '}
            <b>
              {left} day{left === 1 ? '' : 's'}
            </b>{' '}
            — on {formatDate(data.expiresAt)}.
          </>
        )}
        {/* The one honest instruction while billing is off: they cannot pay
            through the app, so the route back is a conversation. */}
        {!enforced && ' Contact Snowfall to renew.'}
      </span>
      {enforced && (
        <Link to="/billing" className="btn-primary shrink-0 !py-1.5">
          Renew now
        </Link>
      )}
    </div>
  );
}
