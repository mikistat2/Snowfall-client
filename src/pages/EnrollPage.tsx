import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { FaceCapture, type Capture } from '../components/members/FaceCapture';
import { MemberPhotoPicker, type PhotoValue } from '../components/members/MemberPhotoPicker';
import { renditionsFromDataUrl } from '../lib/photo';
import { setMemberPhoto } from '../api/members';
import { EnrollShell, FormSection } from '../components/members/EnrollShell';
import { PhoneInput } from '../components/ui/PhoneInput';
import { FeatureLockBanner } from '../components/ui/FeatureLockBanner';
import { WarningIcon } from '../components/ui/icons';
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
  const [photo, setPhoto] = useState<PhotoValue>(null);

  const selectedPlan = plans.find((p) => p.id === planId);
  const capturesNeeded = cameraEnabled && captures.length < 3;
  /**
   * The amount is required now, so it is filled in from the plan the moment one
   * is picked rather than left blank with the price as grey placeholder text.
   *
   * That distinction was the whole problem: a blank field used to fall back to
   * the list price server-side, so a member who paid a discounted 1,800 was
   * recorded at 2,500 whenever the clerk tabbed past the box. Pre-filling keeps
   * the common case one keystroke long while making the number an explicit
   * statement rather than an assumption.
   */
  function onPlanChange(id: number | ''): void {
    setPlanId(id);
    const plan = plans.find((p) => p.id === id);
    if (plan) setAmount(String(Number(plan.price)));
  }

  const amountMissing = amount.trim() === '';
  const incomplete = planId === '' || amountMissing || capturesNeeded;

  /**
   * Whether the form has been submitted at least once.
   *
   * Validation messages and red borders only appear after this flips. Marking a
   * field as wrong before it has been reached tells someone off for not yet
   * having done something they were in the middle of doing.
   */
  const [attempted, setAttempted] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  /** The first unmet requirement, in the order they appear on the form. */
  const blocker = planId === '' ? 'plan' : amountMissing ? 'amount' : capturesNeeded ? 'captures' : null;
  const blockerText =
    blocker === 'plan'
      ? t('enroll.needPlan')
      : blocker === 'amount'
        ? t('enroll.needAmount')
        : blocker === 'captures'
          ? t('enroll.needMore')
          : '';

  const mutation = useEnrollMember();

  /**
   * Stores the new member's picture, if there is one to store.
   *
   * Runs after the member exists, because the upload endpoint addresses a
   * member id — and deliberately best-effort: a failed photo must not undo a
   * completed enrollment and a taken payment. The member lands on their detail
   * page either way, where the picture can be added in one click.
   *
   * A picture a staff member picked is 'manual'; the frame lifted off the face
   * capture is 'auto', which the server will never let overwrite a manual one.
   */
  async function uploadPhoto(memberId: number): Promise<void> {
    const capture = captures[0]?.thumbnail;
    try {
      if (photo && typeof photo === 'object') {
        await setMemberPhoto(memberId, { thumb: photo.thumb, full: photo.full }, 'manual');
      } else if (capture) {
        const auto = await renditionsFromDataUrl(capture);
        await setMemberPhoto(memberId, { thumb: auto.thumb, full: auto.full }, 'auto');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[enroll] photo upload failed', err);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (incomplete) {
      // The submit button stays enabled precisely so this can happen. A greyed
      // out button says "no" without saying why, and staff at a busy desk read
      // that as the app being broken — so the click is accepted and answered
      // with the reason, next to the field that caused it.
      if (blocker === 'amount') {
        amountRef.current?.focus();
        amountRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }
    mutation.mutate(
      {
        member: {
          full_name: fullName,
          phone: phone || undefined,
          sex: sex || undefined,
        },
        descriptors: captures.map((c) => c.descriptor),
        plan_id: planId,
        // Always a number: `incomplete` blocks submit while the field is empty.
        payment: { amount: Number(amount), method },
      },
      {
        onSuccess: async (member) => {
          await uploadPhoto(member.id);
          navigate(`/members/${member.id}`);
        },
      },
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
                  {/* Marked required in the label, not only discovered on
                      submit — the asterisk is the cheapest possible warning. */}
                  <span className="ml-0.5 text-danger" aria-hidden>
                    *
                  </span>
                </label>
                {/*
                  No `required` attribute on purpose. It would fire the
                  browser's own validation bubble before onSubmit ever runs,
                  pre-empting the styled message below — and native bubbles are
                  written in the browser's language, not the app's, so an
                  Amharic user would get an English popup. The field is still
                  required: enforced here, and again by the API schema.
                */}
                <input
                  ref={amountRef}
                  className={`input ${attempted && amountMissing ? 'input-error' : ''}`}
                  type="number"
                  min="0"
                  placeholder={selectedPlan ? String(Number(selectedPlan.price)) : ''}
                  aria-required
                  aria-invalid={attempted && amountMissing}
                  aria-describedby={attempted && amountMissing ? 'enroll-amount-error' : undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {attempted && amountMissing && (
                  <p id="enroll-amount-error" className="mt-1.5 text-xs font-medium text-danger">
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
          </FormSection>
        </div>

        <div className="space-y-4">
          {/*
            Offered only when there is no face capture to lift a picture from.
            A camera gym gets its photo automatically from the first capture,
            so asking for a second one here would be busywork at the desk —
            and it can still be replaced later from the member's page.
          */}
          {!cameraEnabled && (
            <FormSection step={3} title={t('photo.title')}>
              <MemberPhotoPicker currentUrl={null} value={photo} onChange={setPhoto} />
            </FormSection>
          )}
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
            {/*
              Two states for the same sentence. Before the first submit it is a
              quiet checklist of what is still outstanding; after a blocked
              submit it is an alert answering the click that just happened.
            */}
            {incomplete &&
              (attempted ? (
                <p className="alert-error flex items-start gap-2" role="alert">
                  <WarningIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="leading-relaxed">{blockerText}</span>
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-fg-muted">{blockerText}</p>
              ))}
            {/*
              Deliberately NOT disabled while the form is incomplete: a dead
              button gives no reason, and the click is what triggers the message
              above and moves the cursor to the field at fault.
            */}
            <button className="btn-primary w-full" disabled={mutation.isPending}>
              {mutation.isPending ? `${t('enroll.submit')}…` : t('enroll.submit')}
            </button>
          </div>
        </div>
      </form>
    </EnrollShell>
  );
}
