import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { t } from '../i18n/strings';
import type { TodayDigest } from '../lib/types';

/**
 * /today — a daily digest: what happened today (new members, payments,
 * check-ins, guest passes) plus who expires in the next 7 days and who just
 * expired — the staff's morning to-do list.
 */
export function TodayPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['today-digest'],
    queryFn: async () => (await api.get<TodayDigest>('/dashboard/today')).data,
    refetchInterval: 60_000,
  });

  if (isLoading || !data) return <p className="text-slate-400">{t('common.loading')}</p>;

  const expiringSoon = data.expiring.filter((m) => m.days_left >= 0);
  const justExpired = data.expiring.filter((m) => m.days_left < 0);

  const tiles = [
    {
      label: t('today.checkIns'),
      value: data.check_ins_today.allowed,
      sub: `${data.check_ins_today.unique_members} ${t('today.uniqueMembers')} · ${data.check_ins_today.denied} ${t('today.denied')}`,
    },
    { label: t('today.inside'), value: data.occupancy, sub: '' },
    {
      label: t('today.paymentsTotal'),
      value: `${data.payments_today.total.toLocaleString()} ${t('common.birr')}`,
      sub: `${data.payments_today.count}×`,
    },
    { label: t('today.newMembers'), value: data.new_members.length, sub: '' },
    { label: t('today.guestPasses'), value: data.guests_today, sub: '' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t('today.title')}</h1>
        <p className="text-sm text-slate-500">{t('today.subtitle')}</p>
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tile.label}</p>
            <p className="mt-1 text-3xl font-bold">{tile.value}</p>
            {tile.sub && <p className="text-xs text-slate-400">{tile.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* expiring in the next 7 days */}
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">⏳ {t('today.expiringTitle')}</h2>
          {expiringSoon.length === 0 && <p className="text-sm text-slate-400">{t('today.noExpiring')}</p>}
          <div className="divide-y divide-slate-100">
            {expiringSoon.map((m) => (
              <MemberRow key={m.id} id={m.id} name={m.full_name} phone={m.phone}>
                <DaysChip daysLeft={m.days_left} />
              </MemberRow>
            ))}
          </div>
        </section>

        {/* expired in the last 7 days */}
        <section className="card">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">🔴 {t('today.expiredTitle')}</h2>
          {justExpired.length > 0 && <p className="mb-2 text-xs text-slate-400">{t('today.expiredHint')}</p>}
          {justExpired.length === 0 && <p className="text-sm text-slate-400">{t('today.noExpired')}</p>}
          <div className="divide-y divide-slate-100">
            {justExpired.map((m) => (
              <MemberRow key={m.id} id={m.id} name={m.full_name} phone={m.phone}>
                <DaysChip daysLeft={m.days_left} />
              </MemberRow>
            ))}
          </div>
        </section>

        {/* new members enrolled today */}
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">🆕 {t('today.newMembersTitle')}</h2>
          {data.new_members.length === 0 && (
            <p className="text-sm text-slate-400">{t('today.noNewMembers')}</p>
          )}
          <div className="divide-y divide-slate-100">
            {data.new_members.map((m) => (
              <MemberRow key={m.id} id={m.id} name={m.full_name} phone={m.phone}>
                <span className="text-xs text-slate-500">
                  {m.plan_name ? `${t('today.plan')}: ${m.plan_name} · ` : ''}
                  {t('today.joined')} {time(m.created_at)}
                </span>
              </MemberRow>
            ))}
          </div>
        </section>

        {/* payments recorded today */}
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">💰 {t('today.paymentsTitle')}</h2>
          {data.payments_today.rows.length === 0 && (
            <p className="text-sm text-slate-400">{t('today.noPayments')}</p>
          )}
          <div className="divide-y divide-slate-100">
            {data.payments_today.rows.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <div className="min-w-0">
                  <span className="font-medium">{p.member_name}</span>
                  <span className="text-xs text-slate-400"> · {p.method} · {time(p.created_at)}</span>
                </div>
                <span className="whitespace-nowrap font-semibold">
                  {Number(p.amount).toLocaleString()} {t('common.birr')}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function time(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MemberRow({
  id,
  name,
  phone,
  children,
}: {
  id: number;
  name: string;
  phone: string | null;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={`/members/${id}`}
      className="flex items-center justify-between gap-2 rounded-lg px-1 py-2 text-sm hover:bg-slate-50"
    >
      <div className="min-w-0">
        <span className="font-medium">{name}</span>
        {phone && <span className="text-xs text-slate-400"> · {phone}</span>}
      </div>
      {children}
    </Link>
  );
}

/** "today!" / "3 days left" / "2 days ago" chip, colored by urgency. */
function DaysChip({ daysLeft }: { daysLeft: number }) {
  const text =
    daysLeft === 0
      ? t('today.expiresToday')
      : daysLeft === 1
        ? t('today.tomorrow')
        : daysLeft > 1
          ? `${daysLeft} ${t('today.daysLeft')}`
          : daysLeft === -1
            ? t('today.yesterday')
            : `${-daysLeft} ${t('today.daysAgo')}`;
  const cls =
    daysLeft < 0
      ? 'bg-red-100 text-red-700'
      : daysLeft <= 2
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-100 text-slate-600';
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{text}</span>
  );
}
