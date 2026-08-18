import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import * as membersApi from '../../api/members';
import { qk } from './keys';
import type { MemberFilter, RenewInput, UpdateMemberInput } from '../../api/members';

/**
 * Anything that changes a membership moves the dashboard tiles and the list
 * rows too, so mutations invalidate all three rather than just the record
 * they touched.
 */
function invalidateMember(qc: QueryClient, memberId?: number): void {
  if (memberId != null) void qc.invalidateQueries({ queryKey: qk.member(memberId) });
  void qc.invalidateQueries({ queryKey: qk.membersAll });
  void qc.invalidateQueries({ queryKey: qk.dashboard });
  void qc.invalidateQueries({ queryKey: qk.today });
}

export function useMembers(filter: MemberFilter = {}) {
  return useQuery({
    queryKey: qk.members(filter),
    queryFn: () => membersApi.listMembers(filter),
  });
}

export function useMember(id: number) {
  return useQuery({
    queryKey: qk.member(id),
    queryFn: () => membersApi.getMember(id),
    enabled: Number.isFinite(id),
  });
}

export function useEnrollMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: membersApi.enrollMember,
    onSuccess: () => invalidateMember(qc),
  });
}

/** Back-fill from the paper register — may also write a backdated payment. */
export function useEnrollPreviousMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: membersApi.enrollPreviousMember,
    onSuccess: () => {
      invalidateMember(qc);
      void qc.invalidateQueries({ queryKey: qk.paymentsAll });
    },
  });
}

/**
 * Admin correction. Editing the dates changes the member's status and their
 * days-left count, so this invalidates the same three caches a renewal does.
 */
export function useUpdateMember(memberId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMemberInput) => membersApi.updateMember(memberId, input),
    onSuccess: () => invalidateMember(qc, memberId),
  });
}

export function useRenewMember(memberId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RenewInput) => membersApi.renewMember(memberId, input),
    onSuccess: () => {
      invalidateMember(qc, memberId);
      void qc.invalidateQueries({ queryKey: qk.paymentsAll });
    },
  });
}

export function useSetMemberFrozen(memberId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (frozen: boolean) => membersApi.setMemberFrozen(memberId, frozen),
    onSuccess: () => invalidateMember(qc, memberId),
  });
}

export function useSetMemberArchived(memberId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (archived: boolean) => membersApi.setMemberArchived(memberId, archived),
    onSuccess: () => invalidateMember(qc, memberId),
  });
}

/** Permanent — the member page must navigate away afterwards. */
export function useDeleteMember(memberId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => membersApi.deleteMember(memberId),
    onSuccess: () => {
      qc.removeQueries({ queryKey: qk.member(memberId) });
      invalidateMember(qc);
    },
  });
}

export function useMemberTelegramLink(memberId: number) {
  return useMutation({ mutationFn: () => membersApi.createTelegramLink(memberId) });
}
