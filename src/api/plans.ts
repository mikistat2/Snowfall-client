import { api } from '../lib/api';
import type { Plan } from '../lib/types';

export interface PlanInput {
  name: string;
  duration_days: number;
  price: number;
  sessions_per_day: 1 | null;
  includes: Record<string, boolean>;
  allowed_hours: string | null;
  active?: boolean;
}

/**
 * Always fetches *all* plans. Callers that only want sellable plans filter
 * with a selector (see useActivePlans) — filtering inside the fetch would put
 * two different result shapes under one cache key.
 */
export async function listPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>('/plans');
  return data;
}

export async function savePlan(plan: PlanInput & { id?: number }): Promise<void> {
  const { id, ...payload } = plan;
  if (id) await api.put(`/plans/${id}`, payload);
  else await api.post('/plans', payload);
}

export async function deletePlan(id: number): Promise<void> {
  await api.delete(`/plans/${id}`);
}
