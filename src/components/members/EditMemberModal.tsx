import { useState, type FormEvent } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { t } from '../../i18n/strings';
import { Modal } from '../ui/Modal';
import { PhoneInput } from '../ui/PhoneInput';
import { Select } from '../ui/Select';
import { SexPicker } from './SexPicker';
import { StatusBadge } from '../ui/StatusBadge';
import { CalendarDateInput, type CalendarSystem } from '../ui/CalendarDateInput';
import { usePlans } from '../../hooks/queries/usePlans';
import { useGymSettings } from '../../hooks/queries/useSettings';
import { useUpdateMember } from '../../hooks/queries/useMembers';
import { useAuth } from '../../hooks/useAuth';
import { addDaysIso, todayIso } from '../../lib/ethiopian';
import { daysLeft, deriveStatus } from '../../lib/expiry';
import type { UpdateMemberInput } from '../../api/members';
import type { Member, Subscription } from '../../lib/types';

/** "2026-08-18T12:00:00.000Z" → "2026-08-18". Dates arrive as full timestamps. */
function dateOnly(value: string | null | undefined): string {
  return value ? String(value).slice(0, 10) : '';
}

/**
 * Correcting a member record after the fact.
 *
 * Two things get fixed here and they are deliberately in one dialog: a name
 * typed wrong and the dates typed beside it are the same mistake to the person
 * who made it, and a start date can only be judged next to the registration
 * date it belongs to.
 *
 * The membership half is owner-only and rewrites the current period in place —
 * it takes no payment and writes no payment row. Giving someone more time
 * *because they paid* is the Renew button; this is for a row that was entered
 * wrong, and the preview underneath says plainly what the record will become.
 */
