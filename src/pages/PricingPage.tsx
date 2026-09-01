import { Fragment, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

/**
 * Public pricing page.
 *
 * Structure: the three tiers gyms actually choose between lead the page —
 * Free · Regular · Regular + Telegram — and the two still in development sit
 * in a second row below. Five equal columns forced every card to be too narrow
 * to read on a laptop, hence the split rather than one long row.
 *
 * PRICING RULE — a year costs ten months, on every paid tier. That is a flat
 * 17% discount an owner can verify in their head, and it replaces the previous
 * numbers, where Camera and Max both cost MORE per year than paying monthly.
 * Keep `yearly === monthly * 10` when editing: `yearlySaving` clamps at zero,
 * so a regression here goes silent rather than loud.
 *
 * The add-on deltas are additive on purpose — Telegram +700, Camera +1,500,
 * and Max +2,200 for both — so the ladder reads correctly from any direction.
 *
 * Member limits live on ONE axis: Free is capped, every paid tier is not. The
 * old copy advertised 300/400/unlimited caps that nothing in the server
 * enforces, and the Regular card claimed "up to 300" and "unlimited" at once.
 */

type Billing = 'monthly' | 'yearly';

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  members: string;
  live: boolean;
  featured?: boolean;
  cta: string;
  /** Shown above the feature list, e.g. "Everything in Regular, plus" */
  inherits?: string;
  features: string[];
  /**
   * One-time installation charge, billed once at setup rather than folded into
   * the monthly price. Camera tiers need an on-site visit; that is labour, and
   * spreading it across the subscription either underprices the visit or
   * overcharges every year after the first.
   */
  setupFee?: number;
  /**
   * Show the "+N ETB on top of Regular" chip. True for the tiers sold as an
   * add-on to Regular rather than as a plan in their own right.
   */
  comparesToRegular?: boolean;
}

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */

/**
 * Every tier, in ladder order. The page splits them into two rows by id below
 * rather than by `live`, so shipping the camera cannot silently push a fourth
 * card into a three-column grid.
 */
const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Run your first members on a real system instead of a notebook.',
    monthly: 0,
    yearly: 0,
    members: 'Up to 20 members',
    live: true,
    cta: 'Start free',
    features: [
      'Member enrollment and profiles',
      'Check-in and check-out on a live occupancy board',
      'Cash payment tracking',
      'Two membership plans',
      'One staff account',
      'Community support',
    ],
  },
  {
    id: 'regular',
    name: 'Regular',
    tagline: 'The complete front desk: members, payments and check-ins in one place.',
    monthly: 2500,
    yearly: 25000, // ten months — saves 5,000 ETB (17%)
    members: 'Unlimited members',
    live: true,
    featured: true,
    cta: 'Register your gym',
    inherits: 'Everything in Free, plus',
    features: [
      'Unlimited members, staff accounts and membership plans',
      'Cash and Telebirr payments with full billing history',
      'Renewals, membership freezing and expiry alerts',
      'Guest and walk-in passes',
      'Automatic check-out at closing time',
      'Owner audit log, daily summaries and PDF member export',
      'Backfill your paper register, in Ethiopian or Gregorian dates',
    ],
  },
  {
    id: 'telegram',
    name: 'Regular + Telegram',
    tagline: 'A Telegram bot that answers your members so your front desk does not have to.',
    monthly: 3200,
    yearly: 32000, // ten months — saves 6,400 ETB (17%)
    members: 'Unlimited members',
    live: true,
    cta: 'Register your gym',
    comparesToRegular: true,
    inherits: 'Everything in Regular, plus',
    features: [
      'Your own gym bot, created and linked for you',
      'Reminders before a membership runs out',
      'A nudge to members who stop showing up',
      'Members check their remaining days themselves',
      'Members ask the bot how busy the gym is right now',
      'Your closing summary sent to you every evening',
      'Priority support',
    ],
  },
  {
    id: 'camera',
    name: 'Regular + Camera',
    tagline: 'Members walk in and the door logs them. No cards, no queue at the desk.',
    monthly: 4000,
    yearly: 40000, // ten months — saves 8,000 ETB (17%)
    members: 'Unlimited members',
    live: false,
    cta: 'Join the waiting list',
    setupFee: 5000,
    comparesToRegular: true,
    inherits: 'Everything in Regular, plus',
    features: [
      'Face-recognition check-in at the entrance',
      'Face enrollment built into member sign-up',
      'Live camera feed on the monitor screen',
      'Recognition runs on your own screen, not our servers',
      'Guest and walk-in capture',
      'On-site camera setup and calibration',
    ],
  },
  {
    id: 'max',
    name: 'Max',
    tagline: 'Face recognition and Telegram together, with setup and support handled for you.',
    monthly: 4700,
    yearly: 47000, // ten months — saves 9,400 ETB (17%)
    members: 'Unlimited members',
    live: false,
    cta: 'Join the waiting list',
    setupFee: 5000,
    inherits: 'Everything in Regular, plus',
    features: [
      'Face-recognition entry and your gym Telegram bot together',
      'A member walks in and their phone confirms the entry',
      'Revenue, retention and peak-hour analytics',
      'On-site installation and dedicated support',
      'Early access to new features',
    ],
  },
];

