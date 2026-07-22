import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { FaceCapture, type Capture } from '../components/members/FaceCapture';
import { PhoneInput } from '../components/ui/PhoneInput';
import type { Gym, Member, PaymentMethod, Plan } from '../lib/types';

const METHODS: PaymentMethod[] = ['cash', 'telebirr', 'bank', 'other'];

export function EnrollPage() {
  const navigate = useNavigate();
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await api.get<Plan[]>('/plans')).data.filter((p) => p.active),
  });
  const { data: gym } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<Gym>('/settings')).data,
  });
  // no camera at this gym → members are registered without face captures
  const cameraEnabled = gym?.settings.camera_enabled ?? true;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [planId, setPlanId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [captures, setCaptures] = useState<Capture[]>([]);

  const selectedPlan = plans.find((p) => p.id === planId);

  const mutation = useMutation({
    mutationFn: async () =>
      (
        await api.post<Member>('/members', {
          member: {
            full_name: fullName,
            phone: phone || undefined,
            sex: sex || undefined,
            photo_url: captures[0]?.thumbnail ?? null,
          },
          descriptors: captures.map((c) => c.descriptor),
          plan_id: planId,
          payment: { amount: amount === '' ? undefined : Number(amount), method },
        })
      ).data,
    onSuccess: (member) => navigate(`/members/${member.id}`),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (planId === '' || (cameraEnabled && captures.length < 3)) return;
    mutation.mutate();
  }

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">{t('enroll.title')}</h1>
      {mutation.isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorMessage(mutation.error)}</p>
      )}
      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="font-semibold">{t('enroll.details')}</h2>
          <div>
            <label className="label">{t('members.fullName')}</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('auth.phone')}</label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <div>
              <label className="label">{t('members.sex')}</label>
              <select className="input" value={sex} onChange={(e) => setSex(e.target.value as typeof sex)}>
                <option value="">—</option>
                <option value="male">{t('members.male')}</option>
                <option value="female">{t('members.female')}</option>
              </select>
            </div>
          </div>
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
          <h2 className="pt-2 font-semibold">{t('enroll.payment')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('enroll.amount')}</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder={selectedPlan ? String(Number(selectedPlan.price)) : ''}
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
          <button
            className="btn-primary w-full"
            disabled={mutation.isPending || planId === '' || (cameraEnabled && captures.length < 3)}
          >
            {t('enroll.submit')}
          </button>
        </div>

        {cameraEnabled ? (
          <div className="card">
            <h2 className="mb-3 font-semibold">{t('enroll.captures')}</h2>
            <FaceCapture captures={captures} onChange={setCaptures} />
          </div>
        ) : (
          <div className="card flex items-center justify-center">
            <p className="max-w-xs text-center text-sm text-slate-500">📷 {t('enroll.noCamera')}</p>
          </div>
        )}
      </form>
    </div>
  );
}
