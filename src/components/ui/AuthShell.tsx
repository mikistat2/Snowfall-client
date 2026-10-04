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
 * The blue brand panel and white form surface make signup feel like a product
 * workflow rather than a floating form card.
 *
 * On phones the brand panel becomes a compact header so the form remains easy
 * to reach without losing the blue-and-white identity.
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
    <div className="flex min-h-screen bg-white">
      <aside className="hidden w-1/2 shrink-0 flex-col justify-between bg-sky-100 p-12 text-slate-900 lg:flex">
        {/* /welcome is a `!NATIVE` route, so in the app the same link would
            fall through the catch-all straight back to here. On a tablet wide
            enough to show this panel that is a dead tap, so it is not a link
            there at all. */}
        <Brand asLink={!NATIVE} />

        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            The front desk of your gym, on one screen.
          </h2>
          <ul className="mt-8 space-y-4">
            {[t('auth.brandLine1'), t('auth.brandLine2'), t('auth.brandLine3')].map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-sky-700">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500">Snowfall Gym Management System</p>
      </aside>

      <main className="flex flex-1 items-start justify-center bg-white px-4 sm:px-8 lg:items-center lg:py-10">
        <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-sm'}`}>
          <div className="-mx-4 mb-7 flex justify-center bg-sky-100 px-4 py-6 sm:-mx-8 lg:hidden">
            <img src={loginLogo} alt="Snowfall Gym Management System" className="w-20 rounded-xl" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-fg-muted">{subtitle}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-fg-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
