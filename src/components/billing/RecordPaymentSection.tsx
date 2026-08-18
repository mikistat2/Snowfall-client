import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformApi } from '../../lib/platformApi';
import { apiErrorMessage } from '../../lib/api';
import { formatDate, priceFor, type BillingCycle, type BillingPlan } from '../../lib/billing';

/**
 * Record a payment that arrived outside the verified flow — cash in hand, a
 * transfer you reconciled yourself, a goodwill extension.
 *
 * It runs the same renewal maths as a verified payment (so there is exactly
 * one implementation of the expiry rule) and is written with no verified
 * reference and an explicit warning, so it stays visibly distinct in the
 * attempts table from a receipt the bank confirmed.
 */
export function RecordPaymentSection({
  gymId,
  gymName,
  comped,
  canRecord,
  isOwner,
  onDone,
}: {
  gymId: number;
  gymName: string;
  comped: boolean;
  canRecord: boolean;
  isOwner: boolean;
  onDone: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState<number | ''>('');
  const [cycle, setCycle] = useState<BillingCycle>('YEARLY');
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState<'CASH' | 'CBE' | 'TELEBIRR'>('CASH');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const plansQ = useQuery({
    queryKey: ['billing-plans'],
    queryFn: async () => (await platformApi.get<BillingPlan[]>('/billing/plans')).data,
    enabled: open,
    retry: false,
  });

  const plan = plansQ.data?.find((p) => p.id === planId);

  async function submit() {
    if (!note.trim()) return setError('Add a note — record how and when this payment arrived.');
    setBusy(true);
    setError('');
    try {
      const { data } = await platformApi.post<{ expiresAt: string }>(`/gyms/${gymId}/record-payment`, {
        planId: planId === '' ? null : planId,
        cycle,
        amount: Number(amount || 0),
        provider,
        note: note.trim(),
      });
      onDone(`Payment recorded for ${gymName}. Subscription now runs to ${formatDate(data.expiresAt)}.`);
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
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Payment &amp; billing</div>
          <div className="text-xs text-slate-500">
            {comped
              ? 'This gym is comped — the paywall never applies to it.'
              : 'Record a payment received outside the app, or exempt this gym entirely.'}
          </div>
        </div>
        {canRecord && (
          <button className="btn-secondary" onClick={() => setOpen((v) => !v)}>
            {open ? 'Cancel' : 'Record payment'}
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
            <select
              className="input w-40"
              value={planId}
              onChange={(e) => {
                const id = e.target.value === '' ? '' : Number(e.target.value);
                setPlanId(id);
                const picked = plansQ.data?.find((p) => p.id === id);
                if (picked) setAmount(String(priceFor(picked, cycle)));
              }}
            >
              <option value="">No plan</option>
              {plansQ.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              className="input w-32"
              value={cycle}
              onChange={(e) => {
                const c = e.target.value as BillingCycle;
                setCycle(c);
                if (plan) setAmount(String(priceFor(plan, c)));
              }}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
            <select className="input w-32" value={provider} onChange={(e) => setProvider(e.target.value as 'CASH')}>
              <option value="CASH">Cash</option>
              <option value="CBE">CBE</option>
              <option value="TELEBIRR">Telebirr</option>
            </select>
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
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
          <button className="btn-primary" disabled={busy} onClick={() => void submit()}>
            {busy ? 'Recording…' : 'Record payment & extend'}
          </button>
          <p className="text-xs text-slate-500">
            This extends the subscription by exactly one {cycle.toLowerCase() === 'yearly' ? 'year' : 'month'},
            stacking on any time left. It is marked as recorded by hand, not verified against a bank receipt.
          </p>
        </div>
      )}
    </div>
  );
}
