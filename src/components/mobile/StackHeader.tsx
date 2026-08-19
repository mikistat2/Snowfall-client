import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from './icons';
import { isTabRoot } from './tabs';
import { t } from '../../i18n/strings';

/**
 * Native-feeling app bar: 56px of chrome plus the status-bar inset (the
 * WebView draws behind the status bar, so the padding is ours to add).
 *
 * It carries the brand's sky gradient — the same one the home hero opens with
 * — rather than the page's own surface. A white bar under a white status bar
 * gave the app no crown at all: the screen just started, and on a light phone
 * the top third was a single undifferentiated sheet of white. The gradient
 * also lets the status-bar icons stay white in both themes instead of flipping
 * colour on every theme change.
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
    // z-20 + a soft elevation rather than a hairline: the list underneath
    // scrolls up to meet it, and a 1px border reads as a seam at that moment.
    <header className="relative z-20 shrink-0 rounded-b-2xl bg-gradient-to-r from-sky-600 to-sky-500 pt-safe-t text-white shadow-appbar dark:from-sky-700 dark:to-sky-600">
      <div className="flex h-14 items-center gap-1 px-1">
        {canGoBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
            className="touch-target rounded-full text-white transition-colors active:bg-white/20"
          >
            <ChevronLeftIcon />
          </button>
        ) : (
          <span className="w-3" />
        )}

        <h1 className="min-w-0 flex-1 truncate px-1 text-[17px] font-bold tracking-tight text-white">
          {title}
        </h1>

        {action ? <div className="flex shrink-0 items-center gap-1 pr-1">{action}</div> : null}
      </div>
    </header>
  );
}
