import { useState } from 'react';
import { useFeatureState } from '../../hooks/useFeatureState';
import type { FeatureNotice } from '../../api/features';

/**
 * Every feature the platform has switched on or off for this gym, newest
 * first.
 *
 * The full-screen alert is read once and dismissed; this is where the answer
 * lives afterwards, for the owner who wants to know exactly when the camera
 * went and what reason was given. Collapsed by default — it is reference
 * material, not news.
 */
export function PlatformNoticeHistory() {
  const { data } = useFeatureState();
  const [open, setOpen] = useState(false);
  const notices = data?.recent ?? [];

  if (notices.length === 0) return null;

  return (
    <div className="card p-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-touch w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-lg" aria-hidden>
          🛰️
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-fg">From the platform</span>
          <span className="block text-xs text-fg-muted">
            {notices.length} change{notices.length === 1 ? '' : 's'} to what your gym can use
          </span>
        </span>
        <span
          className={`shrink-0 text-fg-subtle transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <ul className="divide-y divide-line border-t border-line">
          {notices.map((notice) => (
            <NoticeRow key={notice.id} notice={notice} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NoticeRow({ notice }: { notice: FeatureNotice }) {
  const label = notice.feature === 'camera' ? 'Face recognition' : 'Telegram notifications';
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
          notice.allowed ? 'bg-emerald-500' : 'bg-red-500'
        }`}
        aria-hidden
      >
        {notice.allowed ? '✓' : '×'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-fg">
          {label} {notice.allowed ? 'turned on' : 'turned off'}
        </div>
        {notice.note && (
          <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-fg-muted">{notice.note}</p>
        )}
        <div className="mt-0.5 text-[11px] text-fg-subtle">
          {new Date(notice.created_at).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
          {notice.changed_by ? ` · ${notice.changed_by}` : ''}
        </div>
      </div>
    </li>
  );
}
