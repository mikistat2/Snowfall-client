import { api } from '../lib/api';
import type { CheckIn, Member, MemberStatus, Payment, PaymentMethod, Subscription } from '../lib/types';

export interface MemberFilter {
  search?: string;
  status?: MemberStatus | '';
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

export async function renewMember(id: number, input: RenewInput): Promise<unknown> {
  const { data } = await api.post(`/members/${id}/renew`, input);
  return data;
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
