import type { ReactNode } from 'react';
import { useMobileShell } from '../../hooks/useIsMobile';

/**
 * A screen's own heading — rendered on desktop, suppressed in the mobile
 * shell, where the stack header at the top of the screen already names it.
 * Printing both was the app's most visible "this is a website in a WebView"
 * tell: every screen opened with its title twice.
 *
 * `actions` stay put in either case; on a phone they simply move up into the
 * space the heading used to take.
 */
export function PageTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const isMobile = useMobileShell();

  if (!actions) return isMobile ? null : <h1 className="text-2xl font-bold">{children}</h1>;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {!isMobile && <h1 className="text-2xl font-bold">{children}</h1>}
      <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full' : ''}`}>{actions}</div>
    </div>
  );
}
