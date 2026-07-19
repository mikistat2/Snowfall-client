import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import promoImg from '../assets/images/promo-facerec-img.jpg';
import heroBg from '../assets/images/hero-bg-img.jpg';
import { Logo } from '../components/ui/Logo';
import { TrialBanner } from '../components/ui/TrialBanner';

/**
 * Public landing page (shown to logged-out visitors). Marketing copy lives
 * inline like the Guide; the visuals are pure CSS in the app's design
 * language — slate palette, flat white cards, status colors only for meaning.
 */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* ------------------------------------ hero (nav shares the same bg image) */}
      <section
        className="relative overflow-hidden bg-slate-900 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* dark overlays so the nav + headline stay legible over the photo */}
        <div className="absolute inset-0 bg-slate-650/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-transparent" />

        {/* nav — sits on top of the hero image */}
        <header className="relative z-20">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <Logo size="h-10 w-10 shrink-0 sm:h-20 sm:w-20 sm:mt-4" />
              <h1
  className="
    truncate
    text-sm
    sm:mt-4
    sm:text-[22px]
    font-display
    font-black
    uppercase
    leading-none
    tracking-wider
    bg-gradient-to-br
    from-sky-400
    via-sky-400
    to-sky-700
    bg-clip-text
    text-transparent
    drop-shadow-[0_0_8px_rgba(96,165,250,0.45)]
    [text-shadow:0_0_8px_rgba(255,255,255,0.35)]
  "
>
  Snowfall GMS
