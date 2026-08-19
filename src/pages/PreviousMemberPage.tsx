import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import { FaceCapture, type Capture } from '../components/members/FaceCapture';
import { PhoneInput } from '../components/ui/PhoneInput';
import { Select } from '../components/ui/Select';
import { EnrollShell, FormSection } from '../components/members/EnrollShell';
import { SexPicker } from '../components/members/SexPicker';
import { paymentMethodOptions } from '../lib/payments';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CalendarDateInput, type CalendarSystem } from '../components/ui/CalendarDateInput';
import { useActivePlans } from '../hooks/queries/usePlans';
import { useGymSettings } from '../hooks/queries/useSettings';
import { useEnrollPreviousMember } from '../hooks/queries/useMembers';
import { addDaysIso, todayIso } from '../lib/ethiopian';
import { daysLeft, deriveStatus } from '../lib/expiry';
import type { Member, MemberStatus, PaymentMethod } from '../lib/types';


/**
 * Back-filling the paper register.
 *
 * A gym that installs this system already has members: names in a notebook,
 * each with the date they registered — usually in the Ethiopian calendar, and
 * sometimes not. This page takes that row as written and lets the system work
 * out the rest, so a membership that ran out two months ago arrives already
 * marked expired instead of looking brand new.
 *
 * It is built for repetition: a save keeps the plan and the calendar setting and
 * clears only the member, because the next line of the notebook follows straight
 * after this one.
 */
