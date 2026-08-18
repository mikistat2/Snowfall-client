import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { apiErrorMessage } from '../../lib/api';
import { t } from '../../i18n/strings';
import { useDeleteMember, useSetMemberArchived } from '../../hooks/queries/useMembers';

interface Props {
  memberId: number;
  memberName: string;
  /** Drives the whole dialog: any payment at all rules out permanent deletion. */
  paymentCount: number;
  archived: boolean;
  onClose: () => void;
}

/**
 * Removing a member.
 *
 * Two different actions wearing one button, because the safe one depends on
 * facts the person clicking should not have to remember. `payments` is an
 * immutable audit trail, so a member who has ever paid can only be archived —
 * deleting them would quietly rewrite past income. A member with no payments is
 * almost always a duplicate or a typo from back-filling the paper register, and
 * deleting those outright is what keeps the list clean.
 */
export function RemoveMemberModal({ memberId, memberName, paymentCount, archived, onClose }: Props) {
  const navigate = useNavigate();
  const archiveMutation = useSetMemberArchived(memberId);
  const deleteMutation = useDeleteMember(memberId);

  const deletable = paymentCount === 0;
  const busy = archiveMutation.isPending || deleteMutation.isPending;
  const error = archiveMutation.error ?? deleteMutation.error;

  return (
    <Modal title={archived ? t('remove.restoreTitle') : t('remove.title')} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm font-medium text-fg">{memberName}</p>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {apiErrorMessage(error)}
          </p>
        )}

        {archived ? (
          <>
            <p className="text-sm text-fg-muted">{t('remove.restoreWhat')}</p>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={onClose} disabled={busy}>
                {t('common.cancel')}
              </button>
              <button
                className="btn-primary"
                disabled={busy}
                onClick={() => archiveMutation.mutate(false, { onSuccess: onClose })}
              >
                {t('members.restore')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-fg-muted">{t('remove.archiveWhat')}</p>
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                deletable
                  ? 'bg-surface-2 text-fg-muted'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              {deletable ? t('remove.noPayments') : t('remove.hasPayments')}
            </p>

            <div className="flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" onClick={onClose} disabled={busy}>
                {t('common.cancel')}
              </button>
              {deletable && (
                <button
                  className="btn-danger"
                  disabled={busy}
                  onClick={() =>
                    // the member page it was opened from no longer exists
                    deleteMutation.mutate(undefined, { onSuccess: () => navigate('/members', { replace: true }) })
                  }
                >
                  {t('remove.delete')}
                </button>
              )}
              <button
                className="btn-primary"
                disabled={busy}
                onClick={() => archiveMutation.mutate(true, { onSuccess: onClose })}
              >
                {t('remove.archive')}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
