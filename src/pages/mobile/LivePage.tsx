import { t } from '../../i18n/strings';

/**
 * The Live tab — a read-only stream of check-in events from the entrance
 * kiosk, with a manual "allow entry" override on denials.
 *
 * Placeholder until step 4, which wires it to the Socket.io feed and reuses
 * the existing EventFeed component. It exists now so the tab bar, stack
 * headers and back-button behaviour can be exercised on a real route.
 */
export function LivePage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-2xl">
        📡
      </div>
      <p className="text-sm text-fg-muted">{t('live.comingSoon')}</p>
    </div>
  );
}
