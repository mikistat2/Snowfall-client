import { useEffect, useState } from 'react';
import { pushBackInterceptor } from '../../lib/backInterceptor';
import { ProviderMark } from './ProviderMark';
import type { BillingProvider } from '../../lib/billing';

/**
 * The wait after "Verify payment" is pressed.
 *
 * This is not decoration. A bank lookup runs to 60 seconds and a screenshot
 * upload plus lookup to 120, and the server commits the subscription at the
 * end of it. A spinner with no explanation is exactly what makes someone
 * background the app or hit back halfway through — and then the money is spent
 * and the client is no longer listening for the answer. So: name the step,
 * promise nothing, and say plainly not to leave.
 *
 * The steps advance on a timer because the server reports no progress. They
 * are honest about what is happening in what order; none of them claims to
 * have finished. The last one holds until the response lands, however long
 * that takes.
 */

interface Step {
  label: string;
  /** Seconds after which this step starts. */
  at: number;
}

function stepsFor(source: 'image' | 'reference', provider: BillingProvider): Step[] {
  const bank = provider === 'CBE' ? 'the bank' : 'Telebirr';
  return source === 'image'
    ? [
        { label: 'Reading the QR code on your receipt', at: 0 },
        { label: `Asking ${bank} for the original receipt`, at: 3 },
        { label: 'Checking it against your plan and payment code', at: 12 },
      ]
    : [
        { label: `Asking ${bank} for the original receipt`, at: 0 },
        { label: 'Checking it against your plan and payment code', at: 9 },
      ];
}

export function VerifyingOverlay({
  source,
  provider,
}: {
  source: 'image' | 'reference';
  provider: Exclude<BillingProvider, 'CASH'>;
}) {
  const steps = stepsFor(source, provider);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Android back must not tear down the request mid-flight — see above.
  useEffect(() => pushBackInterceptor(() => undefined), []);

  // The page behind this must not scroll under the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const activeIndex = steps.reduce((found, step, index) => (elapsed >= step.at ? index : found), 0);

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-slate-950/85 px-6 backdrop-blur-sm motion-safe:animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-7 h-24 w-24">
        <span
          className="absolute inset-0 rounded-full bg-sky-400/25 motion-safe:animate-pulse-ring"
          aria-hidden
        />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl">
          <ProviderMark provider={provider} size="h-12" tile={false} />
        </span>
      </div>

      <h2 className="text-center text-lg font-bold text-white">Verifying your payment</h2>
      <p className="mt-1.5 max-w-xs text-center text-sm leading-relaxed text-slate-300">
        Keep this screen open. Closing the app now could leave the payment unconfirmed.
      </p>

      <ol className="mt-7 w-full max-w-xs space-y-3">
        {steps.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li key={step.label} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                      ? 'bg-sky-500 text-white'
                      : 'bg-white/10 text-slate-400'
                }`}
                aria-hidden
              >
                {done ? '✓' : index + 1}
              </span>
              <span
                className={`text-sm leading-snug ${
                  done ? 'text-slate-400' : active ? 'font-semibold text-white' : 'text-slate-500'
                }`}
              >
                {step.label}
                {active && <span className="motion-safe:animate-blink">…</span>}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Only shown once the wait is long enough to be worrying, and it
          reassures rather than counts down to a deadline we cannot promise. */}
      {elapsed >= 20 && (
        <p className="mt-6 max-w-xs text-center text-xs leading-relaxed text-slate-400 motion-safe:animate-fade-in">
          Still working — {bankWaitCopy(elapsed)}
        </p>
      )}
    </div>
  );
}

function bankWaitCopy(elapsed: number): string {
  if (elapsed < 45) return 'the bank can take up to a minute to answer.';
  if (elapsed < 90) return 'this one is slow, but the check is still running.';
  return 'almost there. Do not close the app.';
}
