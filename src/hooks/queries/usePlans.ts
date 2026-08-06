import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as plansApi from '../../api/plans';
import { qk } from './keys';
import type { Plan } from '../../lib/types';

/** All plans, including inactive ones (the plan builder). */
export function usePlans() {
  return useQuery({ queryKey: qk.plans, queryFn: plansApi.listPlans });
}

/**
 * Only sellable plans (enrollment and renewal dropdowns).
 *
 * The filter is a `select` rather than part of the fetch on purpose: both
 * variants previously cached under the key `['plans']` while returning
 * different rows, so whichever screen mounted first decided what the other
 * one saw. One fetch, two views, no collision.
 */
export function useActivePlans() {
  return useQuery({
    queryKey: qk.plans,
    queryFn: plansApi.listPlans,
    select: (plans: Plan[]) => plans.filter((p) => p.active),
  });
}

export function useSavePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plansApi.savePlan,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.plans }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plansApi.deletePlan,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.plans }),
  });
}
