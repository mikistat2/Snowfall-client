import { api } from '../lib/api';
import type { DashboardStats, TodayDigest } from '../lib/types';

export async function getStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard/stats');
  return data;
}

export async function getTodayDigest(): Promise<TodayDigest> {
  const { data } = await api.get<TodayDigest>('/dashboard/today');
  return data;
}
