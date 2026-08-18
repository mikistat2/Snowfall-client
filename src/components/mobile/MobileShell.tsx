import { useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomTabs } from './BottomTabs';
import { StackHeader } from './StackHeader';
import { isTabRoot } from './tabs';
import { exitApp, useAndroidBackButton } from '../../hooks/useAndroidBackButton';
import { consumeBackPress } from '../../lib/backInterceptor';
import { useToast } from '../ui/Toast';
import { FrozenGymAlert } from '../ui/FrozenGymAlert';
import { PaymentRequiredRedirect } from '../ui/PaymentRequiredRedirect';
import { SubscriptionBanner } from '../ui/SubscriptionBanner';
import { t } from '../../i18n/strings';
import type { StringKey } from '../../i18n/strings';

/** Longest-prefix wins, so /members/enroll beats /members. */
const TITLES: readonly (readonly [string, StringKey])[] = [
  ['/members/enroll', 'enroll.title'],
  ['/members', 'nav.members'],
  ['/payments', 'nav.payments'],
  ['/notifications', 'nav.notifications'],
  ['/settings', 'nav.settings'],
  ['/feedback', 'nav.feedback'],
  ['/guide', 'nav.guide'],
  ['/audit', 'nav.audit'],
  ['/today', 'nav.today'],
  ['/live', 'live.title'],
  ['/more', 'more.title'],
  ['/', 'nav.dashboard'],
] as const;

function titleFor(pathname: string): string {
  const match = TITLES.find(([prefix]) =>
    prefix === '/' ? pathname === '/' : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return t(match?.[1] ?? 'nav.dashboard');
}

/** Window in which a second back press means "yes, really exit". */
const EXIT_CONFIRM_MS = 2000;

/**
 * The mobile app shell: fixed header, scrolling content, fixed bottom tabs.
 *
 * `h-[100dvh]` rather than `h-screen` so the layout tracks Android's collapsing
 * URL/nav bars instead of leaving the tab bar off-screen. Only the middle
 * region scrolls, which is what keeps the chrome feeling native.
 */
export function MobileShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const lastBackPress = useRef(0);

  useAndroidBackButton(() => {
    // An open overlay (stat sheet, etc.) swallows the press — otherwise back
    // would dismiss it and navigate in the same gesture.
    if (consumeBackPress()) return;

    // Inside a tab's stack → pop it.
    if (!isTabRoot(pathname)) {
      navigate(-1);
      return;
    }
    // On a secondary tab root → fall back to the first tab, Android-style.
    if (pathname !== '/') {
      navigate('/');
      return;
    }
    // On the home root → require a second press before quitting.
    const now = Date.now();
    if (now - lastBackPress.current < EXIT_CONFIRM_MS) {
      void exitApp();
      return;
    }
    lastBackPress.current = now;
    toast.show(t('more.exitHint'));
  });

  // The home screen supplies its own brand hero, which draws under the status
  // bar and is full-bleed — so it opts out of both the stack header and the
  // shell's content padding. Every other screen keeps the standard chrome.
  const isHome = pathname === '/';

  return (
    <div className="flex h-[100dvh] flex-col bg-canvas">
      {!isHome && <StackHeader title={titleFor(pathname)} />}

      <main className="mobile-scroll">
        {isHome ? (
          <>
            <div className="px-4 pt-4">
              <SubscriptionBanner />
            </div>
            <Outlet />
          </>
        ) : (
          <div className="px-4 py-4">
            <SubscriptionBanner />
            <Outlet />
          </div>
        )}
      </main>

      <BottomTabs />

      {/* covers the whole shell the moment the platform admin freezes this gym */}
      <FrozenGymAlert />
      {/* sends the user to /billing the moment any call reports 402 */}
      <PaymentRequiredRedirect />
    </div>
  );
}
