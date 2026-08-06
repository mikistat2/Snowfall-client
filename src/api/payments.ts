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
