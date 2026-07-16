import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { t } from '../i18n/strings';
import type { Payment, PaymentMethod } from '../lib/types';

const METHODS: PaymentMethod[] = ['cash', 'telebirr', 'bank', 'other'];

export function PaymentsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [method, setMethod] = useState('');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', from, to, method],
    queryFn: async () =>
      (
        await api.get<Payment[]>('/payments', {
          params: { from: from || undefined, to: to || undefined, method: method || undefined },
        })
      ).data,
  });

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('payments.title')}</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">{t('payments.from')}</label>
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('payments.to')}</label>
          <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('payments.method')}</label>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">{t('payments.allMethods')}</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm text-slate-500">
          {payments.length} payments · <span className="font-semibold text-slate-900">{total.toLocaleString()} {t('common.birr')}</span>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">{t('payments.date')}</th>
              <th className="px-4 py-3">{t('payments.member')}</th>
              <th className="px-4 py-3">{t('payments.amount')}</th>
              <th className="px-4 py-3">{t('payments.method')}</th>
              <th className="px-4 py-3">{t('payments.markedBy')}</th>
              <th className="px-4 py-3">{t('enroll.note')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-slate-500">{new Date(p.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{p.member_name}</td>
                <td className="px-4 py-3 font-semibold">
                  {Number(p.amount)} {t('common.birr')}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{p.method}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.marked_by_name}</td>
                <td className="px-4 py-3 text-slate-400">{p.note}</td>
              </tr>
            ))}
            {!isLoading && payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
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
