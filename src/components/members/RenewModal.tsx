import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { t } from '../../i18n/strings';
import type { PaymentMethod, Plan } from '../../lib/types';

const METHODS: PaymentMethod[] = ['cash', 'telebirr', 'bank', 'other'];

export function RenewModal({ memberId, onClose }: { memberId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await api.get<Plan[]>('/plans')).data.filter((p) => p.active),
  });

  const [planId, setPlanId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState('');

  const selected = plans.find((p) => p.id === planId);

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await api.post(`/members/${memberId}/renew`, {
          plan_id: planId,
          amount: amount === '' ? undefined : Number(amount),
          method,
          note: note || undefined,
        })
      ).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      void queryClient.invalidateQueries({ queryKey: ['members'] });
      onClose();
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (planId !== '') mutation.mutate();
  }

  return (
    <Modal title={t('members.renew')} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {mutation.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorMessage(mutation.error)}</p>
        )}
        <div>
          <label className="label">{t('enroll.plan')}</label>
          <select
            className="input"
            value={planId}
            onChange={(e) => setPlanId(e.target.value === '' ? '' : Number(e.target.value))}
            required
          >
            <option value="">—</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.duration_days} {t('common.days')} · {Number(p.price)} {t('common.birr')}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('enroll.amount')}</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder={selected ? String(Number(selected.price)) : ''}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="label">{t('enroll.method')}</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">{t('enroll.note')}</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn-primary" disabled={mutation.isPending || planId === ''}>
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