export function PreviousMemberPage() {
  const { data: plans = [] } = useActivePlans();
  const { data: gym } = useGymSettings();
  const cameraEnabled = gym?.settings.camera_enabled ?? true;

  // The notebook is far more often in Ethiopian dates than Gregorian ones.
  const [paperCalendar, setPaperCalendar] = useState<CalendarSystem>('ethiopian');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [planId, setPlanId] = useState<number | ''>('');
  const [joinedAt, setJoinedAt] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [customExpiry, setCustomExpiry] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [recordPayment, setRecordPayment] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [added, setAdded] = useState<{ id: number; name: string; status: MemberStatus }[]>([]);

  const mutation = useEnrollPreviousMember();
  const today = todayIso();
  const selectedPlan = plans.find((p) => p.id === planId);

  // Expiry follows the plan unless it is overridden: most notebooks record when
  // someone paid, not when their membership runs out.
  const planExpiry = startsAt && selectedPlan ? addDaysIso(startsAt, selectedPlan.duration_days) : '';
  const effectiveExpiry = customExpiry ? expiresAt : planExpiry;

  const remaining = effectiveExpiry ? daysLeft(effectiveExpiry) : null;
  const previewStatus =
    gym && remaining !== null ? deriveStatus(remaining, gym.settings) : null;

  /** The start date trails the registration date until someone edits it apart. */
  function onJoinedChange(value: string): void {
    setStartsAt((prev) => (prev === '' || prev === joinedAt ? value : prev));
    setJoinedAt(value);
  }

  function onCustomExpiryChange(on: boolean): void {
    setCustomExpiry(on);
    if (on && !expiresAt) setExpiresAt(planExpiry);
  }

  const error =
    !fullName || fullName.trim().length < 2 || planId === '' || !joinedAt || !startsAt
      ? t('prev.errRequired')
      : joinedAt > today
        ? t('prev.errJoinedFuture')
        : startsAt < joinedAt
          ? t('prev.errStartBeforeJoin')
          : !effectiveExpiry
            ? t('prev.errExpiryMissing')
            : effectiveExpiry < startsAt
              ? t('prev.errExpiryBeforeStart')
              : captures.length > 0 && captures.length < 3
                ? t('prev.errCaptures')
                : '';

  function resetForNext(member: Member): void {
    setAdded((prev) => [{ id: member.id, name: member.full_name, status: member.status }, ...prev].slice(0, 8));
    setFullName('');
    setPhone('');
    setSex('');
    setJoinedAt('');
    setStartsAt('');
    setCustomExpiry(false);
    setExpiresAt('');
    setAmount('');
    setCaptures([]);
    // plan, calendar and payment method stay — the next notebook line usually
    // shares all three
  }

  function onSubmit(e: FormEvent): void {
    e.preventDefault();
    if (error || planId === '') return;
    mutation.mutate(
      {
        member: {
          full_name: fullName.trim(),
          phone: phone || undefined,
          sex: sex || undefined,
          photo_url: captures[0]?.thumbnail ?? null,
        },
        descriptors: captures.map((c) => c.descriptor),
        plan_id: planId,
        // CalendarDateInput has already turned whatever was typed into a
        // Gregorian date, so that is what the wire says — converting again
        // server-side would push an Ethiopian year ~8 years into the future.
        // paperCalendar rides along only so the audit log remembers which
        // calendar the clerk was reading from.
        calendar: 'gregorian',
        entered_calendar: paperCalendar,
        joined_at: joinedAt,
        starts_at: startsAt,
        expires_at: customExpiry ? expiresAt : undefined,
        payment: recordPayment ? { amount: amount === '' ? undefined : Number(amount), method } : undefined,
      },
      { onSuccess: resetForNext },
    );
  }

  return (
    <EnrollShell title={t('prev.title')} subtitle={t('prev.intro')}>
      {mutation.isError && <p className="alert-error mb-4">{apiErrorMessage(mutation.error)}</p>}

      {added.length > 0 && (
        <div className="alert-success mb-4">
          <p className="font-semibold">
            {added.length} {t('prev.addedThisSession')}
          </p>
          <ul className="mt-1.5 space-y-1">
            {added.map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                <Link to={`/members/${m.id}`} className="underline underline-offset-2 hover:no-underline">
                  {m.name}
                </Link>
                <StatusBadge status={m.status} dot />
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <FormSection step={1} title={t('enroll.details')}>
          <div>
            <label className="label">{t('members.fullName')}</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} />
          </div>
          {/* Phone owns its row — it already contains a country selector. */}
          <div className="field">
            <label className="label">{t('auth.phone')}</label>
            <PhoneInput value={phone} onChange={setPhone} />
          </div>
          <div className="field">
            <label className="label">{t('members.sex')}</label>
            <SexPicker value={sex} onChange={setSex} />
          </div>
          <div>
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

          </FormSection>

          <FormSection step={2} title={t('prev.payment')}>
          <label className="flex items-start gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={recordPayment}
              onChange={(e) => setRecordPayment(e.target.checked)}
            />
            <span>
              {t('prev.recordPayment')}
              <span className="block text-xs text-fg-subtle">{t('prev.paymentHint')}</span>
            </span>
          </label>
          {recordPayment && (
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
          )}
          </FormSection>
        </div>

        <div className="space-y-4">
          <FormSection step={3} title={t('prev.dates')}>
            <div>
              <label className="label">{t('prev.calendar')}</label>
              {/* One exclusive choice of two — a segmented control, not a pair
                  of buttons where the unselected one still looks clickable in
                  its own right. */}
              <div role="radiogroup" aria-label={t('prev.calendar')} className="segmented grid-cols-2">
                {(['ethiopian', 'gregorian'] as const).map((system) => (
                  <button
                    key={system}
                    type="button"
                    role="radio"
                    aria-checked={paperCalendar === system}
                    onClick={() => setPaperCalendar(system)}
                    className="segmented-item"
                  >
                    {t(system === 'ethiopian' ? 'prev.calendarEthiopian' : 'prev.calendarGregorian')}
                  </button>
                ))}
              </div>
            </div>

            <CalendarDateInput
              label={t('prev.joinedAt')}
              calendar={paperCalendar}
              value={joinedAt}
              onChange={onJoinedChange}
              max={today}
              required
            />
            <CalendarDateInput
              label={t('prev.startsAt')}
              calendar={paperCalendar}
              value={startsAt}
              onChange={setStartsAt}
              min={joinedAt || undefined}
              hint={t('prev.startsAtHint')}
              required
            />

            <label className="flex items-center gap-2 text-sm text-fg-muted">
              <input type="checkbox" checked={customExpiry} onChange={(e) => onCustomExpiryChange(e.target.checked)} />
              {t('prev.customExpiry')}
            </label>
            {customExpiry ? (
              <CalendarDateInput
                label={t('prev.expiresAt')}
                calendar={paperCalendar}
                value={expiresAt}
                onChange={setExpiresAt}
                min={startsAt || undefined}
                required
              />
            ) : (
              <p className="text-xs text-fg-subtle">{t('prev.expiryFromPlan')}</p>
            )}
          </FormSection>

          {/* What the record will look like once saved — the whole point of the
              page is that the system, not the person typing, decides this. */}
          <div className="card space-y-2 border-accent/25 bg-accent/[0.06]">
            <h2 className="text-[15px] font-semibold text-fg">{t('prev.preview')}</h2>
            {effectiveExpiry && previewStatus && remaining !== null ? (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-fg-muted">{t('members.expires')}:</span>
                  <span className="font-semibold tabular-nums">{effectiveExpiry}</span>
                  <StatusBadge status={previewStatus} dot />
                </div>
                <p className="text-sm text-fg-muted">
                  {remaining >= 0
                    ? `${remaining} ${t('prev.daysLeft')}`
                    : `${-remaining} ${t('prev.daysOverdue')}`}
                </p>
                {remaining < 0 && <p className="text-xs text-fg-subtle">{t('prev.expiredHint')}</p>}
              </>
            ) : (
              <p className="text-sm text-fg-subtle">{t('prev.previewEmpty')}</p>
            )}
          </div>

          {cameraEnabled && (
            <FormSection step={4} title={t('prev.captures')} hint={t('prev.capturesHint')}>
              <FaceCapture captures={captures} onChange={setCaptures} />
            </FormSection>
          )}

          <div className="card space-y-3">
            {error && fullName !== '' && (
              <p className="text-danger text-xs leading-relaxed">{error}</p>
            )}
            <button className="btn-primary w-full" disabled={mutation.isPending || Boolean(error)}>
              {mutation.isPending ? `${t('prev.submit')}…` : t('prev.submit')}
            </button>
          </div>
        </div>
      </form>
    </EnrollShell>
  );
}