</h1>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#how" className="hover:text-white">How it works</a>
              <a href="#telegram" className="hover:text-white">Telegram</a>
            </nav>
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
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 lg:grid-cols-[1fr_1.15fr] lg:pb-24 lg:pt-12">
          <div className="space-y-6">
            <TrialBanner variant="landing" />
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your gym's front door,
              <br />
              <span className="text-slate-300">on autopilot.</span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-slate-200 sm:text-lg">
              A camera recognizes every member at the entrance and enforces your rules automatically —
              expiry, sessions, hours. You mark payments in cash or Telebirr; the system and a Telegram
              bot handle everything else.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/register"
                className="btn w-full !bg-white !px-4 !py-2.5 !text-sm !text-slate-900 hover:!bg-slate-200 sm:w-auto sm:!px-6 sm:!py-3 sm:!text-base"
              >
                Register your gym — free
              </Link>
              <a
                href="#how"
                className="btn w-full !border !border-white/40 !px-4 !py-2.5 !text-sm !text-white hover:!bg-white/10 sm:w-auto sm:!px-6 sm:!py-3 sm:!text-base"
              >
                See how it works
              </a>
            </div>
            <p className="text-sm text-slate-300">
              No member app needed · Works with a webcam or an old phone · English + Amharic
            </p>
          </div>

          <MonitorMock />
        </div>
      </section>

      {/* ---------------------------------------------------------- stats */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center md:grid-cols-4">
          <Stat value="~1 s" label="from face to decision" />
          <Stat value="0 taps" label="for a normal member entry" />
          <Stat value="5+" label="entry rules enforced automatically" />
          <Stat value="2" label="languages in every message (EN + አማ)" />
        </div>
      </section>

      {/* ---------------------------------------------------------- features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <SectionTitle
          kicker="Everything the front desk does, minus the front desk"
          title="One system for the whole membership lifecycle"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature dot="bg-green-500" title="Face-recognition check-in">
            Enroll a member once with 3–5 captures. From then on the door recognizes them and decides in
            about a second — no cards, no fingerprints, no queues.
          </Feature>
          <Feature dot="bg-orange-500" title="Your rules, enforced">
            Expired or frozen? Denied. One-session plan entering twice? Denied. Morning plan at 6 PM?
            Denied — with a one-click staff override for exceptions.
          </Feature>
          <Feature dot="bg-blue-500" title="Live occupancy">
            Always know how many people are inside. Members can even ask the Telegram bot
            <b> /traffic</b> before leaving home.
          </Feature>
          <Feature dot="bg-yellow-400" title="Cash & Telebirr reality">
            Staff mark payments manually; renewals extend from the current expiry so early renewal never
            loses days. Payments are a tamper-proof audit trail.
          </Feature>
          <Feature dot="bg-red-500" title="Telegram does the chasing">
            Expiry reminders, grace warnings, receipts, and friendly &ldquo;we miss you&rdquo; nudges —
            sent automatically in English and Amharic.
          </Feature>
          <Feature dot="bg-slate-400" title="Guests, freezes & audit">
            Day passes with one face capture, membership freezing that never burns paid days, and an
            owner-only log of every sensitive action.
          </Feature>
        </div>
      </section>

      {/* ---------------------------------------------------------- colors */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-slate-500">
            Staff learn it in one minute — every decision is a color
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Legend dot="bg-green-500" text="Go" />
            <Legend dot="bg-yellow-400" text="Go, renewal near" />
            <Legend dot="bg-orange-500" text="Stop — plan rule" />
            <Legend dot="bg-red-500" text="Stop — expired / unknown" />
            <Legend dot="bg-blue-500" text="Guest" />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- how */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <SectionTitle kicker="Up and running in an afternoon" title="How it works" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Step n="1" title="Register & set your rules">
            Create your gym, define your own plans and prices — monthly, morning-only, premium — and
            tune grace periods and reminders to how you actually run things.
          </Step>
          <Step n="2" title="Enroll members once">
            Name, phone, plan, first payment, and a few face captures. Each member scans a QR once to
            link Telegram.
          </Step>
          <Step n="3" title="The door runs itself">
            Keep the monitor open at the entrance — any webcam or an old Android phone works as the
            camera. Green means in; everything else explains itself.
          </Step>
        </div>
      </section>

      {/* ---------------------------------------------------------- telegram */}
      <section id="telegram" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 scroll-mt-20 px-4 py-16 lg:grid-cols-2">
          <div className="space-y-4">
            <TelegramIcon className="h-16 w-16" />
            <SectionTitle
              align="left"
              kicker="No member app to install"
              title="Members already have the app — it's Telegram"
            />
            <ul className="space-y-2.5 text-slate-600">
              <Tick>Expiry reminders before, on, and after the last day</Tick>
              <Tick>Instant receipts when staff mark a payment</Tick>
              <Tick>Motivational nudges after a few missed days</Tick>
              <Tick>Daily owner summary: check-ins, revenue, expiring tomorrow</Tick>
              <Tick>Every message in English and Amharic</Tick>
            </ul>
          </div>
          <ChatMock />
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-xl bg-slate-900 px-8 py-12 text-center">
          <h2 className="text-3xl font-bold text-white">Open the door to easier mornings.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Register your gym, create your plans, and enroll your first member today — all you need is a
            computer and a camera.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/register"
              className="btn !bg-white !px-6 !py-3 !text-base !text-slate-900 hover:!bg-slate-200"
            >
              Register your gym
            </Link>
            <Link
              to="/login"
              className="btn !border !border-slate-600 !px-6 !py-3 !text-base !text-white hover:!bg-slate-800"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} Snowfall Gym Management System</span>
          <span>Face data stays in your gym · Guests purged automatically</span>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* pieces                                                              */
/* ------------------------------------------------------------------ */

function SectionTitle({
  kicker,
  title,
  align = 'center',
}: {
  kicker: string;
  title: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{kicker}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Feature({ dot, title, children }: { dot: string; title: string; children: ReactNode }) {
  return (
    <div className="card">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

function Legend({ dot, text }: { dot: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm text-slate-700">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      {text}
    </span>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className="card">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
        {n}
      </span>
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

function Tick({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

/** CSS-only mock of the live monitor — the product IS the hero image. */
function MonitorMock() {
  return (
    <div className="card mx-auto w-full max-w-[20rem] space-y-3 !p-3 sm:max-w-lg sm:!p-4 lg:max-w-none">
      {/* camera area */}
      <div
        className="relative h-72 overflow-hidden rounded-lg bg-slate-900 bg-cover bg-center sm:h-80 lg:h-[28rem]"
        style={{ backgroundImage: `url(${promoImg})` }}
      >
        {/* legibility overlay so pills/chip stay readable over any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        {/* occupancy chip */}
        <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-white">
          <p className="text-[10px] uppercase tracking-wide text-slate-300">Inside now</p>
          <p className="text-xl font-bold leading-tight">23</p>
        </div>
      </div>
      {/* event feed */}
      <div className="space-y-1.5">
        <FeedRow dot="bg-green-500" text="Biruk Taddese — 28 days remaining" time="09:41" />
        <FeedRow dot="bg-orange-400" text="Afomiya Hayle — 3 days remaining" time="09:40" />
        <FeedRow dot="bg-red-500" text="Kaleb Assefa — expired 4 days ago · renew?" time="09:38" action="Allow entry" />
        <FeedRow dot="bg-blue-500" text="Guest: Marta — guest pass · valid today" time="09:35" />
      </div>
    </div>
  );
}

/** CSS-only mock of the Telegram bot conversation. */
function ChatMock() {
  return (
    <div className="card space-y-3 !p-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
          G
        </span>
        <div>
          <p className="text-sm font-semibold">Addis Power Gym Bot</p>
          <p className="text-xs text-slate-400">bot</p>
        </div>
      </div>
      <Bubble>
        ⏳ Sara, your Addis Power Gym membership expires in <b>3 days</b>. Renew at the front desk to
        keep training!
        <Am>⏳ ሳራ፣ የአባልነትዎ በ3 ቀን ውስጥ ያበቃል። እባክዎ በጊዜ ያድሱ!</Am>
      </Bubble>
      <Bubble>
        🧾 Payment received — 1,500 ETB · Regular Monthly. Valid until <b>2026-08-13</b>. Thank you!
        <Am>🧾 ክፍያዎ ተቀብለናል። እናመሰግናለን!</Am>
      </Bubble>
      <Bubble me>/traffic</Bubble>
      <Bubble>
        🟡 <b>14 people</b> inside right now — moderate.
        <Am>🟡 አሁን 14 ሰዎች አሉ — መካከለኛ።</Am>
      </Bubble>
    </div>
  );
}

function Bubble({ children, me }: { children: ReactNode; me?: boolean }) {
  return (
    <div
      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
        me ? 'ml-auto bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {children}
    </div>
  );
}

function Am({ children }: { children: ReactNode }) {
  return <span className="mt-1 block text-xs text-slate-500">{children}</span>;
}

/** Telegram logo (inline SVG — self-contained, no external request). */
function TelegramIcon({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-2xl bg-[#229ED9] p-3 ${className ?? ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" aria-hidden="true">
        <path
          d="M21.94 4.72 18.9 19.06c-.23 1.01-.83 1.26-1.68.78l-4.64-3.42-2.24 2.16c-.25.25-.46.46-.94.46l.33-4.73 8.62-7.79c.38-.33-.08-.52-.58-.19l-10.65 6.7-4.59-1.44c-1-.31-1.02-1 .21-1.48l17.94-6.92c.83-.31 1.56.2 1.29 1.51Z"
          fill="#fff"
        />
      </svg>
    </span>
  );
}

function FeedRow({ dot, text, time, action }: { dot: string; text: string; time: string; action?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-white px-3 py-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
      <p className="min-w-0 flex-1 truncate text-sm text-slate-700">{text}</p>
      {action && (
        <span className="shrink-0 rounded-lg border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600">
          {action}
        </span>
      )}
      <span className="shrink-0 text-xs text-slate-400">{time}</span>
    </div>
  );
}