export function EditMemberModal({
  member,
  subscription,
  onClose,
}: {
  member: Member;
  subscription?: Subscription;
  onClose: () => void;
}) {
  const { user } = useAuth();
  // every plan, not just the sellable ones: the member may be on a plan that
  // has since been retired, and the dropdown must not silently move them off it
  const { data: plans = [] } = usePlans();
  const { data: gym } = useGymSettings();
  const mutation = useUpdateMember(member.id);

  const canEditMembership = user?.role === 'owner' && Boolean(subscription);

  const [paperCalendar, setPaperCalendar] = useState<CalendarSystem>('gregorian');
  const [fullName, setFullName] = useState(member.full_name);
  const [phone, setPhone] = useState(member.phone ?? '');
  const [sex, setSex] = useState<'male' | 'female' | ''>(member.sex ?? '');
  const [joinedAt, setJoinedAt] = useState(dateOnly(member.joined_at));

  const [planId, setPlanId] = useState<number | ''>(subscription?.plan_id ?? '');
  const [startsAt, setStartsAt] = useState(dateOnly(subscription?.starts_at));
  const [expiresAt, setExpiresAt] = useState(dateOnly(subscription?.expires_at));

  const originalExpiry = dateOnly(subscription?.expires_at);
  const selectedPlan = plans.find((p) => p.id === planId);

  // What the selected plan says the expiry should be. Renewals stack onto an
  // existing period, so a long-standing member's stored expiry is routinely
  // *not* start + duration — which is why this is offered, never imposed.
  const planExpiry = startsAt && selectedPlan ? addDaysIso(startsAt, selectedPlan.duration_days) : '';
  const expiryMatchesPlan = Boolean(planExpiry) && planExpiry === expiresAt;

  const today = todayIso();
  const remaining = expiresAt ? daysLeft(expiresAt) : null;
  // A frozen membership ignores its expiry until someone unfreezes it, so the
  // preview must not promise "active" off a date that is not being counted yet.
  const previewStatus =
    member.status === 'frozen'
      ? 'frozen'
      : gym && remaining !== null
        ? deriveStatus(remaining, gym.settings)
        : null;
  const shiftedBy = originalExpiry && expiresAt ? daysLeft(expiresAt) - daysLeft(originalExpiry) : 0;

  const error =
    fullName.trim().length < 2
      ? t('edit.errName')
      : !joinedAt
        ? t('edit.errJoinedMissing')
        : joinedAt > today
          ? t('prev.errJoinedFuture')
          : canEditMembership && (!startsAt || !expiresAt || planId === '')
            ? t('edit.errDatesMissing')
            : canEditMembership && startsAt < joinedAt
              ? t('prev.errStartBeforeJoin')
              : canEditMembership && expiresAt < startsAt
                ? t('prev.errExpiryBeforeStart')
                : '';

  function onSubmit(e: FormEvent): void {
    e.preventDefault();
    if (error) return;

    // Only what actually changed goes on the wire: an untouched `subscription`
    // key would be refused for staff, and an untouched name would still write
    // an audit entry claiming someone renamed the member.
    const patch: UpdateMemberInput = {};
    if (fullName.trim() !== member.full_name) patch.full_name = fullName.trim();
    if (phone !== (member.phone ?? '')) patch.phone = phone || null;
    if (sex !== (member.sex ?? '')) patch.sex = sex || null;
    if (joinedAt !== dateOnly(member.joined_at)) patch.joined_at = joinedAt;

    if (canEditMembership && subscription) {
      const sub: NonNullable<UpdateMemberInput['subscription']> = {};
      if (planId !== '' && planId !== subscription.plan_id) sub.plan_id = planId;
      if (startsAt !== dateOnly(subscription.starts_at)) sub.starts_at = startsAt;
      if (expiresAt !== originalExpiry) sub.expires_at = expiresAt;
      if (Object.keys(sub).length > 0) patch.subscription = sub;
    }

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    mutation.mutate(patch, { onSuccess: onClose });
  }

  return (
    <Modal title={t('edit.title')} onClose={onClose} wide>
      <form onSubmit={onSubmit} className="space-y-5">
        {mutation.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {apiErrorMessage(mutation.error)}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold">{t('edit.details')}</h3>
            <div>
              <label className="label">{t('members.fullName')}</label>
              <input
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="label">{t('auth.phone')}</label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>
            <div>
              <label className="label">{t('members.sex')}</label>
              <SexPicker value={sex} onChange={setSex} />
            </div>

            <div>
              <label className="label">{t('edit.calendar')}</label>
              <div className="flex gap-2">
                {(['gregorian', 'ethiopian'] as const).map((system) => (
                  <button
                    key={system}
                    type="button"
                    onClick={() => setPaperCalendar(system)}
                    className={paperCalendar === system ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
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
              onChange={setJoinedAt}
              max={today}
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">{t('edit.membership')}</h3>

            {!subscription ? (
              <p className="text-sm text-fg-subtle">{t('edit.noSubscription')}</p>
            ) : !canEditMembership ? (
              <p className="text-sm text-fg-subtle">{t('edit.ownerOnly')}</p>
            ) : (
              <>
                <div>
                  <label className="label">{t('enroll.plan')}</label>
                  <Select
                    value={planId}
                    label={t('enroll.plan')}
                    onChange={(next) => {
                      setPlanId(next);
                      // a different package is a different length, so the expiry
                      // that came from the old one is re-derived rather than left
                      // sitting there looking deliberate
                      const plan = plans.find((p) => p.id === next);
                      if (plan && startsAt) setExpiresAt(addDaysIso(startsAt, plan.duration_days));
                    }}
                    options={plans.map((p) => ({
                      value: p.id,
                      label: p.name,
                      hint: `${p.duration_days} ${t('common.days')}${p.active ? '' : ` · ${t('edit.planInactive')}`}`,
                    }))}
                  />
                </div>

                <CalendarDateInput
                  label={t('prev.startsAt')}
                  calendar={paperCalendar}
                  value={startsAt}
                  onChange={setStartsAt}
                  min={joinedAt || undefined}
                  required
                />
                <CalendarDateInput
                  label={t('prev.expiresAt')}
                  calendar={paperCalendar}
                  value={expiresAt}
                  onChange={setExpiresAt}
                  min={startsAt || undefined}
                  required
                />

                {planExpiry && !expiryMatchesPlan && (
                  <button
                    type="button"
                    className="text-xs text-blue-600 underline underline-offset-2 hover:no-underline dark:text-blue-400"
                    onClick={() => setExpiresAt(planExpiry)}
                  >
                    {t('edit.usePlanExpiry')} {planExpiry}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {canEditMembership && previewStatus && remaining !== null && (
          <div className="space-y-1 rounded-lg bg-surface-2 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-fg-muted">{t('members.expires')}:</span>
              <span className="font-medium">{expiresAt}</span>
              <StatusBadge status={previewStatus} />
              <span className="text-fg-muted">
                {remaining >= 0
                  ? `${remaining} ${t('members.daysLeft')}`
                  : `${-remaining} ${t('members.daysOverdue')}`}
              </span>
            </div>
            {shiftedBy !== 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {shiftedBy > 0 ? t('edit.shiftForward') : t('edit.shiftBack')}{' '}
                {Math.abs(shiftedBy)} {t('common.days')} — {t('edit.shiftHint')}
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="btn-primary" disabled={mutation.isPending || Boolean(error)}>
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
