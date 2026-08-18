import { api } from '../lib/api';
import type { CheckIn, Member, MemberStatus, Payment, PaymentMethod, Subscription } from '../lib/types';

export interface MemberFilter {
  search?: string;
  status?: MemberStatus | '';
  /** true = show the archived members instead of the active roster. */
  archived?: boolean;
  /** Page size — omit for "everything" (the desktop table). */
  limit?: number;
  offset?: number;
}

export interface MemberDetail {
  member: Member;
  subscriptions: Subscription[];
  payments: Payment[];
  check_ins: CheckIn[];
  descriptor_count: number;
}

export interface EnrollInput {
  member: {
    full_name: string;
    phone?: string;
    sex?: 'male' | 'female';
    photo_url?: string | null;
  };
  /** Empty from the phone — the enrollment kiosk computes descriptors later. */
  descriptors: number[][];
  plan_id: number;
  payment: { amount?: number; method: PaymentMethod; note?: string };
}

/**
 * A member who was already training before the system arrived, typed in from
 * the gym's paper register. The dates are "YYYY-MM-DD" strings written in
 * `calendar` — the server converts them, so Ethiopian dates are sent as-is.
 */
export interface PreviousMemberInput {
  member: {
    full_name: string;
    phone?: string;
    sex?: 'male' | 'female';
    photo_url?: string | null;
  };
  descriptors: number[][];
  plan_id: number;
  /** Which calendar the three dates below are written in — the server converts. */
  calendar: 'gregorian' | 'ethiopian';
  /**
   * Which calendar the clerk was reading from, for the audit log only. The web
   * form converts as you type and therefore always sends `calendar: 'gregorian'`;
   * this is the one that remembers the paper said "Nehase".
   */
  entered_calendar?: 'gregorian' | 'ethiopian';
  joined_at: string;
  starts_at: string;
  /** Omit to let the plan's duration decide. */
  expires_at?: string;
  /** Omit when the historical payment is not being recorded. */
  payment?: { amount?: number; method: PaymentMethod; note?: string };
}

/**
 * Admin correction of an existing member — a patch, so anything left out keeps
 * the value it already has.
 *
 * `phone` and `sex` are nullable rather than merely optional: `null` clears a
 * value that was typed wrong, which `undefined` (= don't touch) cannot express.
 * All dates are Gregorian "YYYY-MM-DD"; the form converts from the Ethiopian
 * calendar before it gets here, exactly like the previous-member page.
 */
export interface UpdateMemberInput {
  full_name?: string;
  phone?: string | null;
  sex?: 'male' | 'female' | null;
  photo_url?: string | null;
  joined_at?: string;
  /** Rewrites the member's current period in place — never takes a payment. */
  subscription?: {
    plan_id?: number;
    starts_at?: string;
    expires_at?: string;
  };
}

export interface RenewInput {
  plan_id: number;
  amount?: number;
  method: PaymentMethod;
  note?: string;
}

export async function listMembers(filter: MemberFilter = {}): Promise<Member[]> {
  const { data } = await api.get<Member[]>('/members', {
    params: {
      search: filter.search || undefined,
      status: filter.status || undefined,
      archived: filter.archived ? 'true' : undefined,
      limit: filter.limit,
      offset: filter.offset,
    },
  });
  return data;
}

export async function getMember(id: number): Promise<MemberDetail> {
  const { data } = await api.get<MemberDetail>(`/members/${id}`);
  return data;
}

export async function enrollMember(input: EnrollInput): Promise<Member> {
  const { data } = await api.post<Member>('/members', input);
  return data;
}

export async function enrollPreviousMember(input: PreviousMemberInput): Promise<Member> {
  const { data } = await api.post<Member>('/members/previous', input);
  return data;
}

export async function updateMember(id: number, input: UpdateMemberInput): Promise<Member> {
  const { data } = await api.put<Member>(`/members/${id}`, input);
  return data;
}

export async function renewMember(id: number, input: RenewInput): Promise<unknown> {
  const { data } = await api.post(`/members/${id}/renew`, input);
  return data;
}

/** Off the roster, payment history kept. Reversible with `restoreMember`. */
export async function setMemberArchived(id: number, archived: boolean): Promise<void> {
  await api.post(`/members/${id}/${archived ? 'archive' : 'restore'}`);
}

/** Permanent. The server refuses (400) if the member has any payments. */
export async function deleteMember(id: number): Promise<void> {
  await api.delete(`/members/${id}`);
}

export async function setMemberFrozen(id: number, frozen: boolean): Promise<void> {
  await api.post(`/members/${id}/${frozen ? 'freeze' : 'unfreeze'}`);
}

/** Kiosk-side completion of a phone enrollment. */
export async function addDescriptors(id: number, descriptors: number[][], replace = false): Promise<void> {
  await api.post(`/members/${id}/descriptors`, { descriptors, replace });
}

export async function createTelegramLink(id: number): Promise<{ url: string }> {
  const { data } = await api.post<{ url: string }>(`/members/${id}/telegram-link`);
  return data;
}
