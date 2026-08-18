import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { useMembers } from '../hooks/queries/useMembers';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/ui/StatusBadge';
import { daysLeft, daysLeftColor } from '../lib/expiry';
import type { MemberExportRow } from '../lib/membersPdf';
import type { MemberStatus } from '../lib/types';

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

  // "Archived" shares the status dropdown but is a different roster, not a status
  const archived = status === 'archived';
  const { data: members = [], isLoading } = useMembers({
    search,
    status: archived ? '' : (status as MemberStatus | ''),
    archived,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('members.title')}</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => void exportPdf()} disabled={exporting}>
            {exporting ? 'Exporting…' : '⬇ Export PDF'}
          </button>
          <Link to="/members/previous" className="btn-secondary">
            + {t('nav.addPrevious')}
          </Link>
          <Link to="/members/enroll" className="btn-primary">
            + {t('members.enroll')}
          </Link>
        </div>
      </div>
      {exportError && <div className="rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-700 dark:text-red-300">{exportError}</div>}

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
          <option value="archived">{t('members.archived')}</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-fg-muted">
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
                <td colSpan={5} className="px-4 py-8 text-center text-fg-subtle">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {members.map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link to={`/members/${m.id}`} className="font-medium text-fg hover:underline">
                    {m.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-fg-muted">{m.phone}</td>
                <td className="px-4 py-3">{m.plan_name}</td>
                <td className="px-4 py-3">{m.expires_at ? String(m.expires_at).slice(0, 10) : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={m.status} />
                    {m.expires_at != null && m.status !== 'frozen' && (
                      <span className={`whitespace-nowrap text-xs font-bold ${daysLeftColor[m.status]}`}>
                        {daysLeft(m.expires_at) >= 0
                          ? `${daysLeft(m.expires_at)} ${t('members.daysLeft')}`
                          : `${-daysLeft(m.expires_at)} ${t('members.daysOverdue')}`}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-fg-subtle">
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
