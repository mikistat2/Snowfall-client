import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { t } from '../../i18n/strings';
import type { CheckIn } from '../../lib/types';

export function CheckoutModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: open = [] } = useQuery({
    queryKey: ['check-ins-open'],
    queryFn: async () => (await api.get<CheckIn[]>('/check-ins/open')).data,
  });

  const mutation = useMutation({
    mutationFn: async (id: number) => api.post(`/check-ins/${id}/checkout`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['check-ins-open'] }),
  });

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
