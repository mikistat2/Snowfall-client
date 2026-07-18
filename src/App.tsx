import { useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { t } from './i18n/strings';
import { Logo } from './components/ui/Logo';
import { FrozenGymAlert } from './components/ui/FrozenGymAlert';
import { LiveDate } from './components/ui/LiveDate';
import { LoginPage } from './pages/LoginPage';
import { RegisterGymPage } from './pages/RegisterGymPage';
import { DashboardPage } from './pages/DashboardPage';
import { MonitorPage } from './pages/MonitorPage';
import { MembersPage } from './pages/MembersPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { EnrollPage } from './pages/EnrollPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { GuidePage } from './pages/GuidePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { LandingPage } from './pages/LandingPage';
import { SettingsPage } from './pages/SettingsPage';
import { PlatformAdminPage } from './pages/PlatformAdminPage';

export function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterGymPage />} />
      {/* hidden platform-owner control panel — own auth, independent of gym sessions */}
      <Route path="/platform" element={<PlatformAdminPage />} />
      <Route element={user ? <Layout /> : <Navigate to="/welcome" replace />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/monitor" element={<MonitorPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/enroll" element={<EnrollPage />} />
        <Route path="/members/:id" element={<MemberDetailPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/audit" element={user?.role === 'owner' ? <AuditLogPage /> : <Navigate to="/" replace />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

const nav = [
  { to: '/', label: 'nav.dashboard', end: true },
  { to: '/monitor', label: 'nav.monitor' },
  { to: '/members', label: 'nav.members' },
  { to: '/payments', label: 'nav.payments' },
  { to: '/notifications', label: 'nav.notifications' },
  { to: '/audit', label: 'nav.audit', ownerOnly: true },
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
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2.5 border-b border-slate-200 bg-white px-3 md:hidden">
        <button
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <Logo size="h-8 w-8" tile />
        <div className="min-w-0">
          <div className="truncate text-base font-extrabold text-sky-600">{gym?.name ?? t('app.name')}</div>
        </div>
      </header>

      {/* backdrop for the mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:w-56 md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-4">
          <Logo size="h-12 w-12" tile />
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold text-sky-600">{gym?.name ?? t('app.name')}</div>
            <div className="truncate text-xs text-slate-500">{user?.name}</div>
          </div>
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-xl leading-none text-slate-400 hover:text-slate-600 md:hidden"
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
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="border-t border-slate-200 px-5 py-3 text-left text-sm text-slate-500 hover:text-slate-800"
        >
          {t('nav.logout')}
        </button>
      </aside>
      <main className="min-w-0 flex-1 p-4 pt-[4.5rem] md:p-6 md:pt-6">
        {/* gym name + today's date, visible on every page */}
        <div className="relative mb-4 flex min-h-[2.5rem] items-center justify-center border-b border-slate-200 pb-2">
          <div className="gym-name min-w-0 max-w-[60%] truncate text-center text-3xl leading-tight sm:text-4xl">
            {showGymName ? gym?.name ?? t('app.name') : ''}
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <LiveDate />
          </div>
        </div>
        <Outlet />
      </main>
      {/* covers every page the moment the platform admin freezes this gym */}
      <FrozenGymAlert />
    </div>
  );
}
