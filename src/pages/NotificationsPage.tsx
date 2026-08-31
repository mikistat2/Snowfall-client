import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { t } from '../i18n/strings';
import { PageTitle } from '../components/ui/PageTitle';
import { FeatureLockBanner } from '../components/ui/FeatureLockBanner';
import { PlatformNoticeHistory } from '../components/ui/PlatformNoticeHistory';
import { Select } from '../components/ui/Select';
import { Pagination, type PageMeta } from '../components/ui/Pagination';
import { useMobileShell } from '../hooks/useIsMobile';

interface Notification {
  id: number;
  member_id: number | null;
  member_name: string | null;
  type: string;
  status: 'sent' | 'failed' | 'skipped_no_chat_id';
  payload: { text?: string; error?: string };
  sent_at: string;
}

const TYPES = ['expiry_reminder', 'expired', 'absence_nudge', 'receipt', 'admin_alert', 'admin_summary'];

const statusStyle: Record<Notification['status'], string> = {
  sent: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
  skipped_no_chat_id: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
};

const statusDot: Record<Notification['status'], string> = {
  sent: 'bg-green-500',
  failed: 'bg-red-500',
  skipped_no_chat_id: 'bg-orange-500',
};

function statusLabel(status: Notification['status']): string {
  if (status === 'sent') return t('notifications.sent');
  if (status === 'failed') return t('notifications.failed');
  return t('notifications.skipped');
}

const PAGE_SIZE = 25;

export function NotificationsPage() {
  const isMobile = useMobileShell();
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['notifications', type, status, page],
    queryFn: async () =>
      (
        await api.get<{ data: Notification[]; meta: PageMeta }>('/notifications', {
          params: {
            type: type || undefined,
            status: status || undefined,
            page,
            pageSize: PAGE_SIZE,
          },
        })
      ).data,
    // The 30s poll refreshes whichever page is open. Only page 1 moves as new
    // messages arrive; deeper pages are historic and effectively stable.
    refetchInterval: 30_000,
    placeholderData: (previous) => previous,
  });

  const rows = data?.data ?? [];

  /** Any filter change invalidates the page number — page 4 of the old result
   *  is very unlikely to exist in the new one, and would render empty. */
  function refilter(apply: () => void) {
    apply();
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <PageTitle>{t('notifications.title')}</PageTitle>

      {/* An empty list looks like a quiet week; this says it is a lock. */}
      <FeatureLockBanner
        feature="telegram"
        what="No new messages are being sent. What is listed below is history."
      />

      <PlatformNoticeHistory />

      <div className="flex flex-wrap gap-3">
        <Select
          className="w-full sm:max-w-[220px]"
          value={type}
          onChange={(next) => refilter(() => setType(next))}
          label={t('notifications.type')}
          options={[
            { value: '', label: t('notifications.allTypes') },
            ...TYPES.map((v) => ({ value: v, label: v.replace(/_/g, ' ') })),
          ]}
        />
        <Select
          className="w-full sm:max-w-[200px]"
          value={status}
          onChange={(next) => refilter(() => setStatus(next))}
          label={t('notifications.status')}
          options={[
            { value: '', label: t('notifications.allStatuses') },
            { value: 'sent', label: t('notifications.sent') },
            { value: 'failed', label: t('notifications.failed') },
            { value: 'skipped_no_chat_id', label: t('notifications.skipped') },
          ]}
        />
      </div>

      {isMobile ? (
        <NotificationCards rows={rows} isLoading={isLoading} />
      ) : (
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-fg-muted">
              <th className="px-4 py-3">{t('notifications.date')}</th>
              <th className="px-4 py-3">{t('notifications.member')}</th>
              <th className="px-4 py-3">{t('notifications.type')}</th>
              <th className="px-4 py-3">{t('notifications.status')}</th>
              <th className="px-4 py-3">{t('notifications.message')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-fg-subtle">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {rows.map((n) => (
              <tr key={n.id} className="border-b border-line align-top last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-fg-muted">
                  {new Date(n.sent_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {n.member_id ? (
                    <Link to={`/members/${n.member_id}`} className="font-medium hover:underline">
                      {n.member_name}
                    </Link>
                  ) : (
                    <span className="text-fg-subtle">admin</span>
                  )}
                </td>
                <td className="px-4 py-3 text-fg-muted">{n.type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[n.status]}`}
                    title={n.status === 'skipped_no_chat_id' ? t('notifications.skippedHint') : n.payload.error}
                  >
                    {n.status === 'sent'
                      ? t('notifications.sent')
                      : n.status === 'failed'
                        ? t('notifications.failed')
                        : t('notifications.skipped')}
                  </span>
                </td>
                <td className="max-w-md px-4 py-3 text-fg-muted">
                  <span className="line-clamp-2 whitespace-pre-line">{n.payload.text}</span>
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-fg-subtle">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      <Pagination meta={data?.meta} onChange={setPage} busy={isPlaceholderData} />
    </div>
  );
}

/**
 * The phone log. Same card rhythm as the roster: the thing that identifies the
 * entry (who it went to) leads, the message body is the point of the row, and
 * delivery status is held right where the eye lands.
 */
function NotificationCards({ rows, isLoading }: { rows: Notification[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="list-stack">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="list-card space-y-2">
            <span className="flex items-center justify-between gap-3">
              <span className="h-3.5 w-1/2 animate-pulse rounded bg-surface-2" />
              <span className="h-5 w-16 animate-pulse rounded-full bg-surface-2" />
            </span>
            <span className="block h-3 w-3/4 animate-pulse rounded bg-surface-2" />
          </div>
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return <p className="card py-10 text-center text-sm text-fg-muted">—</p>;
  }
  return (
    <div className="list-stack">
      {rows.map((n) => (
        <div key={n.id} className="list-card">
          <div className="flex items-start justify-between gap-3">
            {n.member_id ? (
              <Link
                to={`/members/${n.member_id}`}
                className="min-w-0 break-words text-[15px] font-bold leading-snug text-fg"
              >
                {n.member_name}
              </Link>
            ) : (
              <span className="text-[15px] font-bold leading-snug text-fg-subtle">admin</span>
            )}
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle[n.status]}`}
            >
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${statusDot[n.status]}`} />
              {statusLabel(n.status)}
            </span>
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-fg-muted">
            <span className="chip">{n.type.replace(/_/g, ' ')}</span>
            <span className="tabular-nums">{new Date(n.sent_at).toLocaleString()}</span>
          </p>

          {n.payload.text && (
            <p className="mt-1.5 line-clamp-3 whitespace-pre-line break-words text-xs text-fg-muted">
              {n.payload.text}
            </p>
          )}
          {n.status !== 'sent' && (
            <p className="mt-1.5 break-words text-xs text-red-600 dark:text-red-400">
              {n.status === 'skipped_no_chat_id' ? t('notifications.skippedHint') : n.payload.error}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
