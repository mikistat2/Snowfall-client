import type { GymSettings, MemberStatus } from './types';

/** Calendar days from today until the expiry date — matches the server's decisionEngine (negative = overdue). */
export function daysLeft(expiresAt: string | Date): number {
  const [y, m, d] = String(expiresAt).slice(0, 10).split('-').map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.UTC(y, m - 1, d) - today) / 86_400_000);
}

/**
 * Status from an expiry date, mirroring the server's decisionEngine.deriveStatus.
 * Used to preview what a back-filled paper membership will become before it is
 * saved — the server still computes the stored value.
 */
export function deriveStatus(daysRemaining: number | null, settings: GymSettings): MemberStatus {
  if (daysRemaining === null || daysRemaining < -settings.grace_period_days) return 'expired';
  if (daysRemaining <= 0) return 'grace';
  if (daysRemaining <= settings.expiry_reminder_days) return 'expiring';
  return 'active';
}

/** Lifted a shade in dark mode — the 600s do not carry enough contrast on a dark surface. */
export const daysLeftColor: Record<MemberStatus, string> = {
  active: 'text-green-600 dark:text-green-400',
  expiring: 'text-yellow-600 dark:text-yellow-400',
  grace: 'text-orange-600 dark:text-orange-400',
  expired: 'text-red-600 dark:text-red-400',
  frozen: 'text-fg-muted',
};

/**
 * The same urgency ramp as `daysLeftColor`, as a ring around an avatar.
 *
 * Kept beside it so the two cannot drift: where a member's photo replaces a
 * status icon, the ring is what carries the colour the icon used to.
 */
export const ringColor: Record<MemberStatus, string> = {
  active: 'ring-green-500/60',
  expiring: 'ring-yellow-500/70',
  grace: 'ring-orange-500/70',
  expired: 'ring-red-500/70',
  frozen: 'ring-line',
};
