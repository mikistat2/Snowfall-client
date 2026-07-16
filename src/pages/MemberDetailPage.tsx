import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TelegramLinkModal } from '../components/ui/TelegramLinkModal';
import { RenewModal } from '../components/members/RenewModal';
import type { CheckIn, Member, Payment, Subscription } from '../lib/types';

interface Detail {
  member: Member;
  subscriptions: Subscription[];
  payments: Payment[];
  check_ins: CheckIn[];
  descriptor_count: number;
}

export function MemberDetailPage() {
  const { id } = useParams();
  const memberId = Number(id);
  const queryClient = useQueryClient();
  const [renewOpen, setRenewOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => (await api.get<Detail>(`/members/${memberId}`)).data,
  });

  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const linkMutation = useMutation({
    mutationFn: async () =>
      (await api.post<{ url: string }>(`/members/${memberId}/telegram-link`)).data,
    onSuccess: (data) => setLinkUrl(data.url),
  });

  const freezeMutation = useMutation({
    mutationFn: async (action: 'freeze' | 'unfreeze') => api.post(`/members/${memberId}/${action}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      void queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  if (isLoading || !data) return <p className="text-slate-400">{t('common.loading')}</p>;
  const { member } = data;
  const frozen = member.status === 'frozen';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          {member.photo_url ? (
            <img src={member.photo_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-500">
              {member.full_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{member.full_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <StatusBadge status={member.status} />
              <span>{member.phone}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  member.telegram_chat_id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {t('members.telegram')}: {member.telegram_chat_id ? t('members.linked') : t('members.notLinked')}
              </span>
              <span className="text-xs text-slate-400">{data.descriptor_count} face captures</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => linkMutation.mutate()} disabled={linkMutation.isPending}>
            {member.telegram_chat_id ? t('telegram.relink') : t('telegram.link')}
          </button>
          <button
            className="btn-secondary"
            onClick={() => freezeMutation.mutate(frozen ? 'unfreeze' : 'freeze')}
            disabled={freezeMutation.isPending}
          >
            {frozen ? t('members.unfreeze') : t('members.freeze')}
          </button>
          <button className="btn-primary" onClick={() => setRenewOpen(true)}>
            {t('members.renew')}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card overflow-x-auto">
          <h2 className="mb-3 font-semibold">{t('members.subscriptions')}</h2>
          <table className="w-full min-w-[380px] text-sm">
            <tbody>
              {data.subscriptions.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-medium">{s.plan_name}</td>
                  <td className="py-2 text-slate-500">
                    {String(s.starts_at).slice(0, 10)} → {String(s.expires_at).slice(0, 10)}
                  </td>
                  <td className="py-2 text-right text-xs uppercase text-slate-400">
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
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2">{String(p.created_at).slice(0, 10)}</td>
                  <td className="py-2 font-medium">
                    {Number(p.amount)} {t('common.birr')}
                  </td>
                  <td className="py-2 text-slate-500">{p.method}</td>
                  <td className="py-2 text-right text-slate-400">{p.note}</td>
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
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
                title={c.decision}
              >
                {new Date(c.checked_in_at).toLocaleString()}
              </span>
            ))}
            {data.check_ins.length === 0 && <span className="text-sm text-slate-400">—</span>}
          </div>
        </section>
      </div>

      {linkMutation.isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorMessage(linkMutation.error)}</p>
      )}

      {renewOpen && <RenewModal memberId={memberId} onClose={() => setRenewOpen(false)} />}
      {linkUrl && (
        <TelegramLinkModal
          url={linkUrl}
          onClose={() => {
            setLinkUrl(null);
            void queryClient.invalidateQueries({ queryKey: ['member', memberId] });
          }}
        />
      )}
    </div>
  );
}
