import { api } from '../lib/api';
import type { CheckIn, GymEvent, RecognizeResult } from '../lib/types';

/**
 * The phone consumes check-in events and can override a denial; it never runs
 * recognition itself. `/check-ins/recognize` is deliberately absent from this
 * module — that call belongs to the kiosk monitor only.
 */

export async function listRecentEvents(): Promise<GymEvent[]> {
  const { data } = await api.get<GymEvent[]>('/events');
  return data;
}

export async function getOccupancy(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/occupancy');
  return data.count;
}

/** Staff decision to let a denied member in anyway. */
export async function overrideEntry(memberId: number): Promise<unknown> {
  const { data } = await api.post('/check-ins/override', { member_id: memberId });
  return data;
}

/** Manual-entry-mode approval of a pending entry. */
export async function approveEntry(memberId: number): Promise<RecognizeResult> {
  const { data } = await api.post<RecognizeResult>('/check-ins/approve', { member_id: memberId });
  return data;
}

export async function listOpenCheckIns(): Promise<CheckIn[]> {
  const { data } = await api.get<CheckIn[]>('/check-ins/open');
  return data;
}

export async function checkOut(id: number): Promise<void> {
  await api.post(`/check-ins/${id}/checkout`);
}
