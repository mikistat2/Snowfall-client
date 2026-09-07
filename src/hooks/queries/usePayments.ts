import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as paymentsApi from '../../api/payments';
import { qk } from './keys';
import type { PaymentFilter } from '../../api/payments';

/**
 * Payments per request. Larger than the member page size because a payment row
 * is a handful of numbers rather than a person with a photo, and this list is
 * usually read as a run of a day's takings rather than searched.
 */
export const PAYMENTS_PAGE_SIZE = 50;

/**
 * The payment history, a page at a time.
 *
 * Before this the page asked for every payment matching the filter, capped only
 * by the API's 200-row ceiling — which meant a gym with more than 200 payments
 * in the selected range was being shown a truncated list with no indication
 * that anything was missing. Paging fixes the silent truncation as well as the
 * bandwidth.
 */
export function useInfinitePayments(filter: PaymentFilter = {}) {
  return useInfiniteQuery({
    queryKey: qk.payments(filter),
    queryFn: ({ pageParam }) =>
      paymentsApi.listPayments({ ...filter, limit: PAYMENTS_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAYMENTS_PAGE_SIZE ? undefined : allPages.length * PAYMENTS_PAGE_SIZE,
  });
}

/**
 * Count and total for the same filter, from the server.
 *
 * Its own query rather than part of the list: it depends only on the filter, so
 * it is fetched once when the filter changes and not again as pages are loaded.
 */
export function usePaymentSummary(filter: PaymentFilter = {}) {
  return useQuery({
    queryKey: [...qk.payments(filter), 'summary'] as const,
    queryFn: () => paymentsApi.paymentSummary(filter),
  });
}

/**
 * Correcting a payment (owner only).
 *
 * A correction moves more than the ledger it was launched from: the day's
 * takings tile on the dashboard, the Today digest, the member's own history
 * and their lifetime total all read the same rows. Invalidating only
 * `payments` would leave a corrected figure sitting on the home screen until
 * something else happened to refetch it — which is exactly the kind of
 * disagreement between two numbers that sends an owner looking for a bug.
 */
export function useAmendPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: paymentsApi.AmendPaymentInput }) =>
      paymentsApi.amendPayment(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.paymentsAll });
      void qc.invalidateQueries({ queryKey: qk.dashboard });
      void qc.invalidateQueries({ queryKey: qk.today });
      void qc.invalidateQueries({ queryKey: qk.membersAll });
      // qk.member(id) is ['member', id]; the prefix catches every open member.
      void qc.invalidateQueries({ queryKey: ['member'] });
    },
  });
}
