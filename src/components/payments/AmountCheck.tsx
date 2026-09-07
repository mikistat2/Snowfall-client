import { t } from '../../i18n/strings';
import { WarningIcon } from '../ui/icons';
import { overpayNeedsConfirming } from '../../lib/payments';

/**
 * The typo guard on a payment amount, shared by enrolment and renewal so the
 * two can never disagree about what counts as suspicious.
 *
 * It appears as soon as the number is wrong rather than on submit: catching it
 * while the cursor is still in the field is the whole point, and a warning that
 * waits for the button has already let the clerk move on.
 *
 * Confirmation is an explicit button, not a second click on Save. A repeated
 * click is exactly what a rushed desk produces, and it would sail straight
 * through a click-twice guard.
 *
 * Renders nothing when the amount is fine or already confirmed, so callers can
 * drop it in unconditionally.
 */
export function AmountCheck({
  amount,
  planPrice,
  confirmed,
  onConfirm,
}: {
  amount: number;
  planPrice?: number;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  if (confirmed || !overpayNeedsConfirming(amount, planPrice)) return null;

  const price = planPrice as number;
  return (
    <div className="alert-error mt-2 flex items-start gap-2" role="alert">
      <WarningIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 space-y-1.5 leading-relaxed">
        <p className="font-semibold">{t('payments.checkAmount')}</p>
        {/* The arithmetic spelled out. "That looks high" is arguable; the three
            numbers side by side are not, and they are what makes a doubled
            block of digits obvious at a glance. */}
        <p className="text-xs">
          {amount.toLocaleString()} {t('common.birr')} · {t('payments.planPrice')}{' '}
          {price.toLocaleString()} {t('common.birr')} · {(amount - price).toLocaleString()}{' '}
          {t('common.birr')} {t('payments.overBy')}
        </p>
        <p className="text-xs">{t('payments.checkAmountBody')}</p>
        <button type="button" className="btn-secondary !px-3 !py-1 !text-xs" onClick={onConfirm}>
          {t('payments.amountIsCorrect')}
        </button>
      </div>
    </div>
  );
}
