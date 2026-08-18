import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiErrorMessage } from '../lib/api';
import { Logo } from '../components/ui/Logo';
import { ProviderMark } from '../components/billing/ProviderMark';
import { VerificationChecklist } from '../components/billing/VerificationChecklist';
import {
  daysUntil,
  fetchCheckout,
  fetchHistory,
  formatDate,
  money,
  priceFor,
  verifyReference,
  verifyScreenshot,
  yearlySavingMonths,
  type BillingCycle,
  type BillingProvider,
  type VerificationResult,
} from '../lib/billing';

/**
 * /billing — how a gym pays the platform.
 *
 * Self-sufficient by design: an expired gym is locked out of the normal shell,
 * so this page carries its own header and logout. Five mutually exclusive
 * states, and the pay flow inside one of them.
 */
export function BillingPage() {
  const { gym, user, logout } = useAuth();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [renewing, setRenewing] = useState(false);

  const checkoutQ = useQuery({ queryKey: ['billing'], queryFn: fetchCheckout, retry: false });
  const data = checkoutQ.data;
  // Only the owner can submit a payment (the API enforces it too). Staff still
  // reach this page when the gym is locked out, so they get an explanation
  // rather than a form that would 403 on submit.
  const isOwner = user?.role === 'owner';

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-2xl items-center gap-2.5 px-4 py-3">
          <Logo size="h-9 w-9" tile />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold leading-tight text-fg">{gym?.name ?? 'Your gym'}</div>
            <div className="text-xs text-fg-muted">Subscription &amp; billing</div>
          </div>
          <button
            onClick={logout}
            className="ml-auto rounded-lg border border-line px-3 py-1.5 text-sm text-fg-muted hover:bg-surface-2"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        {checkoutQ.isLoading && <div className="card text-center text-sm text-fg-muted">Loading…</div>}
        {checkoutQ.error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {apiErrorMessage(checkoutQ.error)}
          </div>
        )}

        {data && result && (
          <ResultCard
            result={result}
            currency={data.currency}
            onRetry={() => {
              setResult(null);
              setRenewing(true);
              void checkoutQ.refetch();
            }}
          />
        )}

        {data && !result && (
          <>
            {/* A — payments switched off entirely */}
            {!data.paymentsRequired && <NoPaymentNeeded reason="off" />}

            {/* B — comped: never charged, and turning the switch on will not change that */}
            {data.paymentsRequired && data.comped && <NoPaymentNeeded reason="comped" />}

            {/* C — active, and not asking to renew early */}
            {data.paymentsRequired && !data.comped && data.active && !renewing && (
              <ActiveCard
                expiresAt={data.expiresAt}
                isTrial={data.isTrial}
                onRenew={() => setRenewing(true)}
              />
            )}

            {/* D — not configured: this must be impossible to mistake for the pay flow */}
            {data.paymentsRequired && !data.comped && (!data.active || renewing) && !data.configured && (
              <NotConfigured />
            )}

            {/* E — the pay flow, owner only */}
            {data.paymentsRequired && !data.comped && (!data.active || renewing) && data.configured && (
              isOwner ? (
                <PayFlow checkout={data} onResult={setResult} />
              ) : (
                <StaffCannotPay expiresAt={data.expiresAt} />
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* A / B — nothing to pay                                              */
/* ------------------------------------------------------------------ */

function NoPaymentNeeded({ reason }: { reason: 'off' | 'comped' }) {
  return (
    <div className="card text-center">
      <SuccessBadge />
      <h1 className="mt-4 text-xl font-bold text-fg">No payment needed</h1>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
        {reason === 'off'
          ? 'Subscriptions are free at the moment — everything is unlocked and there is nothing to pay.'
          : 'Your gym has complimentary access. Nothing to pay, now or later.'}
      </p>
      <Link to="/" className="btn-primary mt-6 w-full">
        Continue to dashboard
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C — active                                                          */
/* ------------------------------------------------------------------ */

function ActiveCard({
  expiresAt,
  isTrial,
  onRenew,
}: {
  expiresAt: string | null;
  isTrial: boolean;
  onRenew: () => void;
}) {
  const left = daysUntil(expiresAt);
  return (
    <div className="card text-center">
      <SuccessBadge />
      <h1 className="mt-4 text-xl font-bold text-fg">
        {isTrial ? 'Your free trial is running' : 'Your subscription is active'}
      </h1>
      <p className="mt-2 text-sm text-fg-muted">
        Active until <b className="text-fg">{formatDate(expiresAt)}</b>
        {left !== null && left >= 0 && <> — {left} day{left === 1 ? '' : 's'} left</>}
      </p>
      <div className="mt-6 space-y-2">
        <Link to="/" className="btn-primary w-full">
          Continue to dashboard
        </Link>
        <button onClick={onRenew} className="btn-secondary w-full">
          {isTrial ? 'Subscribe now' : 'Renew early'}
        </button>
      </div>
      {!isTrial && (
        <p className="mt-3 text-xs text-fg-subtle">
          Renewing early never loses the days you have left — the new period stacks on top.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* D — not configured                                                  */
/* ------------------------------------------------------------------ */

function NotConfigured() {
  return (
    <div className="card border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-2xl text-white">
          !
        </span>
        <div>
          <h1 className="text-lg font-bold text-amber-900 dark:text-amber-200">
            Payments have not been set up yet
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            We cannot take a payment right now. Please contact us — and{' '}
            <b>do not send any money</b> until this page shows an account to pay into. A transfer made now
            could not be verified or credited to your gym.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Staff reach this page when the gym is locked out, but cannot pay for it. */
function StaffCannotPay({ expiresAt }: { expiresAt: string | null }) {
  return (
    <div className="card border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
      <h1 className="text-lg font-bold text-amber-900 dark:text-amber-200">
        This gym’s subscription needs renewing
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
        {expiresAt ? <>It ran out on <b>{formatDate(expiresAt)}</b>. </> : null}
        Only the gym owner can make the payment. Ask them to log in and open this page — it takes a
        minute, and access comes back the moment the receipt is verified.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* E — the pay flow                                                    */
/* ------------------------------------------------------------------ */

type Checkout = Awaited<ReturnType<typeof fetchCheckout>>;

function PayFlow({ checkout, onResult }: { checkout: Checkout; onResult: (r: VerificationResult) => void }) {
  const [planId, setPlanId] = useState<number>(
    () => checkout.currentPlanId ?? checkout.plans[0]?.id ?? 0,
  );
  const [cycle, setCycle] = useState<BillingCycle>(checkout.currentCycle ?? 'YEARLY');
  const [provider, setProvider] = useState<Exclude<BillingProvider, 'CASH'>>(
    () => checkout.providers[0]?.provider ?? 'CBE',
  );
  const [tab, setTab] = useState<'image' | 'reference'>('image');
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const plan = checkout.plans.find((p) => p.id === planId) ?? null;
  const amount = plan ? priceFor(plan, cycle) : 0;
  const account = checkout.providers.find((p) => p.provider === provider) ?? checkout.providers[0];

  const historyQ = useQuery({ queryKey: ['billing-history'], queryFn: () => fetchHistory(5), retry: false });

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

  function clearFile() {
    setFile(null);
    // Without this, re-picking the same file fires no change event.
    if (fileInput.current) fileInput.current.value = '';
  }

  async function submit() {
    if (!plan) return setError('Choose a subscription plan first.');
    setBusy(true);
    setError('');
    try {
      const result =
        tab === 'image'
          ? await verifyScreenshot({ provider, file: file!, planId: plan.id, cycle })
          : await verifyReference({ provider, reference: reference.trim(), planId: plan.id, cycle });
      onResult(result);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = tab === 'image' ? Boolean(file) : reference.trim().length >= 4;

  return (
    <div className="space-y-4">
      {/* ---------------------------------------------------- step 1 */}
      <Step n="1" title="Copy your payment code">
        <p className="text-sm leading-relaxed text-fg-muted">
          You must type this as the <b className="text-fg">reason</b> (or remark) when you send the money. It
          is how we match the payment to your gym — a payment sent without it cannot be verified.
        </p>
        <CopyTray value={checkout.reasonCode} />
      </Step>

      {/* -------------------------------------------------- step 1.5 */}
      <Step n="2" title="Choose your subscription">
        <div className="space-y-3">
          {checkout.plans.map((p) => {
            const selected = p.id === planId;
            const saving = yearlySavingMonths(p);
            return (
              <div
                key={p.id}
                className={`rounded-xl border p-3 transition-colors ${
                  selected ? 'border-slate-900 bg-surface-2 dark:border-sky-500' : 'border-line'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className="flex w-full items-baseline justify-between gap-3 text-left"
                >
                  <span className="font-semibold text-fg">{p.name}</span>
                  <span className="text-xs text-fg-muted">{selected ? 'Selected' : 'Choose'}</span>
                </button>
                {p.description && <p className="mt-1 text-xs leading-relaxed text-fg-muted">{p.description}</p>}
                {selected && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(['MONTHLY', 'YEARLY'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCycle(c)}
                        className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                          cycle === c
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-sky-500 dark:bg-sky-600'
                            : 'border-line bg-surface text-fg hover:bg-surface-2'
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wide opacity-70">
                          {c === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                        </div>
                        <div className="text-sm font-bold">
                          {money(priceFor(p, c), checkout.currency)}
                        </div>
                        {c === 'YEARLY' && saving > 0 && (
                          <div className="text-[11px] opacity-80">{saving} months free</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {checkout.plans.length === 0 && (
            <p className="text-sm text-fg-muted">No subscription plans are available right now.</p>
          )}
        </div>
      </Step>

      {/* ---------------------------------------------------- step 2 */}
      <Step n="3" title="Send the payment">
        <div className="flex gap-2">
          {checkout.providers.map((p) => {
            const selected = p.provider === provider;
            return (
              <button
                key={p.provider}
                type="button"
                onClick={() => setProvider(p.provider)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border px-3 py-3 transition-colors ${
                  selected
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-sky-500 dark:bg-sky-600'
                    : 'border-line bg-surface text-fg hover:bg-surface-2'
                }`}
              >
                <ProviderMark provider={p.provider} size="h-8" />
                <span className="text-center text-xs font-semibold leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>

        {account && (
          <div className="mt-3 rounded-xl bg-surface-2 p-3">
            <div className="mb-2 flex items-center gap-2">
              <ProviderMark provider={account.provider} size="h-6" />
              <span className="text-sm font-semibold text-fg">Send to this account</span>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label={account.provider === 'CBE' ? 'Account number' : 'Telebirr number'}>
                <CopyInline value={account.accountNumber} />
              </Row>
              {account.accountName && <Row label="Account name">{account.accountName}</Row>}
              <Row label="Amount">
                <b className="text-fg">{money(amount, checkout.currency)}</b>
              </Row>
              {/* Repeating the code here is deliberate — it is the field people forget. */}
              <Row label="Reason">
                <CopyInline value={checkout.reasonCode} />
              </Row>
            </dl>
          </div>
        )}

        {checkout.instructions && (
          <div className="mt-3 whitespace-pre-line rounded-xl bg-sky-50 p-3 text-sm leading-relaxed text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
            {checkout.instructions}
          </div>
        )}
      </Step>

      {/* ---------------------------------------------------- step 3 */}
      <Step n="4" title="Confirm your payment">
        <div className="mb-3 flex gap-1 rounded-lg bg-surface-2 p-1">
          {(['image', 'reference'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError('');
              }}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {t === 'image' ? 'Upload screenshot' : 'Enter transaction ID'}
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
              onChange={(e) => {
                const picked = e.target.files?.[0] ?? null;
                setFile(picked);
                setError('');
              }}
            />
            {!file ? (
              // A ref drives the picker rather than a wrapping <label>, so the
              // Replace/Remove buttons below cannot re-open it by bubbling.
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-line px-4 py-8 text-center hover:bg-surface-2"
              >
                <div className="text-sm font-semibold text-fg">Choose a receipt screenshot</div>
                <div className="mt-1 text-xs text-fg-muted">
                  PNG, JPG or WebP · up to 6 MB · the QR code must be visible
                </div>
              </button>
            ) : (
              <div className="rounded-xl border border-line p-3">
                {preview && (
                  // Showing the shot is the point: a cropped or blurred QR is
                  // the most common failure, and people can see that themselves.
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="mx-auto max-h-64 w-auto rounded-lg object-contain"
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
                  <button type="button" className="btn-secondary" onClick={clearFile}>
                    Remove
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <input
              className="input font-mono"
              placeholder={provider === 'CBE' ? 'e.g. FT25ABCD1234' : 'e.g. CFG12H34IJ'}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit && !busy) void submit();
              }}
            />
            <p className="mt-1.5 text-xs text-fg-muted">
              Printed on your receipt as the transaction or reference number.
            </p>
          </div>
        )}

        <button className="btn-primary mt-3 w-full" disabled={!canSubmit || busy} onClick={() => void submit()}>
          {busy ? 'Verifying…' : 'Verify payment'}
        </button>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
      </Step>

      {/* previous attempts — rejections usually say exactly what to fix */}
      {(historyQ.data?.length ?? 0) > 0 && (
        <div className="card">
          <h2 className="mb-2 text-sm font-semibold text-fg">Previous attempts</h2>
          <ul className="divide-y divide-line text-sm">
            {historyQ.data!.map((p) => (
              <li key={p.id} className="flex items-start gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs text-fg-muted">{p.reference ?? '—'}</div>
                  <div className="text-xs text-fg-muted">
                    {p.status === 'VERIFIED' ? 'Verified' : p.failure_reason ?? 'Not verified'}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {p.status === 'VERIFIED' ? 'Verified' : 'Rejected'}
                  </span>
                  <div className="mt-0.5 text-xs text-fg-subtle">{formatDate(p.created_at)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the result screen                                                   */
/* ------------------------------------------------------------------ */

function ResultCard({
  result,
  currency,
  onRetry,
}: {
  result: VerificationResult;
  currency: string;
  onRetry: () => void;
}) {
  const navigate = useNavigate();
  const [popped, setPopped] = useState(false);
  const passed = result.checks.filter((c) => c.state === 'pass').length;

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setPopped(true);
    const t = setTimeout(() => setPopped(true), 30);
    return () => clearTimeout(t);
  }, []);

  const facts = useMemo(
    () =>
      [
        ['Transaction', result.payment.reference],
        ['From', result.payment.payer_name],
        ['To', result.payment.receiver_name ?? result.payment.receiver_account],
        [
          'Amount',
          result.payment.amount ? money(result.payment.amount, result.payment.currency ?? currency) : null,
        ],
        ['Paid on', result.payment.transaction_at ? formatDate(result.payment.transaction_at) : null],
      ].filter(([, value]) => Boolean(value)) as [string, string][],
    [result, currency],
  );

  return (
    <div
      className={`card ${
        result.verified
          ? 'border-emerald-300 dark:border-emerald-800'
          : 'border-red-300 dark:border-red-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-white ${
            result.verified ? 'bg-emerald-500' : 'bg-red-500'
          }`}
          style={{
            transform: popped ? 'scale(1)' : 'scale(0.4)',
            opacity: popped ? 1 : 0,
            transition: 'transform 420ms cubic-bezier(0.34,1.56,0.64,1), opacity 240ms',
          }}
          aria-hidden
        >
          {result.verified ? '✓' : '!'}
        </span>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-fg">
            {result.verified ? 'Payment verified' : 'Payment not verified'}
          </h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            {result.verified ? (
              <>
                Your subscription is active until <b className="text-fg">{formatDate(result.expiresAt)}</b>
              </>
            ) : (
              <>
                <b className="text-fg">
                  {passed} of {result.checks.length} checks passed
                </b>{' '}
                — fix everything marked below, then try again.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <VerificationChecklist checks={result.checks} />
      </div>

      {facts.length > 0 && (
        <dl className="mt-4 space-y-1.5 rounded-xl bg-surface-2 p-3 text-sm">
          {facts.map(([label, value]) => (
            <Row key={label} label={label}>
              <span className="truncate font-mono text-xs text-fg">{value}</span>
            </Row>
          ))}
        </dl>
      )}

      {/* No auto-redirect on success: the point of this screen is that it gets
          read. Leaving is the owner's choice. */}
      {result.verified ? (
        <button className="btn-primary mt-5 w-full" onClick={() => navigate('/')}>
          Continue to dashboard
        </button>
      ) : (
        <button className="btn-primary mt-5 w-full" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* small pieces                                                        */
/* ------------------------------------------------------------------ */

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-sky-600">
          {n}
        </span>
        <h2 className="text-base font-bold text-fg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-fg-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right text-fg">{children}</dd>
    </div>
  );
}

function useCopy(): [boolean, (value: string) => void] {
  const [copied, setCopied] = useState(false);
  return [
    copied,
    (value: string) => {
      void navigator.clipboard?.writeText(value).catch(() => undefined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
  ];
}

/**
 * The payment code gets the most visual weight on the page: everything
 * downstream depends on it being typed into the bank app correctly.
 */
function CopyTray({ value }: { value: string }) {
  const [copied, copy] = useCopy();
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-dashed border-line bg-surface-2 p-4">
      <code className="flex-1 text-center font-mono text-2xl font-bold tracking-[0.3em] text-fg">{value}</code>
      <button className="btn-secondary shrink-0" onClick={() => copy(value)}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

function CopyInline({ value }: { value: string }) {
  const [copied, copy] = useCopy();
  return (
    <button
      onClick={() => copy(value)}
      className="inline-flex items-center gap-1.5 font-mono text-sm text-fg hover:text-sky-600 dark:hover:text-sky-400"
      title="Copy"
    >
      {value}
      <span className="text-xs text-fg-subtle">{copied ? '✓' : '⧉'}</span>
    </button>
  );
}

function SuccessBadge() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-950">
      ✓
    </div>
  );
}
