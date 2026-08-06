import { useState } from 'react';
import { t } from '../i18n/strings';
import { usePayments } from '../hooks/queries/usePayments';
import type { PaymentMethod } from '../lib/types';

const METHODS: PaymentMethod[] = ['cash', 'telebirr', 'bank', 'other'];

export function PaymentsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [method, setMethod] = useState('');

  const { data: payments = [], isLoading } = usePayments({ from, to, method });

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
        <div className="ml-auto text-sm text-fg-muted">
          {payments.length} payments · <span className="font-semibold text-fg">{total.toLocaleString()} {t('common.birr')}</span>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-fg-muted">
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
                <td colSpan={6} className="px-4 py-8 text-center text-fg-subtle">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-fg-muted">{new Date(p.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{p.member_name}</td>
                <td className="px-4 py-3 font-semibold">
                  {Number(p.amount)} {t('common.birr')}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{p.method}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">{p.marked_by_name}</td>
                <td className="px-4 py-3 text-fg-subtle">{p.note}</td>
              </tr>
            ))}
            {!isLoading && payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-subtle">
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
