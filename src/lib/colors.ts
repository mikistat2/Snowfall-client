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

/**
 * Badge fills. The dark variants keep the same hue but flip to a dim tinted
 * background with a light foreground, so a status reads identically in both
 * themes without a second lookup table to drift out of sync.
 */
export const statusBadge: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
  expiring: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300',
  grace: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  expired: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  frozen: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};
