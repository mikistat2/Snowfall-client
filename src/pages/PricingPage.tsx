import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

/**
 * Public pricing page. Same design language as the landing page — slate
 * palette, flat white cards — with a dark hero and a monthly/yearly toggle.
 */

type Billing = 'monthly' | 'yearly';

interface Tier {
  name: string;
  tagline: string;
  monthly: string; // formatted ETB, '0' = free
  yearly: string;
  members: string;
  badge: string;
  badgeClass: string;
  available: boolean;
  popular?: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    tagline: 'Perfect for small gyms just getting started.',
    monthly: '0',
    yearly: '0',
    members: 'Under 30 members',
    badge: 'Free forever',
    badgeClass: 'bg-blue-100 text-blue-700',
    available: true,
    features: [
      'Member management & enrollment',
      'Cash payment tracking',
      'Basic dashboard & live occupancy',
      'Community support',
    ],
  },
  {
    name: 'Regular',
    tagline: 'Everything you need to run the front door on autopilot.',
    monthly: '1,200',
    yearly: '10,000',
    members: 'Up to 300 members',
    badge: 'Available now',
    badgeClass: 'bg-green-100 text-green-700',
    available: true,
    popular: true,
    features: [
      'camera check-in & QR codes',
      'Everything in Free',
      'Unlimited plans & staff accounts',
      'Telegram reminders & receipts (EN + አማ)',
      'Cash & Telebirr tracking with audit trail',
      'Membership freezing & PDF member export',
      'Owner audit log & daily summaries',
    ],
  },
  {
    name: 'Pro',
    tagline: 'Deeper insight and automation for growing gyms.',
    monthly: '1,900',
    yearly: '15,000',
    members: 'Up to 600 members',
    badge: 'Coming soon',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    available: false,
    features: [
      'camera check-in & QR codes',
      'branch management & multi-gym support',
      'spa & class management with check-in limits',
      'Everything in Regular',
      'Advanced analytics — revenue, retention, peak hours',
      'SMS & Telegram reminders & receipts (EN + አማ)',
      'Staff shift tracking & performance reports',
      'Custom-branded Telegram bot · priority support',
    ],
  },
  {
    name: 'Max',
    tagline: 'Built for chains and serious growth.',
    monthly: '2,400',
    yearly: '20,000',
    members: 'Unlimited members',
    badge: 'Coming soon',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    available: false,
    features: [
      'Everything in Pro',
      'Class scheduling with Telegram booking',
      'Trainer hiring from our platform with verfied trainers',
      'Members check in at any branch',
      'Personal-training plans via Telegram',
      'AI integration',
      'Dedicated support with on-site setup',
    ],
  },
];

export function PricingPage() {
  const [billing, setBilling] = useState<Billing>('yearly');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ------------------------------------------------------- dark hero */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-800 pb-28">
        <header className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
          <Link to="/welcome" className="flex min-w-0 items-center gap-2">
            <Logo size="h-10 w-10 shrink-0" />
            <span className="truncate text-sm font-black uppercase tracking-wider text-sky-400 sm:text-lg">
              Snowfall GMS
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/login"
              className="btn whitespace-nowrap !border !border-white/40 !px-2.5 !py-1.5 !text-xs !text-white hover:!bg-white/10 sm:!px-3.5 sm:!py-2 sm:!text-sm"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="btn whitespace-nowrap !bg-white !px-2.5 !py-1.5 !text-xs !text-slate-900 hover:!bg-slate-200 sm:!px-3.5 sm:!py-2 sm:!text-sm"
            >
              Get started
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 pt-10 text-center sm:pt-14">
          <p className="text-sm font-medium uppercase tracking-wide text-sky-400">
            One flat fee per gym · no per-member charges
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
            Pricing that grows with your gym
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Start free with your first members, upgrade when your gym does. Every paid plan begins
            with a free trial.
          </p>

          {/* billing toggle */}
          <div className="mt-8 inline-flex items-center rounded-full bg-white/10 p-1 text-sm font-medium">
            <button
              onClick={() => setBilling('monthly')}
              className={`rounded-full px-4 py-2 transition-colors ${
                billing === 'monthly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                billing === 'yearly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              Yearly
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                save ~30%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* --------------------------------------- cards overlapping the hero */}
      <section className="mx-auto -mt-20 max-w-6xl px-4">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {TIERS.map((tier) => (
            <TierCard key={tier.name} tier={tier} billing={billing} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- reassurance row */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 text-center sm:grid-cols-3">
          <Assurance title="Free trial on every paid plan">
            Try everything before you pay a single birr.
          </Assurance>
          <Assurance title="No hidden fees">
            One flat price per gym — never per member, never per check-in.
          </Assurance>
          <Assurance title="Upgrade anytime">
            Start free, move up only when your member count grows.
          </Assurance>
        </div>
        <p className="mt-10 text-center text-sm text-slate-500">
          Prices in Ethiopian Birr. Have questions?{' '}
          <Link to="/register" className="font-semibold text-slate-700 underline hover:text-slate-900">
            Register your gym
          </Link>{' '}
          and talk to us — we're happy to recommend the right plan.
        </p>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* pieces                                                              */
/* ------------------------------------------------------------------ */

function TierCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const free = tier.monthly === '0';
  const price = billing === 'monthly' ? tier.monthly : tier.yearly;

  return (
    <div
      className={`card relative flex flex-col !p-6 ${
        tier.popular ? 'ring-2 ring-slate-900' : ''
      } ${tier.available ? '' : 'opacity-90'}`}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
          Most popular
        </span>
      )}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{tier.name}</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tier.badgeClass}`}>
          {tier.badge}
        </span>
      </div>
      <p className="mt-1.5 min-h-[2.5rem] text-sm leading-relaxed text-slate-500">{tier.tagline}</p>

      <div className="mt-4">
        <p>
          <span className="text-4xl font-bold tracking-tight text-slate-900">{price}</span>
          <span className="text-sm text-slate-500">
            {free ? ' ETB' : billing === 'monthly' ? ' ETB / mo' : ' ETB / yr'}
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {free
            ? 'Free forever — no card needed'
            : billing === 'monthly'
              ? `or ${tier.yearly} ETB billed yearly`
              : `≈ ${tier.monthly} ETB / mo billed monthly`}
        </p>
      </div>

      <p className="mt-4 inline-block w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        👥 {tier.members}
      </p>

      <ul className="mt-4 flex-1 space-y-2.5 text-sm text-slate-600">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {tier.available ? (
        <Link
          to="/register"
          className={`btn mt-6 w-full text-center ${
            tier.popular
              ? '!bg-slate-900 !text-white hover:!bg-slate-700'
              : '!border !border-slate-300 !text-slate-700 hover:!bg-slate-50'
          }`}
        >
          {free ? 'Start free' : 'Register your gym'}
        </Link>
      ) : (
        <span className="btn mt-6 w-full cursor-not-allowed !bg-slate-100 text-center !text-slate-400">
          Coming soon
        </span>
      )}
    </div>
  );
}

function Assurance({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card !p-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}
