import { useEffect, useState } from 'react';
import type { CheckState, PaymentCheck } from '../../lib/billing';

/**
 * Turns "payment failed" into "here is exactly what to fix".
 *
 * Every rule the server ran is shown, not just the first one that failed —
 * because the alternative is a gym owner who fixes one problem, sends REAL
 * MONEY again, and only then discovers the second.
 */

const TONE: Record<CheckState, { panel: string; icon: string; label: string }> = {
  pass: {
    panel: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
    icon: 'bg-emerald-500',
    label: 'Passed',
  },
  fail: {
    panel: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40',
    icon: 'bg-red-500',
    label: 'Failed',
  },
  warn: {
    panel: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
    icon: 'bg-amber-500',
    label: 'Warning',
  },
  skip: {
    panel: 'border-line bg-surface-2',
    icon: 'bg-slate-400',
    label: 'Not checked',
  },
};

function Glyph({ state }: { state: CheckState }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round' as const };
  if (state === 'pass') return <polyline points="4,8.5 6.8,11.3 12,5.5" {...common} />;
  if (state === 'fail') return <path d="M5 5l6 6M11 5l-6 6" {...common} />;
  if (state === 'warn')
    return (
      <>
        <path d="M8 4.5v4.2" {...common} />
        <circle cx="8" cy="11.6" r="1" fill="currentColor" stroke="none" />
      </>
    );
  return <path d="M4.5 8h7" {...common} />;
}

const REDUCED_MOTION = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function VerificationChecklist({ checks }: { checks: PaymentCheck[] }) {
  // The staggered reveal paces the reading — one rule at a time rather than a
  // wall of red. It is decoration; the content is the point, so reduced motion
  // shows the whole list at once.
  const [revealed, setRevealed] = useState(() => (REDUCED_MOTION() ? checks.length : 0));

  useEffect(() => {
    if (REDUCED_MOTION()) {
      setRevealed(checks.length);
      return;
    }
    setRevealed(0);
    const timer = setInterval(() => {
      setRevealed((n) => {
        if (n >= checks.length) {
          clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, 170);
    return () => clearInterval(timer);
  }, [checks]);

  return (
    <ul className="space-y-2">
      {checks.map((check, index) => {
        const tone = TONE[check.state];
        const shown = index < revealed;
        // A passing check's value is already visible on its own row, so the
        // prose only earns its place when something went wrong.
        const showMessage = check.state !== 'pass';
        return (
          <li
            key={check.key}
            className={`rounded-xl border p-3 ${tone.panel} ${check.state === 'skip' ? 'opacity-60' : ''}`}
            style={{
              opacity: shown ? undefined : 0,
              transform: shown ? 'none' : 'translateY(8px)',
              transition: 'opacity 420ms cubic-bezier(0.16,1,0.3,1), transform 420ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${tone.icon}`}
                style={{
                  transform: shown ? 'scale(1)' : 'scale(0.4)',
                  transition: 'transform 420ms cubic-bezier(0.34,1.56,0.64,1) 80ms',
                }}
                aria-hidden
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4">
                  <Glyph state={check.state} />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-fg">
                    {check.label}
                    <span className="sr-only"> — {tone.label}</span>
                  </span>
                  {check.actual && (
                    <span
                      className={`truncate font-mono text-xs ${
                        check.state === 'fail' ? 'text-red-600 dark:text-red-400' : 'text-fg-muted'
                      }`}
                      title={check.actual}
                    >
                      {check.actual}
                    </span>
                  )}
                </div>
                {showMessage && (
                  <p className="mt-1 text-xs leading-relaxed text-fg-muted">{check.message}</p>
                )}
                {check.state === 'fail' && check.expected && (
                  <p className="mt-1 text-xs text-fg-subtle">
                    Expected: <span className="font-mono text-fg-muted">{check.expected}</span>
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
