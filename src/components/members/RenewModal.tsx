import { useRef, useState, type FormEvent } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { t } from '../../i18n/strings';
import { Select } from '../ui/Select';
import { WarningIcon } from '../ui/icons';
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

  /**
   * Picking a plan fills in its price, which the clerk then confirms or edits.
   *
   * The amount is required on renewals now. It used to be optional and fall
   * back to the plan's list price, so a renewal taken at a discount was
   * recorded at full price whenever the box was left alone — and payments are
   * immutable, so that number could never be corrected afterwards.
   */
  function onPlanChange(id: number | ''): void {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (plan) setAmount(String(Number(plan.price)));
  }

  const amountMissing = amount.trim() === '';
  const incomplete = planId === '' || amountMissing;

  /** Validation only shows after a blocked submit — see EnrollPage. */
  const [attempted, setAttempted] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const blockerText = planId === '' ? t('enroll.needPlan') : amountMissing ? t('enroll.needAmount') : '';

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (incomplete) {
      // Save stays clickable so this message has something to answer. Before
      // this, an incomplete renewal just greyed the button out and said
      // nothing at all.
      if (planId !== '' && amountMissing) amountRef.current?.focus();
      return;
    }
    mutation.mutate(
      {
        plan_id: planId,
        amount: Number(amount),
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
            onChange={onPlanChange}
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
            <label className="label">
              {t('enroll.amount')}
              <span className="ml-0.5 text-danger" aria-hidden>
                *
              </span>
            </label>
            {/* No `required`: it would pre-empt the styled message with the
                browser's own untranslated bubble. See EnrollPage. */}
            <input
              ref={amountRef}
              className={`input ${attempted && amountMissing ? 'input-error' : ''}`}
              type="number"
              min="0"
              placeholder={selected ? String(Number(selected.price)) : ''}
              aria-required
              aria-invalid={attempted && amountMissing}
              aria-describedby={attempted && amountMissing ? 'renew-amount-error' : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {attempted && amountMissing && (
              <p id="renew-amount-error" className="mt-1.5 text-xs font-medium text-danger">
                {t('enroll.needAmount')}
              </p>
            )}
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
        {attempted && incomplete && (
          <p className="alert-error flex items-start gap-2" role="alert">
            <WarningIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="leading-relaxed">{blockerText}</span>
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn-primary" disabled={mutation.isPending}>
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
