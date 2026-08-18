import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { StatusBadge } from '../components/ui/StatusBadge';
import { daysLeft, daysLeftColor } from '../lib/expiry';
import { TelegramLinkModal } from '../components/ui/TelegramLinkModal';
import { RenewModal } from '../components/members/RenewModal';
import { RemoveMemberModal } from '../components/members/RemoveMemberModal';
import { useMember, useMemberTelegramLink, useSetMemberFrozen } from '../hooks/queries/useMembers';
import { useAuth } from '../hooks/useAuth';
import { qk } from '../hooks/queries/keys';

export function MemberDetailPage() {
  const { id } = useParams();
  const memberId = Number(id);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [renewOpen, setRenewOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const { data, isLoading } = useMember(memberId);

  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const linkMutation = useMemberTelegramLink(memberId);
  useEffect(() => {
    if (linkMutation.data) setLinkUrl(linkMutation.data.url);
  }, [linkMutation.data]);

  const freezeMutation = useSetMemberFrozen(memberId);

  if (isLoading || !data) return <p className="text-fg-subtle">{t('common.loading')}</p>;
  const { member } = data;
  const frozen = member.status === 'frozen';
  const archived = Boolean(member.archived_at);
  const current = data.subscriptions[0];
  const remaining = current ? daysLeft(current.expires_at) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          {member.photo_url ? (
            <img src={member.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-xl font-bold text-fg-muted">
              {member.full_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{member.full_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
              <StatusBadge status={member.status} />
              {current && (
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-fg-muted">
                  {current.plan_name}
                </span>
              )}
              {remaining != null && !frozen && (
                <span className={`text-xs font-bold ${daysLeftColor[member.status]}`}>
                  {remaining >= 0
                    ? `${remaining} ${t('members.daysLeft')}`
                    : `${-remaining} ${t('members.daysOverdue')}`}
                </span>
              )}
              <span>{member.phone}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  member.telegram_chat_id ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-surface-2 text-fg-muted'
                }`}
              >
                {t('members.telegram')}: {member.telegram_chat_id ? t('members.linked') : t('members.notLinked')}
              </span>
              <span className="text-xs text-fg-subtle">{data.descriptor_count} face captures</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => linkMutation.mutate()} disabled={linkMutation.isPending}>
            {member.telegram_chat_id ? t('telegram.relink') : t('telegram.link')}
          </button>
          <button
            className="btn-secondary"
            onClick={() => freezeMutation.mutate(!frozen)}
            disabled={freezeMutation.isPending || archived}
          >
            {frozen ? t('members.unfreeze') : t('members.freeze')}
          </button>
          {/* destructive, so owner-only — same rule as the audit log and staff accounts */}
          {user?.role === 'owner' && (
            <button className="btn-secondary" onClick={() => setRemoveOpen(true)}>
              {archived ? t('members.restore') : t('members.remove')}
            </button>
          )}
          <button className="btn-primary" onClick={() => setRenewOpen(true)} disabled={archived}>
            {t('members.renew')}
          </button>
        </div>
      </div>

      {archived && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {t('members.archivedBanner')}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card overflow-x-auto">
          <h2 className="mb-3 font-semibold">{t('members.subscriptions')}</h2>
          <table className="w-full min-w-[380px] text-sm">
            <tbody>
              {data.subscriptions.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="py-2 font-medium">{s.plan_name}</td>
                  <td className="py-2 text-fg-muted">
                    {String(s.starts_at).slice(0, 10)} → {String(s.expires_at).slice(0, 10)}
                  </td>
                  <td className="py-2 text-right text-xs uppercase text-fg-subtle">
                    {s.status}
                    {s.status === 'frozen' && s.frozen_days_remaining != null && ` (${s.frozen_days_remaining}d left)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card overflow-x-auto">
          <h2 className="mb-3 font-semibold">{t('members.paymentHistory')}</h2>
          <table className="w-full min-w-[380px] text-sm">
            <tbody>
              {data.payments.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="py-2">{String(p.created_at).slice(0, 10)}</td>
                  <td className="py-2 font-medium">
                    {Number(p.amount)} {t('common.birr')}
                  </td>
                  <td className="py-2 text-fg-muted">{p.method}</td>
                  <td className="py-2 text-right text-fg-subtle">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card lg:col-span-2">
          <h2 className="mb-3 font-semibold">{t('members.checkInHistory')}</h2>
          <div className="flex flex-wrap gap-2">
            {data.check_ins.map((c) => (
              <span
                key={c.id}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                  c.decision === 'allowed' || c.decision === 'override'
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300'
                    : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300'
                }`}
                title={c.decision}
              >
                {new Date(c.checked_in_at).toLocaleString()}
              </span>
            ))}
            {data.check_ins.length === 0 && <span className="text-sm text-fg-subtle">—</span>}
          </div>
        </section>
      </div>

      {linkMutation.isError && (
        <p className="rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-700 dark:text-red-300">{apiErrorMessage(linkMutation.error)}</p>
      )}

      {renewOpen && <RenewModal memberId={memberId} onClose={() => setRenewOpen(false)} />}
      {removeOpen && (
        <RemoveMemberModal
          memberId={memberId}
          memberName={member.full_name}
          paymentCount={data.payments.length}
          archived={archived}
          onClose={() => setRemoveOpen(false)}
        />
      )}
      {linkUrl && (
        <TelegramLinkModal
          url={linkUrl}
          onClose={() => {
            setLinkUrl(null);
            void queryClient.invalidateQueries({ queryKey: qk.member(memberId) });
          }}
        />
      )}
    </div>
  );
}
