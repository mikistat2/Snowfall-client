import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../i18n/strings';
import { NATIVE } from '../../lib/platform';
import loginLogo from '../../assets/images/login-logo.png';
import { CheckIcon } from './icons';

function Brand({ asLink }: { asLink: boolean }) {
  const inner = (
    <>
      <img src={loginLogo} alt="" className="h-11 w-11 rounded-xl object-cover" />
      <span className="font-display text-lg font-black uppercase tracking-wider">Snowfall</span>
    </>
  );
  return asLink ? (
    <Link to="/welcome" className="relative flex items-center gap-3">
      {inner}
    </Link>
  ) : (
    <div className="relative flex items-center gap-3">{inner}</div>
  );
}

/**
 * The frame around logging in and signing up.
 *
 * Both screens used to be a lone white card floating on the app canvas with a
 * gradient-text heading — which reads as a form someone is filling in, not as
 * the front door of a product a gym is about to pay for. This is the shape
 * that carries a first impression: a dark brand panel stating what the product
 * does, and the form on a clean full-height surface beside it.
 *
 * The brand panel is `lg:` only. On a phone, and in the Android app, it would
 * be a screen of marketing between someone and the password they came to type,
 * so below that width the form is the whole page — which is also why the panel
 * carries no information the form needs.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  /** Registration needs the room; login is better narrow. */
  wide = false,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="relative hidden w-[44%] max-w-2xl shrink-0 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        {/* Two soft pools of colour rather than a flat gradient — a single
            linear wash over a full-height panel bands badly on a wide screen. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(90% 70% at 10% 0%, rgb(2 132 199 / 0.45), transparent 60%),' +
              'radial-gradient(70% 60% at 90% 100%, rgb(124 58 237 / 0.35), transparent 60%)',
          }}
        />

        {/* /welcome is a `!NATIVE` route, so in the app the same link would
            fall through the catch-all straight back to here. On a tablet wide
            enough to show this panel that is a dead tap, so it is not a link
            there at all. */}
        <Brand asLink={!NATIVE} />

        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            The front desk of your gym, on one screen.
          </h2>
          <ul className="mt-8 space-y-4">
            {[t('auth.brandLine1'), t('auth.brandLine2'), t('auth.brandLine3')].map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">Snowfall Gym Management System</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-sm'}`}>
          {/* Stands in for the brand panel below `lg`, where it is hidden. */}
          <img
            src={loginLogo}
            alt="Snowfall Gym Management System"
            className="mx-auto mb-6 w-24 rounded-2xl lg:hidden"
          />

          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-fg-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
