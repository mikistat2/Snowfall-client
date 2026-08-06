import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { t, type StringKey } from '../../i18n/strings';
import { ChevronRightIcon } from '../../components/mobile/icons';
import type { ThemeMode } from '../../lib/theme';

/**
 * The "More" tab — everything that does not earn a bottom-tab slot.
 *
 * Owner-only destinations are filtered here as well as guarded by the router,
 * so staff never see a row that would bounce them back.
 */

const LINKS: readonly { to: string; labelKey: StringKey; ownerOnly?: boolean }[] = [
  { to: '/today', labelKey: 'nav.today' },
  { to: '/notifications', labelKey: 'nav.notifications' },
  { to: '/settings', labelKey: 'nav.settings' },
  { to: '/audit', labelKey: 'nav.audit', ownerOnly: true },
  { to: '/guide', labelKey: 'nav.guide' },
  { to: '/feedback', labelKey: 'nav.feedback' },
];

const THEME_OPTIONS: readonly { mode: ThemeMode; labelKey: StringKey }[] = [
  { mode: 'system', labelKey: 'more.theme.system' },
  { mode: 'light', labelKey: 'more.theme.light' },
  { mode: 'dark', labelKey: 'more.theme.dark' },
];

export function MorePage() {
  const { user, gym, logout } = useAuth();
  const { mode, setMode } = useTheme();

  const links = LINKS.filter((link) => !link.ownerOnly || user?.role === 'owner');

  return (
    <div className="space-y-5">
      <section className="card p-4">
        <p className="truncate text-base font-semibold text-fg">{gym?.name ?? t('app.name')}</p>
        <p className="truncate text-sm text-fg-muted">
          {user?.name} · <span className="uppercase">{user?.role}</span>
        </p>
      </section>

      <section className="card p-0">
        <ul>
          {links.map((link, index) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex min-h-touch items-center justify-between gap-3 px-4 py-3 text-sm text-fg active:bg-surface-2 ${
                  index > 0 ? 'border-t border-line' : ''
                }`}
              >
                <span className="truncate">{t(link.labelKey)}</span>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-fg-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          {t('more.appearance')}
        </h2>
        <div
          role="radiogroup"
          aria-label={t('more.appearance')}
          className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1"
        >
          {THEME_OPTIONS.map((option) => {
            const selected = mode === option.mode;
            return (
              <button
                key={option.mode}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMode(option.mode)}
                className={`min-h-touch rounded-lg px-2 text-sm font-medium transition-colors ${
                  selected ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted'
                }`}
              >
                {t(option.labelKey)}
              </button>
            );
          })}
        </div>
      </section>

      <button type="button" onClick={logout} className="btn-secondary min-h-touch w-full">
        {t('nav.logout')}
      </button>
    </div>
  );
}
