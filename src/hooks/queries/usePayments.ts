import { useQuery } from '@tanstack/react-query';
import * as paymentsApi from '../../api/payments';
import { qk } from './keys';
import type { PaymentFilter } from '../../api/payments';

export function usePayments(filter: PaymentFilter = {}) {
  return useQuery({
    queryKey: qk.payments(filter),
    queryFn: () => paymentsApi.listPayments(filter),
  });
}
