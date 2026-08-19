import type { ReactNode } from 'react';
import { PageTitle } from '../ui/PageTitle';
import { useMobileShell } from '../../hooks/useIsMobile';

/**
 * The chrome shared by the two enrollment screens (new member, back-filled
 * member).
 *
 * On a phone both are long forms that end in a camera preview, so they run on
 * the premium dark palette whatever theme the app is in — a white screen
 * behind a face preview blows the preview out and makes the flow feel like
 * paperwork. See `.theme-premium` in index.css.
 *
 * The desktop site keeps its ordinary light cards: there the form sits inside
 * the standard page chrome next to the sidebar, and a single dark slab in the
 * middle of an otherwise light app reads as a bug rather than a decision.
 */
export function EnrollShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const dark = useMobileShell();

  return (
    <div className={dark ? 'theme-premium theme-premium-page min-h-[70vh]' : ''}>
      <div className={dark ? 'mx-auto max-w-5xl' : 'max-w-5xl'}>
        <header className="mb-5">
          <PageTitle>{title}</PageTitle>
          {/* A hairline of accent under the heading: enough to say "this screen
              is a deliberate place", without decoration for its own sake. */}
          <span
            className={`mt-2 block h-0.5 w-12 rounded-full ${
              dark ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-accent'
            }`}
          />
          <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-fg-muted">{subtitle}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

/**
 * One numbered step of the form. The number is what turns a wall of inputs
 * into a sequence — on a phone only one card is on screen at a time, so
 * without it there is nothing to say how far through you are.
 */
export function FormSection({
  step,
  title,
  hint,
  children,
  className = '',
}: {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card space-y-4 ${className}`}>
      <header className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-sm font-bold text-accent ring-1 ring-accent/25">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold leading-tight text-fg">{title}</h2>
          {hint && <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
