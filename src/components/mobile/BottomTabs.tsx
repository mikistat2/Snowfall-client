import { Link, useLocation } from 'react-router-dom';
import { t } from '../../i18n/strings';
import { activeTabFor, TABS } from './tabs';

/**
 * Fixed bottom navigation: 56px of controls plus the gesture-bar inset, so
 * nothing sits under Android's home indicator.
 *
 * Each tab is a full-height flex column, which puts every target well over the
 * 44px minimum even though the icon itself is 24px.
 */
export function BottomTabs() {
  const { pathname } = useLocation();
  const active = activeTabFor(pathname);

  return (
    <nav
      className="shrink-0 border-t border-line bg-surface pb-safe-b"
      aria-label={t('nav.dashboard')}
    >
      <ul className="flex h-14">
        {TABS.map(({ to, labelKey, Icon }) => {
          const isActive = active === to;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-full min-h-touch flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-sky-600 dark:text-sky-400' : 'text-fg-muted'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-medium leading-none">{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
