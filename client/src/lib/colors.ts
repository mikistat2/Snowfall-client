import type { MemberStatus, Severity } from './types';

/** One place for the green/yellow/orange/red/blue system used everywhere. */

export const severityDot: Record<Severity, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export const severityStroke: Record<Severity, string> = {
  green: '#22c55e',
  yellow: '#facc15',
  orange: '#f97316',
  red: '#ef4444',
  blue: '#3b82f6',
};

export const statusSeverity: Record<MemberStatus, Severity> = {
  active: 'green',
  expiring: 'yellow',
  grace: 'yellow',
  expired: 'red',
  frozen: 'red',
};

export const statusBadge: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-800',
  expiring: 'bg-yellow-100 text-yellow-800',
  grace: 'bg-orange-100 text-orange-800',
  expired: 'bg-red-100 text-red-800',
  frozen: 'bg-slate-200 text-slate-700',
};
