import { Link, useLocation } from 'react-router-dom';
import { t } from '../../i18n/strings';
import { activeTabFor, TABS } from './tabs';

/**
 * Fixed bottom navigation: 56px of controls plus the gesture-bar inset, so
 * nothing sits under Android's home indicator.
 *
 * Each tab is a full-height flex column, which puts every target well over the
 * 44px minimum even though the icon itself is 24px. The active tab is marked
 * three ways — a tinted pill behind the icon, the accent colour, and a heavier
 * label — because colour alone fails for a colour-blind user and washes out in
 * sunlight at the gym door.
 */
export function BottomTabs() {
  const { pathname } = useLocation();
  const active = activeTabFor(pathname);

  return (
    <nav
      className="relative z-20 shrink-0 border-t border-line bg-surface pb-safe-b"
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
                className={`flex h-full min-h-touch flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-accent' : 'text-fg-muted active:text-fg'
                }`}
              >
                <span
                  className={`flex h-7 w-14 items-center justify-center rounded-full transition-colors ${
                    isActive ? 'bg-accent/10' : ''
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {t(labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
