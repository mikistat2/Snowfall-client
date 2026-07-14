import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { t } from '../i18n/strings';

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
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  skipped_no_chat_id: 'bg-orange-100 text-orange-800',
};

export function NotificationsPage() {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['notifications', type, status],
    queryFn: async () =>
      (
        await api.get<Notification[]>('/notifications', {
          params: { type: type || undefined, status: status || undefined },
        })
      ).data,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>

      <div className="flex flex-wrap gap-3">
        <select className="input max-w-[200px]" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{t('notifications.allTypes')}</option>
          {TYPES.map((v) => (
            <option key={v} value={v}>
              {v.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select className="input max-w-[190px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t('notifications.allStatuses')}</option>
          <option value="sent">{t('notifications.sent')}</option>
          <option value="failed">{t('notifications.failed')}</option>
          <option value="skipped_no_chat_id">{t('notifications.skipped')}</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
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
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {rows.map((n) => (
              <tr key={n.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(n.sent_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {n.member_id ? (
                    <Link to={`/members/${n.member_id}`} className="font-medium hover:underline">
                      {n.member_name}
                    </Link>
                  ) : (
                    <span className="text-slate-400">admin</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{n.type.replace(/_/g, ' ')}</td>
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
                <td className="max-w-md px-4 py-3 text-slate-500">
                  <span className="line-clamp-2 whitespace-pre-line">{n.payload.text}</span>
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