const byId = (id: string) => TIERS.find((t) => t.id === id)!;

/**
 * The main row: the three tiers gyms actually choose between, and the three we
 * can sell today. Listed by id so the grid is always three wide.
 */
const HEADLINE_TIERS = ['free', 'regular', 'telegram'].map(byId);

/** The second row: what is still being built. */
const UPCOMING_TIERS = ['camera', 'max'].map(byId);

/* comparison table -------------------------------------------------- */

type Cell = boolean | string;

const COLUMNS = ['Free', 'Regular', '+ Telegram', '+ Camera', 'Max'];

const COMPARISON: { group: string; rows: { label: string; cells: Cell[] }[] }[] = [
  {
    group: 'Members and staff',
    rows: [
      { label: 'Members included', cells: ['20', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
      { label: 'Staff accounts', cells: ['1', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
      { label: 'Membership plans', cells: ['2', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'] },
      { label: 'Member profiles and enrollment', cells: [true, true, true, true, true] },
    ],
  },
  {
    group: 'Money',
    rows: [
      { label: 'Cash payments', cells: [true, true, true, true, true] },
      { label: 'Telebirr payments', cells: [false, true, true, true, true] },
      { label: 'Billing history and receipts', cells: [false, true, true, true, true] },
      { label: 'Renewals and expiry alerts', cells: [false, true, true, true, true] },
      { label: 'Membership freezing', cells: [false, true, true, true, true] },
    ],
  },
  {
    group: 'At the door',
    rows: [
      { label: 'Live occupancy board', cells: [true, true, true, true, true] },
      { label: 'Check-in and check-out', cells: [true, true, true, true, true] },
      { label: 'Guest and walk-in passes', cells: [false, true, true, true, true] },
      { label: 'Automatic check-out at closing', cells: [false, true, true, true, true] },
      { label: 'Face-recognition entry', cells: [false, false, false, true, true] },
      { label: 'Live camera feed on the monitor', cells: [false, false, false, true, true] },
    ],
  },
  {
    group: 'Talking to members',
    rows: [
      { label: 'Gym Telegram bot', cells: [false, false, true, false, true] },
      { label: 'Automatic expiry reminders', cells: [false, false, true, false, true] },
      { label: 'Absence nudges', cells: [false, false, true, false, true] },
      { label: 'Members check their own days left', cells: [false, false, true, false, true] },
      { label: 'Entry confirmed to the member on face check-in', cells: [false, false, false, false, true] },
    ],
  },
  {
    group: 'For the owner',
    rows: [
      { label: 'Daily summaries and audit log', cells: [false, true, true, true, true] },
      { label: 'PDF member export', cells: [false, true, true, true, true] },
      { label: 'Paper-register backfill', cells: [false, true, true, true, true] },
      { label: 'Revenue and retention analytics', cells: [false, false, false, false, true] },
      {
        label: 'One-time installation',
        cells: ['—', '—', '—', '5,000 ETB', '5,000 ETB'],
      },
      {
        label: 'Support',
        cells: ['Community', 'Standard', 'Priority', 'On-site setup', 'Dedicated'],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const etb = (n: number) => n.toLocaleString('en-US');

/** Positive whole-birr saving of paying yearly, or 0 when yearly is not cheaper. */
function yearlySaving(monthly: number, yearly: number) {
  const saving = monthly * 12 - yearly;
  return saving > 0 ? saving : 0;
}

function savingPercent(monthly: number, yearly: number) {
  if (monthly === 0) return 0;
  return Math.round((yearlySaving(monthly, yearly) / (monthly * 12)) * 100);
}

/**
 * The figure shown large on a card: the amount actually charged, in the unit
 * the toggle is set to. On yearly that is the whole year's price — the sum the
 * owner hands over — with the per-month equivalent kept as small print below.
 */
function headlineAmount(tier: Tier, billing: Billing) {
  return billing === 'yearly' ? tier.yearly : tier.monthly;
}

/** What a yearly payer effectively pays per month. Small print only. */
function perMonth(tier: Tier, billing: Billing) {
  return billing === 'yearly' ? Math.round(tier.yearly / 12) : tier.monthly;
}

const PAID = TIERS.filter((t) => t.monthly > 0);
const SAVINGS = PAID.map((p) => savingPercent(p.monthly, p.yearly));
const BEST_SAVING = Math.max(...SAVINGS);
/**
 * True when every paid tier discounts by the same amount, which is the
 * intended state — then the badge can promise a flat "save 17%" instead of
 * hedging with "up to". If someone edits one tier out of step, the badge goes
 * back to "up to" on its own rather than overstating the others.
 */
const SAVING_IS_UNIFORM = SAVINGS.every((s) => s === BEST_SAVING);

/** The tier the add-ons are priced relative to. */
const REGULAR = byId('regular');

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export function PricingPage() {
  const [billing, setBilling] = useState<Billing>('yearly');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ---------------------------------------------------------- hero */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-800 pb-32">
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

        <div className="mx-auto max-w-2xl px-4 pt-12 text-center sm:pt-16">
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
            One price for your gym. Not one per member.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-300">
            Start free while your gym is small. Every paid plan covers unlimited members, so you
            move up for what the software does — not for how many people you signed up.
          </p>

          <BillingToggle billing={billing} onChange={setBilling} />
        </div>
      </section>

      {/* ------------------------------------------------- the three plans */}
      <section className="mx-auto -mt-24 max-w-5xl px-4">
        <div className="grid items-start gap-5 md:grid-cols-3">
          {HEADLINE_TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} billing={billing} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- upcoming */}
      <section className="mx-auto max-w-5xl px-4 pt-16">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-slate-900">Coming next: the door opens itself</h2>
          <p className="mt-2 text-slate-600">
            Face recognition is in development. Join the waiting list and we will set it up with
            you when it is ready.
          </p>
        </div>

        <div className="mt-6 grid items-start gap-5 md:grid-cols-2">
          {UPCOMING_TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} billing={billing} />
          ))}
        </div>
      </section>

      {/* --------------------------------------------- comparison table */}
      <section className="mx-auto max-w-5xl px-4 pt-16">
        <h2 className="text-2xl font-bold text-slate-900">Compare every plan</h2>
        <p className="mt-2 text-slate-600">Scroll sideways on a phone.</p>

        <div className="card mt-6 overflow-x-auto !p-0">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="sticky left-0 z-10 bg-white px-5 py-4 font-semibold text-slate-900">
                  Feature
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className={`px-4 py-4 text-center font-semibold ${
                      col === 'Regular' ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((section) => (
                // Fragment shorthand cannot carry a key, so the key sat on the
                // inner <tr> and React warned about the list itself.
                <Fragment key={section.group}>
                  <tr className="bg-slate-50">
                    <td
                      colSpan={COLUMNS.length + 1}
                      className="sticky left-0 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-500"
                    >
                      {section.group}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 last:border-0">
                      <td className="sticky left-0 z-10 bg-white px-5 py-3 text-slate-700">
                        {row.label}
                      </td>
                      {row.cells.map((cell, i) => (
                        <td
                          key={`${row.label}-${COLUMNS[i]}`}
                          className={`px-4 py-3 text-center ${
                            COLUMNS[i] === 'Regular' ? 'bg-slate-50/70' : ''
                          }`}
                        >
                          <TableCell value={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------ questions */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <Answer question="What happens after the free trial?">
            Nothing is deleted and nothing is charged automatically. We contact you, and your gym
            keeps running on the Free plan until you decide.
          </Answer>
          <Answer question="Do I pay more as members join?">
            No. Every paid plan covers the whole gym, however many members you sign up. You move up
            only when you want face recognition or the Telegram bot — never because you grew.
          </Answer>
          <Answer question="Can I change plans later?">
            Yes, in either direction. Your members, payment history and check-in records move with
            you.
          </Answer>
        </div>

        <div className="card mt-10 flex flex-col items-center gap-4 !bg-slate-900 !p-8 text-center sm:!p-10">
          <h2 className="text-2xl font-bold text-white">Not sure which plan fits?</h2>
          <p className="max-w-md text-slate-300">
            Tell us how many members you have and how they pay. We will point you at the smallest
            plan that covers it.
          </p>
          <Link to="/register" className="btn !bg-white !px-6 !text-slate-900 hover:!bg-slate-200">
            Register your gym
          </Link>
          <p className="text-xs text-slate-400">All prices in Ethiopian Birr.</p>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* pieces                                                              */
/* ------------------------------------------------------------------ */

function BillingToggle({
  billing,
  onChange,
}: {
  billing: Billing;
  onChange: (b: Billing) => void;
}) {
  return (
    <div className="mt-9 inline-flex items-center rounded-full bg-white/10 p-1 text-sm font-medium">
      <button
        type="button"
        aria-pressed={billing === 'monthly'}
        onClick={() => onChange('monthly')}
        className={`rounded-full px-5 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
          billing === 'monthly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
        }`}
      >
        Pay monthly
      </button>
      <button
        type="button"
        aria-pressed={billing === 'yearly'}
        onClick={() => onChange('yearly')}
        className={`flex items-center gap-2 rounded-full px-5 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
          billing === 'yearly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
        }`}
      >
        Pay yearly
        {BEST_SAVING > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              billing === 'yearly' ? 'bg-sky-100 text-sky-700' : 'bg-white/15 text-sky-300'
            }`}
          >
            {SAVING_IS_UNIFORM ? `save ${BEST_SAVING}%` : `save up to ${BEST_SAVING}%`}
          </span>
        )}
      </button>
    </div>
  );
}

function Price({ tier, billing, dark }: { tier: Tier; billing: Billing; dark?: boolean }) {
  const free = tier.monthly === 0;
  const headline = headlineAmount(tier, billing);
  const saving = yearlySaving(tier.monthly, tier.yearly);
  const muted = dark ? 'text-slate-400' : 'text-slate-500';

  if (free) {
    return (
      <div>
        <p className="flex items-baseline gap-1.5">
          <span className={`text-4xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
            Free
          </span>
        </p>
        <p className={`mt-1.5 text-sm ${muted}`}>No card, no trial clock, no expiry.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="flex items-baseline gap-1.5">
        <span
          className={`text-4xl font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}
        >
          {etb(headline)}
        </span>
        {/*
          The unit names what is actually charged in this toggle position, so
          the two states are never mistaken for the same offer at two prices.
        */}
        <span className={`text-sm ${muted}`}>ETB / {billing === 'yearly' ? 'year' : 'month'}</span>
      </p>
      <p className={`mt-1.5 text-sm ${muted}`}>
        {billing === 'yearly' ? (
          <>
            Works out at {etb(perMonth(tier, billing))} ETB a month
            {saving > 0 && (
              <span className={dark ? ' text-sky-300' : ' text-sky-700'}>
                {' '}
                · you keep {etb(saving)} ETB
              </span>
            )}
          </>
        ) : (
          <>
            {etb(tier.monthly * 12)} ETB over a year · billed monthly, cancel any time
          </>
        )}
      </p>
      {tier.setupFee !== undefined && (
        <p className={`mt-1.5 text-sm ${muted}`}>
          Plus {etb(tier.setupFee)} ETB once, for on-site installation.
        </p>
      )}
    </div>
  );
}

function FeatureList({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ul className={`space-y-2.5 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-sky-400' : 'text-slate-400'}`}
          >
            <path
              d="M4 10.5 8 14.5 16 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One card for every tier. Free, the paid plans and the two "Regular + X"
 * tiers all render through here — they differ only in which optional pieces
 * they carry, and keeping two near-identical card components in sync was what
 * let the add-on cards drift out of step with the plan cards.
 */
function TierCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const dark = Boolean(tier.featured);
  const delta = tier.comparesToRegular
    ? headlineAmount(tier, billing) - headlineAmount(REGULAR, billing)
    : 0;

  return (
    <div
      className={`card relative flex h-full flex-col !p-6 ${
        dark ? '!bg-slate-900 shadow-xl md:-mt-4 md:!pb-8 md:!pt-8' : ''
      }`}
    >
      {dark && (
        <span className="absolute -top-3 left-6 rounded-full bg-sky-400 px-3 py-1 text-xs font-bold text-slate-900">
          Most gyms start here
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
          {tier.name}
        </h2>
        {!tier.live && (
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              dark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'
            }`}
          >
            In development
          </span>
        )}
      </div>

      <p
        className={`mt-2 min-h-[3rem] text-sm leading-relaxed ${
          dark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        {tier.tagline}
      </p>

      <div className="mt-6">
        <Price tier={tier} billing={billing} dark={dark} />
        {delta > 0 && (
          <p className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {etb(delta)} ETB / {billing === 'yearly' ? 'year' : 'month'} on top of Regular
          </p>
        )}
      </div>

      <p
        className={`mt-5 border-t pt-4 text-sm font-semibold ${
          dark ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-900'
        }`}
      >
        {tier.members}
      </p>

      <div className="mt-4 flex-1">
        {tier.inherits && (
          <p className={`mb-2.5 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {tier.inherits}
          </p>
        )}
        <FeatureList items={tier.features} dark={dark} />
      </div>

      <Link
        to="/register"
        className={`btn mt-7 w-full text-center ${
          dark
            ? '!bg-sky-400 !text-slate-900 hover:!bg-sky-300'
            : '!border !border-slate-300 !text-slate-700 hover:!bg-slate-50'
        }`}
      >
        {tier.cta}
      </Link>
    </div>
  );
}

function TableCell({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <svg viewBox="0 0 20 20" aria-label="Included" role="img" className="mx-auto h-4 w-4 text-slate-900">
        <path
          d="M4 10.5 8 14.5 16 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (value === false) {
    return (
      <span aria-label="Not included" role="img" className="text-slate-300">
        —
      </span>
    );
  }
  return <span className="text-slate-600">{value}</span>;
}

function Answer({ question, children }: { question: string; children: ReactNode }) {
  return (
    <div className="card !p-6">
      <h3 className="font-semibold text-slate-900">{question}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}