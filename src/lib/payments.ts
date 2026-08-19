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
