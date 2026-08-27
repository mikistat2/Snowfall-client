import { useFeatureLocks } from '../../hooks/useFeatureState';

/**
 * The quiet, permanent half of the feature-revocation story.
 *
 * FeatureNoticeAlert announces the change once. This is what a member of staff
 * sees three weeks later when they open the monitor and wonder why the camera
 * box is empty — the answer has to be on the screen where the question gets
 * asked, not only in a dialog somebody else dismissed.
 *
 * Renders nothing while the feature is allowed, so pages can mount it
 * unconditionally.
 */
export function FeatureLockBanner({
  feature,
  what,
  className = '',
}: {
  feature: 'camera' | 'telegram';
  /** What specifically is unavailable on THIS screen. */
  what: string;
  className?: string;
}) {
  const locks = useFeatureLocks();
  if (locks[feature]) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 dark:border-amber-900 dark:bg-amber-950/40 ${className}`}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-base"
        aria-hidden
      >
        🔒
      </span>
      <div className="min-w-0 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
        <b>{feature === 'camera' ? 'Face recognition' : 'Telegram notifications'} is turned off</b> for
        this gym by the platform administrator. {what}
        <div className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
          Nothing was deleted — it all comes back if the platform switches it on again.
        </div>
      </div>
    </div>
  );
}
