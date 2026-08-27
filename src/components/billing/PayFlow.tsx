import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiErrorMessage } from '../../lib/api';
import { hapticError, hapticTap } from '../../lib/haptics';
import { ProviderMark } from './ProviderMark';
import { VerifyingOverlay } from './VerifyingOverlay';
import {
  fetchHistory,
  formatDate,
  money,
  priceFor,
  verifyReference,
  verifyScreenshot,
  yearlySavingMonths,
  type BillingCheckout,
  type BillingCycle,
  type BillingPlan,
  type BillingProvider,
  type VerificationResult,
} from '../../lib/billing';

/**
 * Paying the platform, from a phone.
 *
 * Three screens rather than one long form, because the job itself has three
 * separate moments: decide what to buy, leave the app and actually send money
 * in a banking app, come back and prove it. A single scroll forced the two
 * things needed at the till — the account number and the payment code — to sit
 * at opposite ends of the page, and people were scrolling between them with a
 * bank app half-open.
 *
 * Everything the middle step shows is copyable, and the payment code is
 * repeated next to the account on purpose: it is the field people forget, and
 * forgetting it is the single most common reason a real payment fails to
 * verify.
 */

type Tab = 'image' | 'reference';

const STEP_LABELS = ['Plan', 'Send', 'Confirm'] as const;

