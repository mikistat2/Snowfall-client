import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
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

/**
 * How many members arrive per request.
 *
 * 30 fills a desktop table and comfortably overfills a phone screen, so the
 * first page is everything most visits ever look at. The roster was previously
 * unbounded: a 400-member gym sent all 400 rows on every visit, every filter
 * change and (before the search box was debounced) every keystroke.
 */
export const MEMBERS_PAGE_SIZE = 30;

/**
 * The roster, a page at a time.
 *
 * The API returns a plain array with no total count — deliberately, per
 * `utils/pagination.ts`: counting rows costs a second query over the same
 * table, and nothing on this screen displays a total or a page number. A short
 * page is therefore how the end is detected, which is exact except for the one
 * harmless case where the roster divides evenly and the last request comes back
 * empty.
 *
 * `filter` must already be debounced by the caller — it is the query key, so an
 * unsettled search term would start a fresh paginated query per keystroke.
 */
export function useInfiniteMembers(filter: MemberFilter = {}) {
  return useInfiniteQuery({
    queryKey: qk.members(filter),
    queryFn: ({ pageParam }) =>
      membersApi.listMembers({ ...filter, limit: MEMBERS_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < MEMBERS_PAGE_SIZE ? undefined : allPages.length * MEMBERS_PAGE_SIZE,
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

/**
 * Saves a member's profile picture.
 *
 * Invalidates the same three caches as any other member change: the roster
 * avatar and the detail page both have to pick up the new version number, and
 * the URL is what carries it — the image itself is cached for a year, so
 * without a refetch of the row the browser would keep showing the old face.
 */
export function useSetMemberPhoto(memberId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (images: { thumb: string; full: string }) =>
      membersApi.setMemberPhoto(memberId, images),
    onSuccess: () => invalidateMember(qc, memberId),
  });
}

export function useClearMemberPhoto(memberId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => membersApi.clearMemberPhoto(memberId),
    onSuccess: () => invalidateMember(qc, memberId),
  });
}
