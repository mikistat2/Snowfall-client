import { useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useMobileShell } from './hooks/useIsMobile';
import { NATIVE } from './lib/platform';
import { t } from './i18n/strings';
import { Logo } from './components/ui/Logo';
import { FrozenGymAlert } from './components/ui/FrozenGymAlert';
import { FeatureNoticeAlert } from './components/ui/FeatureNoticeAlert';
import { PaymentRequiredRedirect } from './components/ui/PaymentRequiredRedirect';
import { SubscriptionBanner } from './components/ui/SubscriptionBanner';
import { LiveDate } from './components/ui/LiveDate';
import { MobileShell } from './components/mobile/MobileShell';
import { LoginPage } from './pages/LoginPage';
import { RegisterGymPage } from './pages/RegisterGymPage';
import { DashboardPage } from './pages/DashboardPage';
import { TodayPage } from './pages/TodayPage';
import { MonitorPage } from './pages/MonitorPage';
import { MembersPage } from './pages/MembersPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { EnrollPage } from './pages/EnrollPage';
import { PreviousMemberPage } from './pages/PreviousMemberPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { GuidePage } from './pages/GuidePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';
import { PlatformAdminPage } from './pages/PlatformAdminPage';
import { BillingPage } from './pages/BillingPage';
import { MorePage } from './pages/mobile/MorePage';
import { LivePage } from './pages/mobile/LivePage';
import { HomePage } from './pages/mobile/HomePage';

export function App() {
  const { user } = useAuth();
  const mobile = useMobileShell();

  // The desktop sidebar is meaningless on a phone, and the mobile tab bar is
  // wrong on a wide screen — one shell or the other, never both.
  const Shell = mobile ? MobileShell : Layout;

  return (
    <Routes>
      {/* Marketing and sign-up flows are web-only: the app is installed by
          staff of an already-registered gym, so it opens straight at login. */}
      {!NATIVE && <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <LandingPage />} />}
      {!NATIVE && <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterGymPage />} />}
      {!NATIVE && <Route path="/pricing" element={<PricingPage />} />}
      {/* hidden platform-owner control panel — own auth, independent of gym
          sessions, and never shipped to the phone */}
      {!NATIVE && <Route path="/platform" element={<PlatformAdminPage />} />}

      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      {/* Deliberately OUTSIDE the shell: an expired gym is locked out of the
          normal navigation, so the billing page carries its own header and
          logout and must stay reachable. */}
      <Route
        path="/billing"
        element={user ? <BillingPage /> : <Navigate to={NATIVE ? '/login' : '/welcome'} replace />}
      />

      <Route element={user ? <Shell /> : <Navigate to={NATIVE ? '/login' : '/welcome'} replace />}>
        {/* Home is the one screen with a genuinely different design per form
            factor: a phone-native hero + triage list, versus the desktop
            dashboard with its peak-hours chart. The rest of the app shares one
            implementation across both shells. */}
        <Route path="/" element={mobile ? <HomePage /> : <DashboardPage />} />
        <Route path="/today" element={<TodayPage />} />
        {/* the recognition loop belongs to the entrance kiosk, not the phone */}
        {!NATIVE && <Route path="/monitor" element={<MonitorPage />} />}
        <Route path="/live" element={<LivePage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/enroll" element={<EnrollPage />} />
        {/* back-fill of the gym's pre-installation paper register */}
        <Route path="/members/previous" element={<PreviousMemberPage />} />
        <Route path="/members/:id" element={<MemberDetailPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/audit" element={user?.role === 'owner' ? <AuditLogPage /> : <Navigate to="/" replace />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

const nav = [
  { to: '/', label: 'nav.dashboard', end: true },
  { to: '/today', label: 'nav.today' },
  { to: '/monitor', label: 'nav.monitor' },
  { to: '/members', label: 'nav.members' },
  { to: '/members/previous', label: 'nav.addPrevious' },
  { to: '/payments', label: 'nav.payments' },
  { to: '/notifications', label: 'nav.notifications' },
  { to: '/audit', label: 'nav.audit', ownerOnly: true },
  // the owner pays the platform subscription, so only they need this
  { to: '/billing', label: 'nav.billing', ownerOnly: true },
  { to: '/settings', label: 'nav.settings' },
  { to: '/guide', label: 'nav.guide' },
  { to: '/feedback', label: 'nav.feedback' },
] as const;

function Layout() {
  const { user, gym, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // the dashboard already opens with the gym name as its hero heading
  const showGymName = pathname !== '/';
  const items = nav.filter((item) => !('ownerOnly' in item && item.ownerOnly) || user?.role === 'owner');
  return (
    <div className="flex min-h-screen">
      {/* mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2.5 border-b border-line bg-surface px-3 md:hidden">
        <button
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-fg-muted hover:bg-surface-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <Logo size="h-8 w-8" tile />
        <div className="min-w-0">
          <div className="truncate text-base font-extrabold text-sky-600 dark:text-sky-400">{gym?.name ?? t('app.name')}</div>
        </div>
      </header>

      {/* backdrop for the mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-line bg-surface transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-4">
          <Logo size="h-12 w-12" tile />
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold text-sky-600 dark:text-sky-400">{gym?.name ?? t('app.name')}</div>
            <div className="truncate text-xs text-fg-muted">{user?.name}</div>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-xl leading-none text-fg-subtle hover:text-fg-muted md:hidden"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item && item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-slate-900 text-white dark:bg-sky-600' : 'text-fg-muted hover:bg-surface-2'
                }`
              }
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="border-t border-line px-5 py-3 text-left text-sm text-fg-muted hover:text-fg"
        >
          {t('nav.logout')}
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-4 pt-[4.5rem] md:p-6 md:pt-6">
        {/* gym name + today's date, visible on every page.
            Phone: stacked and centered. sm+: name centered, date pinned right. */}
        <div className="mb-4 flex flex-col items-center gap-1 border-b border-line pb-2 sm:relative sm:min-h-[2.5rem] sm:flex-row sm:justify-center">
          <div className="gym-name w-full min-w-0 truncate text-center text-2xl leading-tight sm:max-w-[60%] sm:text-4xl">
            {showGymName ? gym?.name ?? t('app.name') : ''}
          </div>
          <div className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
            <LiveDate />
          </div>
        </div>
        <SubscriptionBanner />
        <Outlet />
      </main>
      {/* covers every page the moment the platform admin freezes this gym */}
      <FrozenGymAlert />
      {/* announces a camera/Telegram entitlement the platform has just changed */}
      <FeatureNoticeAlert />
      {/* sends the user to /billing the moment any call reports 402 */}
      <PaymentRequiredRedirect />
    </div>
  );
}
