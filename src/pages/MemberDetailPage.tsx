import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { StatusBadge } from '../components/ui/StatusBadge';
import { daysLeft, daysLeftColor } from '../lib/expiry';
import { paymentMethodLabel } from '../lib/payments';
import { TelegramLinkModal } from '../components/ui/TelegramLinkModal';
import { RenewModal } from '../components/members/RenewModal';
import { RemoveMemberModal } from '../components/members/RemoveMemberModal';
import { EditMemberModal } from '../components/members/EditMemberModal';
import { useMember, useMemberTelegramLink, useSetMemberFrozen } from '../hooks/queries/useMembers';
import { useAuth } from '../hooks/useAuth';
import { qk } from '../hooks/queries/keys';

/** One labelled fact in the member's summary grid. */
function Fact({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'muted' }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-fg-muted">{label}</dt>
      <dd
        className={`mt-0.5 break-words text-sm font-medium ${
          tone === 'good' ? 'text-green-600 dark:text-green-400' : tone === 'muted' ? 'text-fg-muted' : 'text-fg'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export function MemberDetailPage() {
  const { id } = useParams();
  const memberId = Number(id);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [renewOpen, setRenewOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
      {/*
        * Identity first, then the facts about this membership, then what you
        * can do about it. On a phone that is three stacked blocks rather than
        * one wide row of chips — a name wrapping around a photo with six
        * pills trailing off the edge told you nothing at a glance.
        */}
      <section className="card">
        <div className="flex items-center gap-4">
          {member.photo_url ? (
            <img src={member.photo_url} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xl font-bold uppercase text-accent">
              {member.full_name[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-bold leading-snug sm:text-2xl">{member.full_name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={member.status} dot />
              {remaining != null && !frozen && (
                <span className={`text-xs font-bold ${daysLeftColor[member.status]}`}>
                  {remaining >= 0
                    ? `${remaining} ${t(remaining === 1 ? 'members.dayLeft' : 'members.daysLeft')}`
                    : `${-remaining} ${t(-remaining === 1 ? 'members.dayOverdue' : 'members.daysOverdue')}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
          <Fact label={t('members.plan')} value={current?.plan_name ?? '—'} />
          <Fact label={t('auth.phone')} value={member.phone || '—'} />
          <Fact
            label={t('members.telegram')}
            value={member.telegram_chat_id ? t('members.linked') : t('members.notLinked')}
            tone={member.telegram_chat_id ? 'good' : 'muted'}
          />
          <Fact label={t('members.faceCaptures')} value={String(data.descriptor_count)} />
        </dl>

        {/* Renewing is why this screen gets opened; it leads, full width on a
            phone, and the rest share the row beneath it. */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 sm:flex sm:flex-wrap sm:justify-end">
          <button
            className="btn-primary col-span-2 sm:order-last"
            onClick={() => setRenewOpen(true)}
            disabled={archived}
          >
            {t('members.renew')}
          </button>
          <button className="btn-secondary" onClick={() => setEditOpen(true)}>
            {t('edit.action')}
          </button>
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
        </div>
      </section>

      {archived && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {t('members.archivedBanner')}
        </div>
      )}

      {/*
        * Both histories were three- and four-column tables with a 380px floor,
        * which on a phone meant a sideways scroll to read a date. They are
        * rows now: the identifying fact on the left, the number or state on
        * the right, detail underneath — the same shape at every width.
        */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-1 font-semibold">{t('members.subscriptions')}</h2>
          <div>
            {data.subscriptions.map((s) => (
              <div key={s.id} className="border-t border-line py-3 first:border-t-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 break-words text-sm font-semibold text-fg">{s.plan_name}</span>
                  <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-fg-subtle">
                    {s.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs tabular-nums text-fg-muted">
                  {String(s.starts_at).slice(0, 10)} → {String(s.expires_at).slice(0, 10)}
                  {s.status === 'frozen' && s.frozen_days_remaining != null && (
                    <span className="ml-2 font-medium text-fg-subtle">
                      {s.frozen_days_remaining} {t('members.daysLeft')}
                    </span>
                  )}
                </p>
              </div>
            ))}
            {data.subscriptions.length === 0 && (
              <p className="py-6 text-center text-sm text-fg-muted">—</p>
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-1 font-semibold">{t('members.paymentHistory')}</h2>
          <div>
            {data.payments.map((p) => (
              <div key={p.id} className="border-t border-line py-3 first:border-t-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold tabular-nums text-fg">
                    {Number(p.amount).toLocaleString()} {t('common.birr')}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-fg-muted">
                    {String(p.created_at).slice(0, 10)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="chip">{paymentMethodLabel(p.method)}</span>
                  {p.note && <span className="min-w-0 truncate text-xs text-fg-subtle">{p.note}</span>}
                </div>
              </div>
            ))}
            {data.payments.length === 0 && <p className="py-6 text-center text-sm text-fg-muted">—</p>}
          </div>
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

      {editOpen && (
        <EditMemberModal member={member} subscription={current} onClose={() => setEditOpen(false)} />
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
