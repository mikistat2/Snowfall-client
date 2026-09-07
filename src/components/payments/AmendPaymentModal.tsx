import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { t } from '../../i18n/strings';
import { Select } from '../ui/Select';
import { WarningIcon } from '../ui/icons';
import { Spinner } from '../ui/Spinner';
import { paymentMethodOptions, paymentMethodLabel } from '../../lib/payments';
import { useAmendPayment } from '../../hooks/queries/usePayments';
import type { Payment, PaymentMethod } from '../../lib/types';

/**
 * The owner's remedy for a payment written down wrong.
 *
 * Framed as a correction rather than an edit, because that is what the server
 * does: the wrong row is struck through and kept, and a replacement is
 * appended beside it. The copy says so plainly — an owner who believes they
 * are erasing evidence will be surprised later, and this screen is the only
 * place to tell them.
 *
 * Two shapes, one dialog. Usually the amount is wrong and a replacement takes
 * its place; sometimes the payment should never have been recorded at all, and
 * nothing replaces it. Splitting these into two buttons on the ledger would
 * put a destructive action one careless tap from an ordinary one.
 */
export function AmendPaymentModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const [mode, setMode] = useState<'fix' | 'remove'>('fix');
  const [amount, setAmount] = useState(String(Number(payment.amount)));
  const [method, setMethod] = useState<PaymentMethod>(payment.method);
  const [note, setNote] = useState(payment.note ?? '');
  const [reason, setReason] = useState('');
  const [attempted, setAttempted] = useState(false);

  const mutation = useAmendPayment();

  const amountMissing = mode === 'fix' && amount.trim() === '';
  const reasonMissing = reason.trim() === '';
  const incomplete = amountMissing || reasonMissing;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (incomplete) return;
    mutation.mutate(
      {
        id: payment.id,
        input: {
          reason: reason.trim(),
          // Absent means "void with nothing in its place" — the server reads
          // it exactly that way, so there is no separate delete endpoint to
          // keep in step with this one.
          replacement:
            mode === 'fix'
              ? { amount: Number(amount), method, note: note.trim() || null }
              : undefined,
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal title={t('payments.correct')} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {mutation.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {apiErrorMessage(mutation.error)}
          </p>
        )}

        {/* What is being corrected, spelled out. The ledger row is behind a
            dialog by now, and a correction applied to the wrong payment is a
            worse error than the one being fixed. */}
        <div className="rounded-xl bg-surface-2 px-3 py-2 text-sm">
          <div className="font-semibold">{payment.member_name}</div>
          <div className="text-fg-muted">
            {Number(payment.amount).toLocaleString()} {t('common.birr')} ·{' '}
            {paymentMethodLabel(payment.method)} · {new Date(payment.created_at).toLocaleString()}
          </div>
          {payment.marked_by_name && (
            <div className="text-xs text-fg-subtle">
              {t('payments.markedBy')}: {payment.marked_by_name}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('fix')}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              mode === 'fix' ? 'bg-slate-900 text-white dark:bg-sky-600' : 'bg-surface-2 text-fg-muted'
            }`}
          >
            {t('payments.fixDetails')}
          </button>
          <button
            type="button"
            onClick={() => setMode('remove')}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              mode === 'remove' ? 'bg-red-600 text-white' : 'bg-surface-2 text-fg-muted'
            }`}
          >
            {t('payments.removeEntirely')}
          </button>
        </div>

        {mode === 'fix' && (
          <>
            <div className="field-row">
              <div>
                <label className="label">{t('enroll.amount')}</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {attempted && amountMissing && (
                  <p className="mt-1 text-xs text-red-600">{t('enroll.needAmount')}</p>
                )}
              </div>
              <div>
                <label className="label">{t('payments.method')}</label>
                <Select
                  value={method}
                  onChange={(v) => setMethod(v as PaymentMethod)}
                  label={t('payments.method')}
                  options={paymentMethodOptions()}
                />
              </div>
            </div>
            <div>
              <label className="label">{t('enroll.note')}</label>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </>
        )}

        <div>
          <label className="label">{t('payments.reason')}</label>
          <textarea
            className="input min-h-[60px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('payments.reasonHint')}
          />
          {attempted && reasonMissing && (
            <p className="mt-1 text-xs text-red-600">{t('payments.needReason')}</p>
          )}
        </div>

        {/* Both facts an owner is likely to get wrong about this action, said
            before they take it rather than discovered afterwards. */}
        <div className="flex gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-fg-muted">
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {t('payments.keepsRecord')} {t('payments.expiryUnchanged')}
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 ${
              mode === 'remove' ? 'btn-danger' : 'btn-primary'
            }`}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Spinner className="h-4 w-4" label={t('common.saving')} />}
            {mutation.isPending
              ? t('common.saving')
              : mode === 'remove'
                ? t('payments.removePayment')
                : t('payments.saveCorrection')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
