import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as checkInsApi from '../../api/checkIns';
import { qk } from './keys';

export function useRecentEvents() {
  return useQuery({ queryKey: qk.events, queryFn: checkInsApi.listRecentEvents });
}

export function useOccupancy() {
  return useQuery({ queryKey: qk.occupancy, queryFn: checkInsApi.getOccupancy });
}

export function useOpenCheckIns() {
  return useQuery({ queryKey: qk.openCheckIns, queryFn: checkInsApi.listOpenCheckIns });
}

/** Both entry decisions invalidate the same things, so they share a factory. */
function useEntryDecision(fn: (memberId: number) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.openCheckIns });
      void qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}

export function useOverrideEntry() {
  return useEntryDecision(checkInsApi.overrideEntry);
}

export function useApproveEntry() {
  return useEntryDecision(checkInsApi.approveEntry);
}

export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkInsApi.checkOut,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.openCheckIns }),
  });
}
