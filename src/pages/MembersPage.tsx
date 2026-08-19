import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { useMembers } from '../hooks/queries/useMembers';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Select } from '../components/ui/Select';
import { PageTitle } from '../components/ui/PageTitle';
import { ChevronRightIcon } from '../components/mobile/icons';
import { PhoneIcon, TicketIcon } from '../components/ui/icons';
import { useMobileShell } from '../hooks/useIsMobile';
import { daysLeft, daysLeftColor } from '../lib/expiry';
import type { MemberExportRow } from '../lib/membersPdf';
import type { Member, MemberStatus } from '../lib/types';

const STATUSES: MemberStatus[] = ['active', 'expiring', 'grace', 'expired', 'frozen'];

export function MembersPage() {
  const { gym } = useAuth();
  const isMobile = useMobileShell();
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
      await downloadMembersPdf(gym?.name ?? 'Gym', data);
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
      {/* Enrolling is the reason this screen exists, so on a phone it gets a
          full-width primary button and the rarer actions share the row below. */}
      <PageTitle
        actions={
          <>
            <Link to="/members/enroll" className="btn-primary w-full sm:w-auto">
              + {t('members.enroll')}
            </Link>
            <Link to="/members/previous" className="btn-secondary flex-1 sm:flex-none">
              + {t('nav.addPrevious')}
            </Link>
            <button
              className="btn-secondary flex-1 sm:flex-none"
              onClick={() => void exportPdf()}
              disabled={exporting}
            >
              {exporting ? 'Exporting…' : '⬇ Export PDF'}
            </button>
          </>
        }
      >
        {t('members.title')}
      </PageTitle>
      {exportError && <div className="rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-700 dark:text-red-300">{exportError}</div>}

      <div className="flex flex-wrap gap-3">
        <input
          className="input w-full sm:max-w-xs"
          placeholder={t('members.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          className="w-full sm:max-w-[190px]"
          value={status}
          onChange={setStatus}
          label={t('members.allStatuses')}
          options={[
            { value: '', label: t('members.allStatuses') },
            ...STATUSES.map((s) => ({ value: s as string, label: t(`status.${s}`) })),
            { value: 'archived', label: t('members.archived') },
          ]}
        />
      </div>

      {isMobile ? (
        <MemberCards members={members} isLoading={isLoading} />
      ) : (
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
      )}
    </div>
  );
}

/**
 * The phone roster. A five-column table on a 360px screen is a horizontal
 * scroll no one performs, so each member becomes their own card: the full name
 * on top — never truncated, because picking the right Abebe out of four is the
 * whole job — then sex and phone, then the plan, with the status and the days
 * remaining held on the right where the eye scans for them.
 */
function MemberCards({ members, isLoading }: { members: Member[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="list-stack">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="list-card flex items-start gap-3">
            <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-2" />
            <span className="flex-1 space-y-2 py-1">
              <span className="block h-3.5 w-2/3 animate-pulse rounded bg-surface-2" />
              <span className="block h-3 w-1/2 animate-pulse rounded bg-surface-2" />
            </span>
            <span className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-surface-2" />
          </div>
        ))}
      </div>
    );
  }
  if (members.length === 0) {
    return <p className="card py-10 text-center text-sm text-fg-muted">{t('members.noneFound')}</p>;
  }
  return (
    <div className="list-stack">
      {members.map((m) => (
        <MemberCard key={m.id} member={m} />
      ))}
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  const left = member.expires_at != null ? daysLeft(member.expires_at) : null;

  return (
    <Link to={`/members/${member.id}`} className="list-card flex items-start gap-3">
      <Avatar member={member} />

      <div className="min-w-0 flex-1">
        {/* Wraps rather than truncates — two lines of real name beat one line
            of "Bereket Hailu A…". */}
        <p className="break-words pr-1 text-[15px] font-bold leading-snug text-fg">{member.full_name}</p>

        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-fg-muted">
          {member.sex && (
            <span className="flex items-center gap-1">
              <span aria-hidden className="text-sm leading-none text-fg-subtle">
                {member.sex === 'female' ? '♀' : '♂'}
              </span>
              {t(member.sex === 'female' ? 'members.female' : 'members.male')}
            </span>
          )}
          {member.sex && member.phone && <Dot />}
          {member.phone && (
            <span className="flex items-center gap-1">
              <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
              <span className="tabular-nums">{member.phone}</span>
            </span>
          )}
        </p>

        {member.plan_name && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
            <TicketIcon className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
            <span className="truncate font-medium">{member.plan_name}</span>
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
        <StatusBadge status={member.status} dot />
        {left !== null && member.status !== 'frozen' && (
          <span className={`text-[11px] font-semibold ${daysLeftColor[member.status]}`}>
            {remainingText(left)}
          </span>
        )}
      </div>

      <ChevronRightIcon className="h-5 w-5 shrink-0 self-center text-fg-subtle" />
    </Link>
  );
}

/** The member's photo when there is one, their initial when there is not. */
function Avatar({ member }: { member: Member }) {
  if (member.photo_url) {
    return (
      <img
        src={member.photo_url}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-base font-bold uppercase text-accent">
      {member.full_name.trim().charAt(0) || '?'}
    </span>
  );
}

function Dot() {
  return <span aria-hidden className="text-fg-subtle">·</span>;
}

/** "61 days left" / "1 day overdue" — singular matters at the edge that stings. */
function remainingText(days: number): string {
  if (days >= 0) return `${days} ${t(days === 1 ? 'members.dayLeft' : 'members.daysLeft')}`;
  const overdue = -days;
  return `${overdue} ${t(overdue === 1 ? 'members.dayOverdue' : 'members.daysOverdue')}`;
}
