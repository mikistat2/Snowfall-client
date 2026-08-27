import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { FaceCapture, type Capture } from '../components/members/FaceCapture';
import { EnrollShell, FormSection } from '../components/members/EnrollShell';
import { PhoneInput } from '../components/ui/PhoneInput';
import { FeatureLockBanner } from '../components/ui/FeatureLockBanner';
import { Select } from '../components/ui/Select';
import { SexPicker } from '../components/members/SexPicker';
import { paymentMethodOptions } from '../lib/payments';
import { useActivePlans } from '../hooks/queries/usePlans';
import { useGymSettings } from '../hooks/queries/useSettings';
import { useEnrollMember } from '../hooks/queries/useMembers';
import { useFeatureLocks } from '../hooks/useFeatureState';
import type { PaymentMethod } from '../lib/types';

export function EnrollPage() {
  const navigate = useNavigate();
  const { data: plans = [] } = useActivePlans();
  const { data: gym } = useGymSettings();
  // no camera at this gym → members are registered without face captures
  const cameraEnabled = gym?.settings.camera_enabled ?? true;
  // ...and *why*: the owner's own choice reads differently from a platform lock.
  const { camera: cameraAllowed } = useFeatureLocks();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [planId, setPlanId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [captures, setCaptures] = useState<Capture[]>([]);

  const selectedPlan = plans.find((p) => p.id === planId);
  const capturesNeeded = cameraEnabled && captures.length < 3;
  const incomplete = planId === '' || capturesNeeded;

  const mutation = useEnrollMember();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (incomplete) return;
    mutation.mutate(
      {
        member: {
          full_name: fullName,
          phone: phone || undefined,
          sex: sex || undefined,
          photo_url: captures[0]?.thumbnail ?? null,
        },
        descriptors: captures.map((c) => c.descriptor),
        plan_id: planId,
        payment: { amount: amount === '' ? undefined : Number(amount), method },
      },
      { onSuccess: (member) => navigate(`/members/${member.id}`) },
    );
  }

  return (
    <EnrollShell title={t('enroll.title')} subtitle={t('enroll.subtitle')}>
      {/* The face-capture step simply disappears when the camera is off. Staff
          enrolling their first member since the revocation deserve to know it
          was taken away rather than assume they broke something. */}
      <FeatureLockBanner
        feature="camera"
        what="Members are enrolled without a face scan — everything else works as normal."
        className="mb-4"
      />
      {mutation.isError && <p className="alert-error mb-4">{apiErrorMessage(mutation.error)}</p>}

      <form onSubmit={onSubmit} className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <FormSection step={1} title={t('enroll.details')}>
            <div className="field">
              <label className="label">{t('members.fullName')}</label>
              <input
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
                placeholder={t('enroll.namePlaceholder')}
              />
            </div>
            {/* The phone field carries a country selector inside it, so it owns a
                full row — pairing it with anything squeezed both to unusable
                widths on a phone. */}
            <div className="field">
              <label className="label">{t('auth.phone')}</label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <div className="field">
              <label className="label">{t('members.sex')}</label>
              <SexPicker value={sex} onChange={setSex} />
            </div>
          </FormSection>

          <FormSection step={2} title={t('enroll.payment')} hint={t('enroll.paymentHint')}>
            <div className="field">
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
                  placeholder={selectedPlan ? String(Number(selectedPlan.price)) : ''}
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
          </FormSection>
        </div>

        <div className="space-y-4">
          {cameraEnabled ? (
            <FormSection step={3} title={t('enroll.captures')}>
              <FaceCapture captures={captures} onChange={setCaptures} />
            </FormSection>
          ) : (
            <section className="card flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {cameraAllowed ? '📷' : '🔒'}
              </span>
              {/* The stock copy ends "you can enable the camera later in
                  Settings", which is a lie once the platform is the one
                  holding it shut — the owner's toggle is locked. */}
              <p className="text-sm leading-relaxed text-fg-muted">
                {cameraAllowed
                  ? t('enroll.noCamera')
                  : 'Face recognition is turned off for this gym by the platform administrator, so this member is registered without face captures. Their face can be added later if it is switched back on.'}
              </p>
            </section>
          )}

          {/* The submit sits with the last step rather than under the first
              column, so on a phone it is the end of the sequence and on a wide
              screen it is still the last thing the eye reaches. */}
          <div className="card space-y-3">
            {incomplete && (
              <p className="text-xs leading-relaxed text-fg-muted">
                {planId === '' ? t('enroll.needPlan') : t('enroll.needMore')}
              </p>
            )}
            <button className="btn-primary w-full" disabled={mutation.isPending || incomplete}>
              {mutation.isPending ? `${t('enroll.submit')}…` : t('enroll.submit')}
            </button>
          </div>
        </div>
      </form>
    </EnrollShell>
  );
}
