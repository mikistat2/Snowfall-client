import { api } from '../lib/api';
import type { Payment } from '../lib/types';

export interface PaymentFilter {
  from?: string;
  to?: string;
  method?: string;
  limit?: number;
  offset?: number;
}

export async function listPayments(filter: PaymentFilter = {}): Promise<Payment[]> {
  const { data } = await api.get<Payment[]>('/payments', {
    params: {
      from: filter.from || undefined,
      to: filter.to || undefined,
      method: filter.method || undefined,
      limit: filter.limit,
      offset: filter.offset,
    },
  });
  return data;
}

/** Count and total for a filter, across every matching payment — not just the loaded page. */
export interface PaymentSummary {
  count: number;
  total: number;
}

/**
 * The headline figure on the payments page.
 *
 * Deliberately not derived from the loaded rows: the list is paged, so summing
 * what is on screen would report the total of the most recent page and call it
 * the period's revenue.
 */
export async function paymentSummary(filter: PaymentFilter = {}): Promise<PaymentSummary> {
  const { data } = await api.get<PaymentSummary>('/payments/summary', {
    params: {
      from: filter.from || undefined,
      to: filter.to || undefined,
      method: filter.method || undefined,
    },
  });
  return data;
}
