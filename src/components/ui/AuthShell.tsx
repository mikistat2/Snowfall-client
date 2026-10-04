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
      <span className="font-display text-lg font-black uppercase tracking-wider text-white">Snowfall</span>
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
      <aside className="hidden w-1/2 shrink-0 flex-col justify-between bg-[linear-gradient(135deg,#071a35_0%,#0d2d55_53%,#164b7c_53%,#236b9c_100%)] p-12 text-white lg:flex">
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
              <li key={line} className="flex items-start gap-3 text-sm text-sky-100">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-sky-100/75">Snowfall Gym Management System</p>
      </aside>

      <main className="flex flex-1 items-start justify-center bg-white px-4 sm:px-8 lg:items-center lg:py-10">
        <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-sm'}`}>
          <div className="-mx-4 mb-7 flex min-h-40 items-end bg-[linear-gradient(135deg,#071a35_0%,#0d2d55_53%,#164b7c_53%,#236b9c_100%)] px-6 pb-8 pt-7 [clip-path:polygon(0_0,100%_0,100%_78%,0_100%)] sm:-mx-8 lg:hidden">
            <Brand asLink={!NATIVE} />
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
