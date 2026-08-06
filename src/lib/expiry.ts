import type { MemberStatus } from './types';

/** Calendar days from today until the expiry date — matches the server's decisionEngine (negative = overdue). */
export function daysLeft(expiresAt: string | Date): number {
  const [y, m, d] = String(expiresAt).slice(0, 10).split('-').map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.UTC(y, m - 1, d) - today) / 86_400_000);
}

/** Lifted a shade in dark mode — the 600s do not carry enough contrast on a dark surface. */
export const daysLeftColor: Record<MemberStatus, string> = {
  active: 'text-green-600 dark:text-green-400',
  expiring: 'text-yellow-600 dark:text-yellow-400',
  grace: 'text-orange-600 dark:text-orange-400',
  expired: 'text-red-600 dark:text-red-400',
  frozen: 'text-fg-muted',
};
