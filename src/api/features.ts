import { api } from '../lib/api';

/**
 * Platform feature entitlements as the gym sees them: what it is allowed to
 * use, plus anything the platform has decided that nobody here has read yet.
 *
 * Mirrors server/src/types.ts FeatureNoticeRow — keep the two in step.
 */

export type FeatureKey = 'camera' | 'telegram';

export interface FeatureNotice {
  id: number;
  feature: FeatureKey;
  /** The state the feature moved TO. */
  allowed: boolean;
  note: string | null;
  changed_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface FeatureState {
  camera_allowed: boolean;
  telegram_allowed: boolean;
  /** Unseen, oldest first — the alert walks them in the order they happened. */
  pending: FeatureNotice[];
  /** Everything that ever happened, newest first. */
  recent: FeatureNotice[];
}

export async function getFeatureState(): Promise<FeatureState> {
  return (await api.get<FeatureState>('/features')).data;
}

export async function acknowledgeNotice(id: number): Promise<void> {
  await api.post(`/features/notices/${id}/ack`);
}

export async function acknowledgeAllNotices(): Promise<void> {
  await api.post('/features/notices/ack-all');
}
