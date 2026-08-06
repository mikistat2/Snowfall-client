import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from './icons';
import { isTabRoot } from './tabs';
import { t } from '../../i18n/strings';

/**
 * Native-feeling app bar: 56px of chrome plus the status-bar inset (the
 * WebView draws behind the status bar, so the padding is ours to add).
 *
 * A back chevron appears on any screen that is not a tab root — the tab bar
 * itself is how you move between roots.
 */
export function StackHeader({
  title,
  action,
}: {
  title: string;
  /** Optional trailing control, e.g. a filter or add button. */
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const canGoBack = !isTabRoot(pathname);

  return (
    <header className="shrink-0 border-b border-line bg-surface pt-safe-t">
      <div className="flex h-14 items-center gap-1 px-1">
        {canGoBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
            className="touch-target rounded-full text-fg active:bg-surface-2"
          >
            <ChevronLeftIcon />
          </button>
        ) : (
          <span className="w-2" />
        )}

        <h1 className="min-w-0 flex-1 truncate px-1 text-lg font-semibold text-fg">{title}</h1>

        {action ? <div className="flex shrink-0 items-center gap-1 pr-1">{action}</div> : null}
      </div>
    </header>
  );
}