export function PayFlow({
  checkout,
  onResult,
}: {
  checkout: BillingCheckout;
  onResult: (result: VerificationResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState<number>(
    () => checkout.currentPlanId ?? checkout.plans[0]?.id ?? 0,
  );
  const [cycle, setCycle] = useState<BillingCycle>(checkout.currentCycle ?? 'YEARLY');
  const [provider, setProvider] = useState<Exclude<BillingProvider, 'CASH'>>(
    () => checkout.providers[0]?.provider ?? 'CBE',
  );
  const [tab, setTab] = useState<Tab>('image');
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLDivElement>(null);

  const plan = checkout.plans.find((p) => p.id === planId) ?? null;
  const amount = plan ? priceFor(plan, cycle) : 0;
  const account = checkout.providers.find((p) => p.provider === provider) ?? checkout.providers[0];

  // An object URL pins the whole decoded image in memory — revoke the previous
  // one on every swap, and again on unmount, or an abandoned upload strands it.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Moving between steps must land at the top of the new one; without this a
  // step opens halfway down because the previous one was longer.
  useEffect(() => {
    top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

  function clearFile() {
    setFile(null);
    // Without this, re-picking the same file fires no change event.
    if (fileInput.current) fileInput.current.value = '';
  }

  async function submit() {
    if (!plan) {
      setError('Choose a subscription plan first.');
      setStep(0);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result =
        tab === 'image'
          ? await verifyScreenshot({ provider, file: file!, planId: plan.id, cycle })
          : await verifyReference({ provider, reference: reference.trim(), planId: plan.id, cycle });
      onResult(result);
    } catch (err) {
      hapticError();
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const canConfirm = tab === 'image' ? Boolean(file) : reference.trim().length >= 4;
  const canAdvance = step === 0 ? Boolean(plan) : step === 1 ? Boolean(account) : canConfirm;

  function next() {
    hapticTap();
    setError('');
    if (step < 2) setStep(step + 1);
    else void submit();
  }

  return (
    <div className="relative">
      <div ref={top} className="scroll-mt-4" />
      <StepBar step={step} onJump={(n) => n < step && setStep(n)} />

      <div key={step} className="mt-4 space-y-3 motion-safe:animate-rise-in">
        {step === 0 && (
          <PlanStep
            plans={checkout.plans}
            currency={checkout.currency}
            planId={planId}
            cycle={cycle}
            onPlan={setPlanId}
            onCycle={setCycle}
          />
        )}

        {step === 1 && account && (
          <SendStep
            checkout={checkout}
            provider={provider}
            onProvider={setProvider}
            amount={amount}
            planName={plan?.name ?? ''}
            cycle={cycle}
          />
        )}

        {step === 2 && (
          <ConfirmStep
            checkout={checkout}
            tab={tab}
            onTab={(value) => {
              setTab(value);
              setError('');
            }}
            provider={provider}
            planName={plan?.name ?? ''}
            cycle={cycle}
            amount={amount}
            reference={reference}
            onReference={setReference}
            file={file}
            preview={preview}
            fileInput={fileInput}
            onPick={(picked) => {
              setFile(picked);
              setError('');
            }}
            onClearFile={clearFile}
            onSubmitEnter={() => canConfirm && !busy && void submit()}
          />
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Action bar — pinned to the bottom of the viewport so the next move is
          always under the thumb, whatever the length of the step above it. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-line bg-surface/95 px-4 pb-safe-b pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg gap-2">
          {step > 0 && (
            <button type="button" className="btn-secondary min-h-touch px-5" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button
            type="button"
            className="btn-primary min-h-touch flex-1"
            disabled={!canAdvance || busy}
            onClick={next}
          >
            {step === 0
              ? 'Continue'
              : step === 1
                ? 'I have sent the money'
                : busy
                  ? 'Verifying…'
                  : 'Verify payment'}
          </button>
        </div>
        <div className="h-3" />
      </div>

      {busy && <VerifyingOverlay source={tab} provider={provider} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* step 1 — what to buy                                                */
/* ------------------------------------------------------------------ */

function PlanStep({
  plans,
  currency,
  planId,
  cycle,
  onPlan,
  onCycle,
}: {
  plans: BillingPlan[];
  currency: string;
  planId: number;
  cycle: BillingCycle;
  onPlan: (id: number) => void;
  onCycle: (cycle: BillingCycle) => void;
}) {
  const selected = plans.find((p) => p.id === planId) ?? null;
  const saving = selected ? yearlySavingMonths(selected) : 0;

  return (
    <>
      {/* Billing period first: it reprices every card below it, so choosing it
          afterwards would mean reading the same prices twice. */}
      <div className="segmented grid-cols-2" role="radiogroup" aria-label="Billing period">
        {(['MONTHLY', 'YEARLY'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={cycle === option}
            className="segmented-item min-h-touch"
            onClick={() => onCycle(option)}
          >
            {option === 'MONTHLY' ? 'Monthly' : 'Yearly'}
            {option === 'YEARLY' && saving > 0 && (
              <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                −{saving} mo
              </span>
            )}
          </button>
        ))}
      </div>

      {plans.length === 0 && (
        <p className="card text-center text-sm text-fg-muted">
          No subscription plans are available right now. Please contact support.
        </p>
      )}

      {plans.map((option) => {
        const isSelected = option.id === planId;
        const price = priceFor(option, cycle);
        const perMonth = cycle === 'YEARLY' && price > 0 ? Math.round(price / 12) : null;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onPlan(option.id)}
            aria-pressed={isSelected}
            className={`w-full rounded-2xl border p-4 text-left transition-all ${
              isSelected
                ? 'border-accent bg-accent-soft/40 shadow-sm ring-1 ring-accent'
                : 'border-line bg-surface active:bg-surface-2'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                  isSelected ? 'border-accent bg-accent text-white' : 'border-line text-transparent'
                }`}
                aria-hidden
              >
                ✓
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-base font-bold text-fg">{option.name}</span>
                  <span className="shrink-0 text-right">
                    <span className="text-lg font-extrabold text-fg">{money(price, currency)}</span>
                    <span className="block text-[11px] text-fg-muted">
                      {cycle === 'YEARLY' ? 'per year' : 'per month'}
                    </span>
                  </span>
                </div>
                {perMonth !== null && (
                  <div className="mt-0.5 text-xs text-fg-muted">
                    Works out at {money(perMonth, currency)} a month
                  </div>
                )}
                {option.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{option.description}</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* step 2 — send the money                                             */
/* ------------------------------------------------------------------ */

function SendStep({
  checkout,
  provider,
  onProvider,
  amount,
  planName,
  cycle,
}: {
  checkout: BillingCheckout;
  provider: Exclude<BillingProvider, 'CASH'>;
  onProvider: (provider: Exclude<BillingProvider, 'CASH'>) => void;
  amount: number;
  planName: string;
  cycle: BillingCycle;
}) {
  const account = checkout.providers.find((p) => p.provider === provider) ?? checkout.providers[0];

  return (
    <>
      {checkout.providers.length > 1 && (
        <div className="flex gap-2">
          {checkout.providers.map((option) => {
            const isSelected = option.provider === provider;
            return (
              <button
                key={option.provider}
                type="button"
                onClick={() => onProvider(option.provider)}
                aria-pressed={isSelected}
                className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border px-3 py-3.5 transition-all ${
                  isSelected
                    ? 'border-accent bg-accent-soft/40 ring-1 ring-accent'
                    : 'border-line bg-surface active:bg-surface-2'
                }`}
              >
                <ProviderMark provider={option.provider} size="h-9" />
                <span className="text-center text-xs font-semibold leading-tight text-fg">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* The amount, as the one number to get right. */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 p-4 text-white shadow-lg shadow-sky-500/20">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Send exactly</div>
        <div className="mt-0.5 text-3xl font-extrabold leading-tight">
          {money(amount, checkout.currency)}
        </div>
        <div className="mt-1 text-xs text-white/80">
          {planName} · {cycle === 'YEARLY' ? '12 months' : '1 month'}
        </div>
      </div>

      {account && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <ProviderMark provider={account.provider} size="h-7" />
            <span className="text-sm font-bold text-fg">Send to this account</span>
          </div>
          <CopyField
            label={account.provider === 'CBE' ? 'Account number' : 'Telebirr number'}
            value={account.accountNumber}
          />
          {account.accountName && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                Account name
              </div>
              <div className="text-sm font-medium text-fg">{account.accountName}</div>
            </div>
          )}
        </div>
      )}

      {/* The payment code gets the most visual weight on this screen:
          everything downstream depends on it being typed correctly. */}
      <div className="card border-2 border-dashed border-accent/50">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            ⚠️
          </span>
          <span className="text-sm font-bold text-fg">Type this as the reason</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-fg-muted">
          Your banking app calls it the <b>reason</b>, <b>remark</b> or <b>note</b>. It is how we match the
          money to your gym — a payment sent without it cannot be verified.
        </p>
        <CopyField label="Payment code" value={checkout.reasonCode} big />
      </div>

      {checkout.instructions && (
        <div className="whitespace-pre-line rounded-2xl bg-sky-50 p-3.5 text-sm leading-relaxed text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
          {checkout.instructions}
        </div>
      )}

      <p className="px-1 text-center text-xs leading-relaxed text-fg-subtle">
        Open your banking app, send the amount above, then come back here to confirm it. Nothing is charged
        from inside this app.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* step 3 — prove it                                                   */
/* ------------------------------------------------------------------ */

function ConfirmStep({
  checkout,
  tab,
  onTab,
  provider,
  planName,
  cycle,
  amount,
  reference,
  onReference,
  file,
  preview,
  fileInput,
  onPick,
  onClearFile,
  onSubmitEnter,
}: {
  checkout: BillingCheckout;
  tab: Tab;
  onTab: (tab: Tab) => void;
  provider: Exclude<BillingProvider, 'CASH'>;
  planName: string;
  cycle: BillingCycle;
  amount: number;
  reference: string;
  onReference: (value: string) => void;
  file: File | null;
  preview: string | null;
  fileInput: React.RefObject<HTMLInputElement>;
  onPick: (file: File | null) => void;
  onClearFile: () => void;
  onSubmitEnter: () => void;
}) {
  const historyQ = useQuery({ queryKey: ['billing-history'], queryFn: () => fetchHistory(5), retry: false });

  return (
    <>
      <div className="rounded-2xl bg-surface-2 px-3.5 py-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-fg-muted">You are confirming</span>
          <span className="text-right font-semibold text-fg">
            {money(amount, checkout.currency)}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-fg-subtle">
          {planName} · {cycle === 'YEARLY' ? 'Yearly' : 'Monthly'} · via{' '}
          {provider === 'CBE' ? 'CBE' : 'Telebirr'}
        </div>
      </div>

      <div className="segmented grid-cols-2" role="radiogroup" aria-label="How to confirm">
        {(['image', 'reference'] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={tab === option}
            className="segmented-item min-h-touch"
            onClick={() => onTab(option)}
          >
            {option === 'image' ? 'Receipt screenshot' : 'Transaction ID'}
          </button>
        ))}
      </div>

      {tab === 'image' ? (
        <>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          {!file ? (
            // A ref drives the picker rather than a wrapping <label>, so the
            // Replace/Remove buttons below cannot re-open it by bubbling.
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-line px-4 py-9 text-center transition-colors active:bg-surface-2"
            >
              <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-2xl">
                🧾
              </span>
              <span className="block text-sm font-semibold text-fg">Choose your receipt screenshot</span>
              <span className="mt-1 block text-xs leading-relaxed text-fg-muted">
                PNG, JPG or WebP · up to 6 MB
                <br />
                The QR code on the receipt must be fully visible
              </span>
            </button>
          ) : (
            <div className="rounded-2xl border border-line p-3">
              {preview && (
                // Showing the shot is the point: a cropped or blurred QR is the
                // most common failure, and people can see that themselves.
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="mx-auto max-h-72 w-auto rounded-xl object-contain"
                />
              )}
              <div className="mt-3 flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-fg">{file.name}</div>
                  <div className="text-xs text-fg-muted">{(file.size / 1_048_576).toFixed(1)} MB</div>
                </div>
                <button type="button" className="btn-secondary" onClick={() => fileInput.current?.click()}>
                  Replace
                </button>
                <button type="button" className="btn-secondary" onClick={onClearFile}>
                  Remove
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <label className="label" htmlFor="billing-reference">
            Transaction / reference number
          </label>
          <input
            id="billing-reference"
            className="input font-mono text-base tracking-wide"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder={provider === 'CBE' ? 'e.g. FT25ABCD1234' : 'e.g. CFG12H34IJ'}
            value={reference}
            onChange={(e) => onReference(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitEnter();
            }}
          />
          <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">
            Printed on your receipt, and in the SMS your bank sent you, as the transaction or reference
            number.
          </p>
        </div>
      )}

      {/* Previous attempts — a rejection usually says exactly what to fix, and
          seeing it here beats hunting for it after the next failure. */}
      {(historyQ.data?.length ?? 0) > 0 && (
        <div className="card">
          <h2 className="mb-2 text-sm font-bold text-fg">Previous attempts</h2>
          <ul className="divide-y divide-line text-sm">
            {historyQ.data!.map((payment) => (
              <li key={payment.id} className="flex items-start gap-3 py-2.5">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    payment.status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  aria-hidden
                >
                  {payment.status === 'VERIFIED' ? '✓' : '×'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs text-fg-muted">{payment.reference ?? '—'}</div>
                  <div className="text-xs leading-relaxed text-fg-muted">
                    {payment.status === 'VERIFIED'
                      ? 'Verified'
                      : (payment.failure_reason ?? 'Not verified')}
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs text-fg-subtle">
                  {formatDate(payment.created_at)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* small pieces                                                        */
/* ------------------------------------------------------------------ */

function StepBar({ step, onJump }: { step: number; onJump: (step: number) => void }) {
  return (
    <ol className="flex items-center gap-2">
      {STEP_LABELS.map((label, index) => {
        const done = index < step;
        const active = index === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              // Going back is free; jumping forward past an unmade choice is not.
              onClick={() => onJump(index)}
              disabled={index >= step}
              className="flex min-w-0 flex-1 flex-col gap-1.5 text-left disabled:cursor-default"
            >
              <span
                className={`h-1 rounded-full transition-colors ${
                  done ? 'bg-emerald-500' : active ? 'bg-accent' : 'bg-line'
                }`}
              />
              <span
                className={`truncate text-[11px] font-semibold uppercase tracking-wider ${
                  active ? 'text-fg' : done ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg-subtle'
                }`}
              >
                {done ? `✓ ${label}` : label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * A value that exists to be copied into another app. Tapping the whole row
 * copies — a small icon target is the wrong shape for a thumb, and this row is
 * never anything but a copy affordance.
 */
function CopyField({ label, value, big }: { label: string; value: string; big?: boolean }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard?.writeText(value).catch(() => undefined);
    hapticTap();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`flex w-full items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5 text-left transition-colors active:bg-line/50 ${
        big ? 'mt-3' : ''
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
          {label}
        </span>
        <span
          className={`block truncate font-mono font-bold text-fg ${
            big ? 'text-2xl tracking-[0.25em]' : 'text-base'
          }`}
        >
          {value}
        </span>
      </span>
      <span
        className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
          copied ? 'bg-emerald-500 text-white' : 'bg-surface text-fg-muted shadow-sm'
        }`}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </span>
    </button>
  );
}
