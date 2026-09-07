import type { PaymentMethod } from './types';

/**
 * How money is taken. The values are the API's lowercase identifiers; every
 * screen shows them capitalised, which is why this lives in one place rather
 * than being re-listed (and re-formatted differently) per page.
 */
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['cash', 'telebirr', 'bank', 'other'];

export function paymentMethodLabel(method: string): string {
  return method.charAt(0).toUpperCase() + method.slice(1);
}

/** Ready-made options for the shared `<Select>`. */
export function paymentMethodOptions(): { value: PaymentMethod; label: string }[] {
  return PAYMENT_METHODS.map((method) => ({ value: method, label: paymentMethodLabel(method) }));
}

/**
 * How far ABOVE the plan's price a payment may go before the app asks whether
 * it was meant.
 *
 * A gym meant to take 2300 and typed 23002300 — a repeated fat-fingered block
 * of digits — and the number then sat in their revenue because payments were
 * immutable. Owners can correct a payment now, but a correction is a record of
 * a mistake; catching it at the keyboard is better than filing it.
 *
 * Only the overshoot is checked. Taking LESS than the list price is a
 * discount, which is ordinary, deliberate and none of the app's business.
 */
export const OVERPAY_CONFIRM_ETB = 700;

/**
 * True when `amount` is more than OVERPAY_CONFIRM_ETB above the plan's price.
 *
 * Returns false when there is no plan or the amount is not a number yet, so a
 * half-typed form never raises the alarm — this is a guard on a finished
 * figure, not live validation of every keystroke.
 */
export function overpayNeedsConfirming(amount: number, planPrice?: number): boolean {
  if (planPrice === undefined || !Number.isFinite(amount) || !Number.isFinite(planPrice)) return false;
  return amount - planPrice > OVERPAY_CONFIRM_ETB;
}
