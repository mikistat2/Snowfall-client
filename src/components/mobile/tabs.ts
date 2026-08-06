import type { ComponentType } from 'react';
import { DashboardIcon, LiveIcon, MembersIcon, MoreIcon, PaymentsIcon } from './icons';
import type { StringKey } from '../../i18n/strings';

export interface TabDef {
  to: string;
  labelKey: StringKey;
  Icon: ComponentType<{ className?: string }>;
}

/**
 * The five bottom tabs. Order is fixed — muscle memory matters more than
 * cleverness here, and the hardware back button falls back to the first tab.
 *
 * Note there is no Monitor tab: the face-recognition monitor stays on the
 * entrance kiosk (see MOBILE.md). "Live" is the read-only event stream.
 */
export const TABS: readonly TabDef[] = [
  { to: '/', labelKey: 'nav.dashboard', Icon: DashboardIcon },
  { to: '/live', labelKey: 'nav.live', Icon: LiveIcon },
  { to: '/members', labelKey: 'nav.members', Icon: MembersIcon },
  { to: '/payments', labelKey: 'nav.payments', Icon: PaymentsIcon },
  { to: '/more', labelKey: 'nav.more', Icon: MoreIcon },
] as const;

export const TAB_ROOTS: readonly string[] = TABS.map((tab) => tab.to);

export function isTabRoot(pathname: string): boolean {
  return TAB_ROOTS.includes(pathname);
}

/** The tab a given path belongs to, so the right icon stays highlighted in a stack. */
export function activeTabFor(pathname: string): string {
  if (pathname === '/') return '/';
  const match = TAB_ROOTS.filter((root) => root !== '/').find(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
  return match ?? '/';
}
