import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../../api/dashboard';
import { qk } from './keys';

export function useDashboardStats() {
  return useQuery({
    queryKey: qk.dashboard,
    queryFn: dashboardApi.getStats,
    refetchInterval: 60_000,
  });
}

export function useTodayDigest() {
  return useQuery({
    queryKey: qk.today,
    queryFn: dashboardApi.getTodayDigest,
    refetchInterval: 60_000,
  });
}
