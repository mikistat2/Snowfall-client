import * as storage from './storage';

/**
 * How much of the payment ledger the Payments page opens on.
 *
 * The page used to load and total *every* payment the gym had ever taken,
 * which answers a question nobody asks at a desk. "What came in recently" is
 * the daily question; the lifetime figure is an occasional one, so it moves
 * behind a tap.
 *
 * Stored per device, alongside theme and language, rather than in the gym's
 * settings — for two reasons. It is a viewing preference, not gym policy: the
 * owner wanting the full history and the front desk wanting this month is not
 * a disagreement to be settled centrally. And `PUT /settings` is owner-only by
 * design, so a gym-wide version could not be changed by staff without opening
 * that endpoint to them, which would trade a display default for a permissions
 * hole.
 */

export type PaymentsRange = '30d' | 'all';

export const PAYMENTS_RANGE_DAYS = 30;

export function getDefaultRange(): PaymentsRange {
  return storage.get('paymentsRange') === 'all' ? 'all' : '30d';
}

export function setDefaultRange(range: PaymentsRange): void {
  storage.set('paymentsRange', range);
}

/**
 * `YYYY-MM-DD` for N days ago, built from local date parts.
 *
 * Deliberately not `toISOString().slice(0, 10)`: that is UTC, and Addis is
 * three hours ahead, so for the first three hours of every day it would name
 * yesterday and quietly shift the window by a day.
 */
export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
