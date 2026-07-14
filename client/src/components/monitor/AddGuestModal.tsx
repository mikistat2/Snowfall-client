import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { t } from '../../i18n/strings';
import { FaceCapture, type Capture } from '../members/FaceCapture';

/** Day-pass guest: name + one face capture; pass ends tonight (or +N days). */
export function AddGuestModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [validDays, setValidDays] = useState(0);
  const [captures, setCaptures] = useState<Capture[]>([]);

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await api.post('/guests', {
          name,
          descriptor: captures[0]?.descriptor ?? null,
          valid_days: validDays,
        })
      ).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guest-descriptors'] });
      onClose();
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (captures.length >= 1) mutation.mutate();
  }

  return (
    <Modal title={t('monitor.addGuest')} onClose={onClose} wide>
      <form onSubmit={onSubmit} className="space-y-4">
        {mutation.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorMessage(mutation.error)}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('members.name')}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div>
            <label className="label">{t('guests.validity')}</label>
            <select className="input" value={validDays} onChange={(e) => setValidDays(Number(e.target.value))}>
              <option value={0}>{t('guests.today')}</option>
              <option value={1}>+1 {t('common.days')}</option>
              <option value={3}>+3 {t('common.days')}</option>
              <option value={7}>+7 {t('common.days')}</option>
            </select>
          </div>
        </div>
        <FaceCapture captures={captures} onChange={setCaptures} min={1} max={2} hint={t('guests.captureHint')} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn-primary" disabled={mutation.isPending || captures.length < 1 || name.length < 2}>
            {t('guests.create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
