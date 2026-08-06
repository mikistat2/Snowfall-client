import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as settingsApi from '../../api/settings';
import { qk } from './keys';

export function useGymSettings() {
  return useQuery({ queryKey: qk.settings, queryFn: settingsApi.getGym });
}

export function useUpdateGym() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updateGym,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.settings }),
  });
}

export function useStaff() {
  return useQuery({ queryKey: qk.staff, queryFn: settingsApi.listStaff });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.createStaff,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.staff }),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.deleteStaff,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.staff }),
  });
}
