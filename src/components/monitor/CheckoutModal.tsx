import { Modal } from '../ui/Modal';
import { t } from '../../i18n/strings';
import { useCheckOut, useOpenCheckIns } from '../../hooks/queries/useCheckIns';

export function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { data: open = [] } = useOpenCheckIns();
  const mutation = useCheckOut();

  return (
    <Modal title={t('monitor.checkOut')} onClose={onClose}>
      <div className="space-y-2">
        {open.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
            <div>
              <p className="text-sm font-medium">{c.member_name ?? c.guest_name ?? '—'}</p>
              <p className="text-xs text-slate-400">
                {new Date(c.checked_in_at).toLocaleTimeString()}
              </p>
            </div>
            <button
              className="btn-secondary !py-1 text-xs"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(c.id)}
            >
              {t('monitor.checkOut')}
            </button>
          </div>
        ))}
        {open.length === 0 && <p className="text-sm text-slate-400">{t('monitor.noneInside')}</p>}
      </div>
    </Modal>
  );
}
