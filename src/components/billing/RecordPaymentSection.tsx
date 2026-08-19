import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformApi } from '../../lib/platformApi';
import { apiErrorMessage } from '../../lib/api';
import { Select } from '../ui/Select';
import { daysUntil, formatDate, priceFor, type BillingCycle, type BillingPlan } from '../../lib/billing';

/**
 * Record a payment that arrived outside the verified flow — cash in hand, a
 * transfer you reconciled yourself, a goodwill extension — and, for a gym
 * still on its free trial, turn that trial into a paid month or year in the
 * same click.
 *
 * It runs the same renewal maths as a verified payment (so there is exactly
 * one implementation of the expiry rule) and is written with no verified
 * reference and an explicit warning, so it stays visibly distinct in the
 * attempts table from a receipt the bank confirmed.
 */

/** Mirrors the server's computePeriod so the admin sees the date before committing. */
function previewEnd(currentEnd: string | null, cycle: BillingCycle, startNow: boolean): Date {
  const now = new Date();
  const current = currentEnd ? new Date(currentEnd) : null;
  const base = !startNow && current && current.getTime() > now.getTime() ? current : now;
  const end = new Date(base);
  if (cycle === 'YEARLY') end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

export function RecordPaymentSection({
  gymId,
  gymName,
  comped,
  canRecord,
  isOwner,
  isTrial,
  subscriptionEndsAt,
  openRequest,
  onDone,
}: {
  gymId: number;
  gymName: string;
  comped: boolean;
  canRecord: boolean;
  isOwner: boolean;
  /** Gym is still on its free trial — this panel then converts it to paid. */
  isTrial?: boolean;
  subscriptionEndsAt?: string | null;
  /** Bumped by the parent to open the panel on a chosen cycle. */
  openRequest?: { seq: number; cycle: BillingCycle } | null;
  onDone: (message: string) => void;
}) {
  const trial = Boolean(isTrial);
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState<number | ''>('');
  // A trial is almost always converted onto a month first — a year is the renewal case.
  const [cycle, setCycle] = useState<BillingCycle>(trial ? 'MONTHLY' : 'YEARLY');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<'CASH' | 'CBE' | 'TELEBIRR'>('CASH');
  const [note, setNote] = useState('');
  // Unused trial days were never paid for, so a conversion starts today.
  const [startNow, setStartNow] = useState(trial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const plansQ = useQuery({
    queryKey: ['billing-plans'],
    queryFn: async () => (await platformApi.get<BillingPlan[]>('/billing/plans')).data,
    enabled: open,
    retry: false,
  });

  const plan = plansQ.data?.find((p) => p.id === planId);

  const boxRef = useRef<HTMLDivElement>(null);

  // The parent's "Convert trial → paid month" button opens this panel
  // prefilled. It sits above the buttons that trigger it, so scroll it into
  // view — otherwise the click looks like it did nothing.
  useEffect(() => {
    if (!openRequest) return;
    setCycle(openRequest.cycle);
    setStartNow(trial);
    setOpen(true);
    if (plan) setAmount(String(priceFor(plan, openRequest.cycle)));
    boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRequest?.seq]);

  const trialLeft = trial ? daysUntil(subscriptionEndsAt ?? null) : null;
  const newEnd = previewEnd(subscriptionEndsAt ?? null, cycle, startNow);
  const cycleWord = cycle === 'YEARLY' ? 'year' : 'month';

  async function submit() {
    if (!note.trim()) return setError('Add a note — record how and when this payment arrived.');
    setBusy(true);
    setError('');
    try {
      const { data } = await platformApi.post<{ expiresAt: string; convertedFromTrial: boolean }>(
        `/gyms/${gymId}/record-payment`,
        {
          planId: planId === '' ? null : planId,
          cycle,
          amount: Number(amount || 0),
          provider,
          note: note.trim(),
          startNow,
        },
      );
      onDone(
        data.convertedFromTrial
          ? `${gymName} is now a paying customer — trial converted to a paid ${cycleWord}, payment recorded. ` +
              `Subscription runs to ${formatDate(data.expiresAt)}.`
          : `Payment recorded for ${gymName}. Subscription now runs to ${formatDate(data.expiresAt)}.`,
      );
      setOpen(false);
      setNote('');
      setAmount('');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleComped() {
    setBusy(true);
    try {
      await platformApi.put(`/gyms/${gymId}/comped`, { comped: !comped });
      onDone(
        comped
          ? `${gymName} now pays like everyone else.`
          : `${gymName} is now comped — it will never be asked to pay, even with the paywall on.`,
      );
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!canRecord && !isOwner) return null;

  return (
    <div
      ref={boxRef}
      className={`rounded-lg border p-3 ${trial ? 'border-violet-200 bg-violet-50/40' : 'border-slate-200'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">
            {trial ? 'Convert trial → paid' : 'Payment & billing'}
          </div>
          <div className="text-xs text-slate-500">
            {comped
              ? 'This gym is comped — the paywall never applies to it.'
              : trial
                ? `On a free trial${
                    trialLeft === null ? '' : trialLeft >= 0 ? ` with ${trialLeft} day${trialLeft === 1 ? '' : 's'} left` : ', already expired'
                  }. Record the payment they made to turn it into a paid subscription.`
                : 'Record a payment received outside the app, or exempt this gym entirely.'}
          </div>
        </div>
        {canRecord && (
          <button className={trial ? 'btn-primary' : 'btn-secondary'} onClick={() => setOpen((v) => !v)}>
            {open ? 'Cancel' : trial ? 'Convert & record payment' : 'Record payment'}
          </button>
        )}
        {isOwner && (
          <button className="btn-secondary" disabled={busy} onClick={() => void toggleComped()}>
            {comped ? 'Remove comp' : 'Comp this gym'}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Select
              className="w-40"
              value={planId}
              label="Plan"
              placeholder="No plan"
              clearable
              onChange={(id) => {
                setPlanId(id);
                const picked = plansQ.data?.find((p) => p.id === id);
                if (picked) setAmount(String(priceFor(picked, cycle)));
              }}
              options={(plansQ.data ?? []).map((p) => ({ value: p.id, label: p.name }))}
            />
            <Select
              className="w-32"
              value={cycle}
              label="Billing cycle"
              onChange={(c) => {
                setCycle(c);
                if (plan) setAmount(String(priceFor(plan, c)));
              }}
              options={[
                { value: 'MONTHLY', label: '1 month' },
                { value: 'YEARLY', label: '1 year' },
              ]}
            />
            <Select
              className="w-32"
              value={provider}
              label="Received by"
              onChange={setProvider}
              options={[
                { value: 'CASH', label: 'Cash' },
                { value: 'CBE', label: 'CBE' },
                { value: 'TELEBIRR', label: 'Telebirr' },
              ]}
            />
            <input
              className="input w-32"
              type="number"
              min={0}
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <input
            className="input"
            placeholder="Note (required) — e.g. cash received at the office on 12 Aug, receipt #124"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {/* Stacking is right for a renewal; only a trial conversion needs the choice. */}
          {trial && (
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={startNow}
                onChange={(e) => setStartNow(e.target.checked)}
              />
              <span>
                Start the paid {cycleWord} today
                {trial && trialLeft !== null && trialLeft > 0
                  ? ` — the ${trialLeft} unused trial day${trialLeft === 1 ? '' : 's'} are dropped`
                  : ' — any time left over is dropped'}
                . Untick to add the paid {cycleWord} on top of what is left.
              </span>
            </label>
          )}
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
          <button className="btn-primary" disabled={busy} onClick={() => void submit()}>
            {busy ? 'Recording…' : trial ? `Convert to paid ${cycleWord} & record payment` : 'Record payment & extend'}
          </button>
          <p className="text-xs text-slate-500">
            {trial
              ? `${gymName} stops being a trial account and becomes a paying customer. `
              : ''}
            The subscription is set to <b>{formatDate(newEnd.toISOString())}</b> (one {cycleWord}
            {startNow ? ' from today' : ' on top of the time left'}), and the payment is filed in the billing
            history as recorded by hand — not verified against a bank receipt.
          </p>
        </div>
      )}
    </div>
  );
}
