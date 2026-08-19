import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { t } from '../../i18n/strings';
import { Select } from '../ui/Select';
import { paymentMethodOptions } from '../../lib/payments';
import { useActivePlans } from '../../hooks/queries/usePlans';
import { useRenewMember } from '../../hooks/queries/useMembers';
import type { PaymentMethod } from '../../lib/types';


export function RenewModal({ memberId, onClose }: { memberId: number; onClose: () => void }) {
  const { data: plans = [] } = useActivePlans();

  const [planId, setPlanId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState('');

  const selected = plans.find((p) => p.id === planId);

  const mutation = useRenewMember(memberId);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (planId === '') return;
    mutation.mutate(
      {
        plan_id: planId,
        amount: amount === '' ? undefined : Number(amount),
        method,
        note: note || undefined,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal title={t('members.renew')} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {mutation.isError && (
          <p className="rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-700 dark:text-red-300">{apiErrorMessage(mutation.error)}</p>
        )}
        <div>
          <label className="label">{t('enroll.plan')}</label>
          <Select
            value={planId}
            onChange={setPlanId}
            label={t('enroll.plan')}
            options={plans.map((p) => ({
              value: p.id,
              label: p.name,
              hint: `${p.duration_days} ${t('common.days')} · ${Number(p.price)} ${t('common.birr')}`,
            }))}
          />
        </div>
        <div className="field-row">
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
            <Select
              value={method}
              onChange={setMethod}
              label={t('enroll.method')}
              options={paymentMethodOptions()}
            />
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
