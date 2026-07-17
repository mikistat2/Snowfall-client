import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { MemberExportRow } from '../lib/membersPdf';
import type { Member, MemberStatus } from '../lib/types';

const STATUSES: MemberStatus[] = ['active', 'expiring', 'grace', 'expired', 'frozen'];

export function MembersPage() {
  const { gym } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  async function exportPdf() {
    setExporting(true);
    setExportError('');
    try {
      // jspdf is heavy — loaded on demand so it never slows down normal pages
      const [{ downloadMembersPdf }, { data }] = await Promise.all([
        import('../lib/membersPdf'),
        api.get<MemberExportRow[]>('/members/export'),
      ]);
      downloadMembersPdf(gym?.name ?? 'Gym', data);
    } catch (err) {
      setExportError(apiErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', search, status],
    queryFn: async () =>
      (await api.get<Member[]>('/members', { params: { search: search || undefined, status: status || undefined } }))
        .data,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('members.title')}</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => void exportPdf()} disabled={exporting}>
            {exporting ? 'Exporting…' : '⬇ Export PDF'}
          </button>
          <Link to="/members/enroll" className="btn-primary">
            + {t('members.enroll')}
          </Link>
        </div>
      </div>
      {exportError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{exportError}</div>}

      <div className="flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder={t('members.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[170px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t('members.allStatuses')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">{t('members.name')}</th>
              <th className="px-4 py-3">{t('auth.phone')}</th>
              <th className="px-4 py-3">{t('members.plan')}</th>
              <th className="px-4 py-3">{t('members.expires')}</th>
              <th className="px-4 py-3">{t('members.status')}</th>
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
            {members.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/members/${m.id}`} className="font-medium text-slate-900 hover:underline">
                    {m.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{m.phone}</td>
                <td className="px-4 py-3">{m.plan_name}</td>
                <td className="px-4 py-3">{m.expires_at ? String(m.expires_at).slice(0, 10) : '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
              </tr>
            ))}
            {!isLoading && members.length === 0 && (
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
