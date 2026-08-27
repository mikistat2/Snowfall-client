import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acknowledgeNotice, type FeatureNotice } from '../../api/features';
import { useFeatureState } from '../../hooks/useFeatureState';
import { pushBackInterceptor } from '../../lib/backInterceptor';
import { hapticSuccess, hapticTap } from '../../lib/haptics';
import { qk } from '../../hooks/queries/keys';

/**
 * The platform switched a feature off (or back on) — say so, once, properly.
 *
 * A locked toggle buried in Settings is not a notification: the gym finds out
 * when the door camera goes quiet mid-session and nobody knows why. This is
 * the announcement, mounted in both shells so it lands on whatever screen the
 * user happens to be on.
 *
 * It is deliberately NOT dismissible by backdrop tap or Escape. Acknowledging
 * writes to the server, which is what stops it coming back, and a stray tap
 * outside the card must not be mistaken for "I read that". The Android back
 * button is swallowed for the same reason.
 *
 * Notices queue: two features revoked in one action produce two cards, walked
 * oldest first, so each one gets its own explanation.
 */
export function FeatureNoticeAlert() {
  const { data } = useFeatureState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pending = data?.pending ?? [];
  const notice = pending[0];

  // Swallow Android back while a notice is up — see the note above.
  useEffect(() => {
    if (!notice) return;
    return pushBackInterceptor(() => undefined);
  }, [notice]);

  const ack = useMutation({
    mutationFn: (id: number) => acknowledgeNotice(id),
    // Only the notice list is refetched. The entitlement itself did not change
    // by being read, so nothing else needs to know.
    onSettled: () => queryClient.invalidateQueries({ queryKey: qk.features }),
  });

  if (!notice) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm motion-safe:animate-fade-in sm:items-center sm:justify-center sm:p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="feature-notice-title"
    >
      <div className="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl motion-safe:animate-sheet-up sm:max-h-[90vh] sm:max-w-md sm:rounded-3xl sm:motion-safe:animate-rise-in">
        <NoticeCard
          key={notice.id}
          notice={notice}
          remaining={pending.length}
          busy={ack.isPending}
          error={ack.isError ? 'Could not save that just now — tap again.' : null}
          onAcknowledge={() => {
            if (notice.allowed) hapticSuccess();
            else hapticTap();
            ack.mutate(notice.id);
          }}
          onOpenSettings={() => {
            ack.mutate(notice.id);
            navigate('/settings');
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the copy — this is where most of the value of the feature lives      */
/* ------------------------------------------------------------------ */

interface Copy {
  eyebrow: string;
  title: string;
  lead: string;
  points: { icon: 'stop' | 'ok' | 'keep'; text: string }[];
  settingsLabel: string;
}

/**
 * Two things have to survive being skim-read: what stopped working, and that
 * nothing was deleted — the second is what turns a panicked support call into
 * a shrug.
 */
function copyFor(notice: FeatureNotice): Copy {
  if (notice.feature === 'camera') {
    return notice.allowed
      ? {
          eyebrow: 'Feature restored',
          title: 'Face check-in is back on',
          lead: 'The platform has re-enabled face recognition for your gym.',
          points: [
            { icon: 'ok', text: 'The door camera and automatic check-in work again.' },
            { icon: 'ok', text: 'New members can be enrolled with a face scan.' },
            { icon: 'keep', text: 'Every face enrolled before is still there — nothing was lost.' },
          ],
          settingsLabel: 'Check camera settings',
        }
      : {
          eyebrow: 'Feature turned off',
          title: 'Face check-in has been turned off',
          lead: 'The platform administrator has switched off face recognition for your gym.',
          points: [
            { icon: 'stop', text: 'The door camera and automatic check-in have stopped.' },
            { icon: 'stop', text: 'New members are enrolled without a face scan.' },
            { icon: 'ok', text: 'Your gym keeps running — check members in from the members list.' },
            {
              icon: 'keep',
              text: 'No face data was deleted. It all comes back if this is switched on again.',
            },
          ],
          settingsLabel: 'See what changed',
        };
  }

  return notice.allowed
    ? {
        eyebrow: 'Feature restored',
        title: 'Telegram messages are back on',
        lead: 'The platform has re-enabled Telegram notifications for your gym.',
        points: [
          { icon: 'ok', text: 'Expiry reminders, absence nudges and receipts send again.' },
          { icon: 'keep', text: 'Your saved bot token was kept and has reconnected automatically.' },
        ],
        settingsLabel: 'Open Telegram settings',
      }
    : {
        eyebrow: 'Feature turned off',
        title: 'Telegram messages have been turned off',
        lead: 'The platform administrator has switched off Telegram notifications for your gym.',
        points: [
          { icon: 'stop', text: 'No expiry reminders, absence nudges or receipts will be sent.' },
          { icon: 'stop', text: 'Members will not receive Telegram messages from your gym.' },
          { icon: 'ok', text: 'Everything else — check-ins, payments, reports — is unaffected.' },
          { icon: 'keep', text: 'Your bot token is kept and reconnects if this is switched on again.' },
        ],
        settingsLabel: 'Open Telegram settings',
      };
}

/* ------------------------------------------------------------------ */
/* one card                                                            */
/* ------------------------------------------------------------------ */

function NoticeCard({
  notice,
  remaining,
  busy,
  error,
  onAcknowledge,
  onOpenSettings,
}: {
  notice: FeatureNotice;
  remaining: number;
  busy: boolean;
  error: string | null;
  onAcknowledge: () => void;
  onOpenSettings: () => void;
}) {
  const copy = copyFor(notice);
  const off = !notice.allowed;
  const [entered, setEntered] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // The icon pops a beat after the sheet lands, so the eye is drawn to the
  // thing the card is about rather than to the whole card arriving at once.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true);
      return;
    }
    const timer = setTimeout(() => setEntered(true), 90);
    return () => clearTimeout(timer);
  }, []);

  // A queued second notice reuses this scroll container — start it at the top.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [notice.id]);

  return (
    <>
      {/* The grab handle is the only thing pinned above the scroll area: it is
          the affordance for the sheet itself, not part of the content. */}
      <div className="flex shrink-0 justify-center pt-2.5 sm:hidden">
        <span className="h-1 w-10 rounded-full bg-fg-subtle/40" />
      </div>

      {/*
       * Hero and body scroll together rather than pinning the hero and giving
       * the body what is left. On a landscape phone or a short browser window
       * a pinned hero eats most of the card and leaves the points readable
       * three words at a time; scrolling the whole thing degrades gracefully
       * at any height and still opens on the icon and the headline.
       */}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          className={`relative overflow-hidden px-6 pb-6 pt-4 text-center ${
            off
              ? 'bg-gradient-to-b from-red-500/15 to-transparent'
              : 'bg-gradient-to-b from-emerald-500/15 to-transparent'
          }`}
        >
          <div className="relative mx-auto h-20 w-20">
            {/* a single expanding ring — presence, not a light show */}
            <span
              className={`absolute inset-0 rounded-full motion-safe:animate-pulse-ring ${
                off ? 'bg-red-500/25' : 'bg-emerald-500/25'
              }`}
              aria-hidden
            />
            <span
              className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg ${
                off ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'
              }`}
              style={{
                transform: entered ? 'scale(1)' : 'scale(0.5)',
                opacity: entered ? 1 : 0,
                transition: 'transform 460ms cubic-bezier(0.34,1.56,0.64,1), opacity 220ms',
              }}
            >
              <FeatureGlyph feature={notice.feature} off={off} />
            </span>
          </div>

          <div
            className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
              off
                ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {copy.eyebrow}
          </div>

          <h2 id="feature-notice-title" className="mt-2 text-xl font-extrabold leading-tight text-fg">
            {copy.title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">{copy.lead}</p>
        </div>

        <div className="px-5 pb-1">
          {notice.note && (
            <div className="mb-4 rounded-2xl border border-line bg-surface-2 p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-fg-subtle">
                Message from the platform
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-fg">{notice.note}</p>
            </div>
          )}

          <ul className="space-y-2.5">
            {copy.points.map((point) => (
              <li key={point.text} className="flex items-start gap-3 rounded-2xl bg-surface-2 px-3.5 py-3">
                <PointIcon kind={point.icon} />
                <span className="text-sm leading-relaxed text-fg">{point.text}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-center text-xs leading-relaxed text-fg-subtle">
            Changed by {notice.changed_by ?? 'the platform'} on{' '}
            {new Date(notice.created_at).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            . Only the platform can change this back.
          </p>
        </div>
      </div>

      {/* actions — pinned, thumb-reachable, clear of the gesture bar */}
      <div className="shrink-0 space-y-2 border-t border-line bg-surface px-5 pb-safe-b pt-4">
        {/* Acknowledging writes to the server. A failure that looked like a
            dismissal would bring the whole card back on the next load with no
            explanation for why. */}
        {error && <p className="text-center text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
        <button className="btn-primary min-h-touch w-full" disabled={busy} onClick={onAcknowledge}>
          {busy ? 'Saving…' : remaining > 1 ? `Got it — 1 more to read` : 'Got it'}
        </button>
        <button className="btn-secondary min-h-touch w-full" disabled={busy} onClick={onOpenSettings}>
          {copy.settingsLabel}
        </button>
        <div className="h-3" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* glyphs                                                              */
/* ------------------------------------------------------------------ */

/** Camera or paper plane, struck through when the feature is off. */
function FeatureGlyph({ feature, off }: { feature: 'camera' | 'telegram'; off: boolean }) {
  return (
    <svg
      className="h-10 w-10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {feature === 'camera' ? (
        <>
          <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.1-1.8a1 1 0 0 1 .86-.49h6.68a1 1 0 0 1 .86.49L17.3 7h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
          <circle cx="12" cy="12.8" r="3.2" />
        </>
      ) : (
        <path d="M21 4 3 11l6 2.4L18 7l-6.6 7.6.5 5L14 16l4.5 3z" />
      )}
      {off && <path d="M4 20 20 4" strokeWidth="2.4" />}
    </svg>
  );
}

function PointIcon({ kind }: { kind: 'stop' | 'ok' | 'keep' }) {
  const tone =
    kind === 'stop'
      ? 'bg-red-500/15 text-red-600 dark:text-red-400'
      : kind === 'ok'
        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
        : 'bg-sky-500/15 text-sky-600 dark:text-sky-400';
  const glyph = kind === 'stop' ? '×' : kind === 'ok' ? '✓' : '🔒';
  return (
    <span
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${tone}`}
      aria-hidden
    >
      {glyph}
    </span>
  );
}
