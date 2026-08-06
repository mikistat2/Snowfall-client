import { api } from '../lib/api';
import type { Gym, GymSettings } from '../lib/types';

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'owner' | 'staff';
  created_at: string;
}

export interface StaffInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface GymUpdate {
  name?: string;
  address?: string | null;
  phone?: string | null;
  telegram_bot_token?: string | null;
  settings?: Partial<GymSettings>;
}

export async function getGym(): Promise<Gym> {
  const { data } = await api.get<Gym>('/settings');
  return data;
}

export async function updateGym(update: GymUpdate): Promise<void> {
  await api.put('/settings', update);
}

export async function listStaff(): Promise<Staff[]> {
  const { data } = await api.get<Staff[]>('/staff');
  return data;
}

export async function createStaff(input: StaffInput): Promise<void> {
  await api.post('/staff', input);
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/staff/${id}`);
}
