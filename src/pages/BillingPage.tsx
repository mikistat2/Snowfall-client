import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiErrorMessage } from '../lib/api';
import { hapticSuccess } from '../lib/haptics';
import { Logo } from '../components/ui/Logo';
import { FeatureNoticeAlert } from '../components/ui/FeatureNoticeAlert';
import { VerificationChecklist } from '../components/billing/VerificationChecklist';
import { PayFlow } from '../components/billing/PayFlow';
import {
  daysUntil,
  fetchCheckout,
  formatDate,
  money,
  type BillingCheckout,
  type VerificationResult,
} from '../lib/billing';

/**
 * /billing — how a gym pays the platform.
 *
 * Self-sufficient by design: an expired gym is locked out of the normal shell,
 * so this page carries its own header and logout. It is also the only screen
 * such a gym can reach, which is why the feature-notice alert is mounted here
 * as well as in the two shells — a camera revoked while the subscription was
 * lapsed would otherwise never be announced.
 *
 * Five mutually exclusive states, and the pay flow inside one of them.
 */
export function BillingPage() {
  const { gym, user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [renewing, setRenewing] = useState(false);

  const checkoutQ = useQuery({ queryKey: ['billing'], queryFn: fetchCheckout, retry: false });
  const data = checkoutQ.data;
  // Only the owner can submit a payment (the API enforces it too). Staff still
  // reach this page when the gym is locked out, so they get an explanation
  // rather than a form that would 403 on submit.
  const isOwner = user?.role === 'owner';

  const locked = Boolean(data && data.paymentsRequired && !data.comped && !data.active);

  /**
   * A verified payment lifts the paywall, and every query in the app that was
   * being answered with a 402 is now wrong. Clearing the lot is the honest
   * response: the alternative is a dashboard that renders yesterday's error
   * states until each query happens to go stale on its own.
   */
  function onVerified(verification: VerificationResult) {
    setResult(verification);
    // Either way the attempt is now part of the history the flow lists.
    void queryClient.invalidateQueries({ queryKey: ['billing-history'] });
    if (!verification.verified) return;
    hapticSuccess();
    void queryClient.invalidateQueries();
  }

  // A success replaces the page; a rejection is stacked ON TOP of the pay flow,
  // which stays mounted with the plan, provider and receipt exactly as they
  // were. Rebuilding all three choices to re-submit the same receipt with a
  // clearer photo is the wrong tax to charge someone who has already paid.
  const succeeded = result?.verified === true;

  return (
    <div className="min-h-screen bg-canvas">
      {/*
       * Same crown as the rest of the app: the brand's sky gradient, drawn
       * full-bleed under the status bar (`pt-safe-t`) with the soft app-bar
       * elevation rather than a hairline. This page lives outside both shells,
       * so without this it was the one screen that opened on a plain surface
       * bar and read as a different, lesser app — exactly where a gym owner is
       * about to be asked for money.
       */}
      <header className="sticky top-0 z-20 rounded-b-2xl bg-gradient-to-r from-sky-600 to-sky-500 pt-safe-t text-white shadow-appbar dark:from-sky-700 dark:to-sky-600">
        <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
          <Logo size="h-9 w-9" tile />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold leading-tight text-white">
              {gym?.name ?? 'Your gym'}
            </div>
            <div className="text-xs text-white/75">Subscription &amp; billing</div>
          </div>
          {/* While access is intact this page is a detour, so offer the way
              back. While it is locked, there is nowhere to go back to. */}
          {data && !locked && (
            <Link
              to="/"
              className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white active:bg-white/25"
            >
              Done
            </Link>
          )}
          <button
            onClick={logout}
            className="shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white active:bg-white/25"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {checkoutQ.isLoading && (
          <div className="space-y-3" aria-busy>
            <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
            <div className="h-24 animate-pulse rounded-2xl bg-surface-2" />
          </div>
        )}
        {checkoutQ.error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {apiErrorMessage(checkoutQ.error)}
          </div>
        )}

        {data && result && (
          <ResultCard result={result} currency={data.currency} onRetry={() => setResult(null)} />
        )}

        {data && !succeeded && (
          <>
            {/* A — payments switched off entirely */}
            {!data.paymentsRequired && <NoPaymentNeeded reason="off" />}

            {/* B — comped: never charged, and turning the switch on will not change that */}
            {data.paymentsRequired && data.comped && <NoPaymentNeeded reason="comped" />}

            {data.paymentsRequired && !data.comped && (
              <>
                <StatusHero checkout={data} />

                {/* C — active, and not asking to renew early */}
                {data.active && !renewing && (
                  <ActiveActions isTrial={data.isTrial} onRenew={() => setRenewing(true)} />
                )}

                {/* D — not configured: this must be impossible to mistake for
                    the pay flow, so it replaces it entirely. */}
                {(!data.active || renewing) && !data.configured && <NotConfigured />}

                {/* E — the pay flow, owner only */}
                {(!data.active || renewing) &&
                  data.configured &&
                  (isOwner ? (
                    <PayFlow checkout={data} onResult={onVerified} />
                  ) : (
                    <StaffCannotPay expiresAt={data.expiresAt} />
                  ))}
              </>
            )}
          </>
        )}
      </main>

      {/* This page is outside both app shells, so it needs its own mount. */}
      <FeatureNoticeAlert />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the hero — where the account stands, in one glance                  */
/* ------------------------------------------------------------------ */

/**
 * One card that answers "am I paid up?" before anything else is read.
 *
 * The dial is the state, not a decoration: it fills as the period runs down,
 * and it is the difference between "expires 4 Sep" — a date nobody converts
 * into urgency — and a ring that is visibly nearly empty.
 */
function StatusHero({ checkout }: { checkout: BillingCheckout }) {
  const left = daysUntil(checkout.expiresAt);
  const total = checkout.currentCycle === 'MONTHLY' ? 30 : 365;
  const overdue = left !== null && left < 0;
  const tone = overdue || left === null ? 'red' : left <= 3 ? 'red' : left <= 14 ? 'amber' : 'emerald';

  const colors = {
    red: { ring: 'stroke-red-500', text: 'text-red-600 dark:text-red-400', chip: 'bg-red-500' },
    amber: { ring: 'stroke-amber-500', text: 'text-amber-600 dark:text-amber-400', chip: 'bg-amber-500' },
    emerald: {
      ring: 'stroke-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      chip: 'bg-emerald-500',
    },
  }[tone];

  const fraction = left === null ? 0 : Math.max(0, Math.min(1, left / total));

  const headline = checkout.active
    ? checkout.isTrial
      ? 'Free trial running'
      : 'Subscription active'
    : left === null
      ? 'No subscription yet'
      : 'Subscription expired';

  return (
    <div className="card flex items-center gap-4">
      <Dial fraction={fraction} className={colors.ring} />
      <div className="min-w-0 flex-1">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${colors.chip}`}
        >
          {checkout.active ? 'Active' : 'Locked'}
        </span>
        <h1 className="mt-1.5 text-lg font-extrabold leading-tight text-fg">{headline}</h1>
        <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">
          {left === null ? (
            'Choose a plan below to activate your gym.'
          ) : overdue ? (
            <>
              Ran out on <b className="text-fg">{formatDate(checkout.expiresAt)}</b> —{' '}
              <b className={colors.text}>
                {Math.abs(left)} day{Math.abs(left) === 1 ? '' : 's'} ago
              </b>
              .
            </>
          ) : (
            <>
              <b className={colors.text}>
                {left} day{left === 1 ? '' : 's'} left
              </b>{' '}
              — until {formatDate(checkout.expiresAt)}.
            </>
          )}
        </p>
        {overdue && checkout.graceDays > 0 && checkout.active && (
          <p className="mt-1 text-xs text-fg-subtle">
            You are inside the {checkout.graceDays}-day grace period. Access stops when it ends.
          </p>
        )}
      </div>
    </div>
  );
}

/** A ring that empties as the subscription runs down. */
function Dial({ fraction, className }: { fraction: number; className: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const [drawn, setDrawn] = useState(0);

  // Animate from empty on mount so the ring reads as a measurement being
  // taken rather than a static graphic.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDrawn(fraction);
      return;
    }
    const timer = setTimeout(() => setDrawn(fraction), 60);
    return () => clearTimeout(timer);
  }, [fraction]);

  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90" aria-hidden>
      <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-line" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        className={className}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - drawn)}
        style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
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
      <Link to="/" className="btn-primary mt-6 min-h-touch w-full">
        Continue to dashboard
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C — active                                                          */
/* ------------------------------------------------------------------ */

function ActiveActions({ isTrial, onRenew }: { isTrial: boolean; onRenew: () => void }) {
  return (
    <div className="space-y-2">
      <Link to="/" className="btn-primary min-h-touch w-full">
        Continue to dashboard
      </Link>
      <button onClick={onRenew} className="btn-secondary min-h-touch w-full">
        {isTrial ? 'Subscribe now' : 'Renew early'}
      </button>
      {!isTrial && (
        <p className="px-2 pt-1 text-center text-xs leading-relaxed text-fg-subtle">
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
          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
            Payments have not been set up yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            We cannot take a payment right now. Please contact us — and <b>do not send any money</b> until
            this page shows an account to pay into. A transfer made now could not be verified or credited to
            your gym.
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
      <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200">
        This gym’s subscription needs renewing
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
        {expiresAt ? (
          <>
            It ran out on <b>{formatDate(expiresAt)}</b>.{' '}
          </>
        ) : null}
        Only the gym owner can make the payment. Ask them to log in and open this page — it takes a minute,
        and access comes back the moment the receipt is verified.
      </p>
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
  const card = useRef<HTMLDivElement>(null);
  const passed = result.checks.filter((c) => c.state === 'pass').length;

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setPopped(true);
      return;
    }
    const timer = setTimeout(() => setPopped(true), 30);
    return () => clearTimeout(timer);
  }, []);

  // The verify button is at the bottom of a long flow, so the verdict lands
  // off-screen above the fold unless it pulls the view to itself.
  useEffect(() => {
    card.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
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
      ref={card}
      className={`card scroll-mt-20 ${
        result.verified ? 'border-emerald-300 dark:border-emerald-800' : 'border-red-300 dark:border-red-800'
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
          <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">
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

      {/* Nothing was taken from anyone: a rejection means the money is still
          wherever the receipt says it went, and this is the moment that fear
          needs answering. */}
      {!result.verified && (
        <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-fg-muted">
          This did not take any money. If your transfer already went through, the receipt stays valid — fix
          what is marked below and submit the same receipt again.
        </p>
      )}

      <div className="mt-4">
        <VerificationChecklist checks={result.checks} />
      </div>

      {facts.length > 0 && (
        <dl className="mt-4 space-y-1.5 rounded-xl bg-surface-2 p-3 text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs uppercase tracking-wide text-fg-muted">{label}</dt>
              <dd className="min-w-0 truncate text-right font-mono text-xs text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* No auto-redirect on success: the point of this screen is that it gets
          read. Leaving is the owner's choice. */}
      {result.verified ? (
        <button className="btn-primary mt-5 min-h-touch w-full" onClick={() => navigate('/')}>
          Continue to dashboard
        </button>
      ) : (
        // The flow is still below with every choice intact, so this only
        // clears the verdict out of the way.
        <button className="btn-primary mt-5 min-h-touch w-full" onClick={onRetry}>
          Fix it and try again
        </button>
      )}
    </div>
  );
}

function SuccessBadge() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-950">
      ✓
    </div>
  );
}
