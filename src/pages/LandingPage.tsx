import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import promoImg from '../assets/images/promo-facerec-img.jpg';
import heroBg from '../assets/images/hero-bg-img.jpg';
import { Logo } from '../components/ui/Logo';
import { TrialBanner } from '../components/ui/TrialBanner';
import { Reveal } from '../components/ui/Reveal';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { useInView, prefersReducedMotion } from '../hooks/useInView';
import { useCountUp } from '../hooks/useCountUp';

/**
 * Public landing page (shown to logged-out visitors). Marketing copy lives
 * inline like the Guide; the visuals are pure CSS in the app's design
 * language — slate palette, flat white cards, status colors only for meaning.
 * Motion (parallax hero, scroll reveals, count-up stats, a "live" monitor) is
 * decorative and disables itself under prefers-reduced-motion.
 */

/**
 * The downloadable APK lives in `client/public/`, so Vite serves it from the
 * site root untouched. It is deliberately NOT bundled into the Android app
 * itself — see client/scripts/strip-web-only-assets.mjs.
 *
 * Keep these in step with the file and with android/app/build.gradle when a new
 * build is dropped in.
 */
const APK_URL = '/Snowfall-GYM-Solution.apk';
const APK_VERSION = '1.0';
const APK_SIZE = '18.4 MB';
const APK_MIN_ANDROID = '6.0';

export function LandingPage() {
  const heroBgRef = useRef<HTMLDivElement>(null);

  // Parallax: the hero photo drifts slower than the page as you scroll. The
  // layer is oversized (-inset-y-32) so the drift never exposes an edge.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = heroBgRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.transform = `translate3d(0, ${window.scrollY * 0.18}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <ScrollProgress />

      {/* ------------------------------------ hero (nav shares the same bg image) */}
      <section className="relative overflow-hidden bg-slate-900">
        {/* parallax photo layer */}
        <div
          ref={heroBgRef}
          className="absolute -inset-y-32 inset-x-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* dark overlays so the nav + headline stay legible over the photo */}
        <div className="absolute inset-0 bg-slate-650/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-transparent" />
        {/* floating energy glows — a bit of gym-neon life */}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl animate-float-slow" />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl animate-float-slow"
          style={{ animationDelay: '1.5s' }}
        />

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
              <a href="#features" className="transition-colors hover:text-white">Features</a>
              <a href="#how" className="transition-colors hover:text-white">How it works</a>
              <a href="#telegram" className="transition-colors hover:text-white">Telegram</a>
              <a href="#app" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <AndroidIcon className="h-4 w-4 text-emerald-400" />
                Android app
              </a>
              <Link to="/pricing" className="transition-colors hover:text-white">Pricing</Link>
            </nav>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="btn whitespace-nowrap !border !border-white/40 !px-2.5 !py-1.5 !text-xs !text-white transition-transform hover:!bg-white/10 hover:-translate-y-0.5 sm:!px-3.5 sm:!py-2 sm:!text-sm"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn whitespace-nowrap !bg-white !px-2.5 !py-1.5 !text-xs !text-slate-900 transition-transform hover:!bg-slate-200 hover:-translate-y-0.5 sm:!px-3.5 sm:!py-2 sm:!text-sm"
              >
                Get started
              </Link>
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 lg:grid-cols-[1fr_1.15fr] lg:pb-24 lg:pt-12">
          <div className="space-y-6">
            <Reveal>
              <TrialBanner variant="landing" />
            </Reveal>
            <Reveal delay={80}>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Your gym's front door,
                <br />
                <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-300 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan motion-reduce:animate-none">
                  on autopilot.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="max-w-md text-base leading-relaxed text-slate-200 sm:text-lg">
                A camera recognizes every member at the entrance and enforces your rules automatically —
                expiry, sessions, hours. You mark payments in cash or Telebirr; the system and a Telegram
                bot handle everything else.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to="/register"
                  className="btn group relative w-full !bg-white !px-4 !py-2.5 !text-sm !text-slate-900 shadow-lg shadow-sky-500/20 transition-transform hover:!bg-slate-200 hover:-translate-y-0.5 sm:w-auto sm:!px-6 sm:!py-3 sm:!text-base"
                >
                  <span className="absolute -inset-px -z-10 rounded-lg bg-gradient-to-r from-sky-400 to-emerald-400 opacity-0 blur transition-opacity group-hover:opacity-70" />
                  Register your gym — free
                </Link>
                <a
                  href="#how"
                  className="btn w-full !border !border-white/40 !px-4 !py-2.5 !text-sm !text-white transition-transform hover:!bg-white/10 hover:-translate-y-0.5 sm:w-auto sm:!px-6 sm:!py-3 sm:!text-base"
                >
                  See how it works
                </a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <p className="text-sm text-slate-300">
                No member app needed · Works with a webcam or an old phone · English + Amharic
              </p>
            </Reveal>
          </div>

          <Reveal delay={200} direction="left">
            <MonitorMock />
          </Reveal>
        </div>

        {/* scroll cue */}
        <div className="relative z-10 flex justify-center pb-6">
          <span className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-white/40 p-1">
            <span className="h-1.5 w-1 rounded-full bg-white/70 animate-float-slow motion-reduce:animate-none" />
          </span>
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
        <Reveal>
          <SectionTitle
            kicker="Everything the front desk does, minus the front desk"
            title="One system for the whole membership lifecycle"
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature dot="bg-green-500" title="Face-recognition check-in" delay={0}>
            Enroll a member once with 3–5 captures. From then on the door recognizes them and decides in
            about a second — no cards, no fingerprints, no queues.
          </Feature>
          <Feature dot="bg-orange-500" title="Your rules, enforced" delay={80}>
            Expired or frozen? Denied. One-session plan entering twice? Denied. Morning plan at 6 PM?
            Denied — with a one-click staff override for exceptions.
          </Feature>
          <Feature dot="bg-blue-500" title="Live occupancy" delay={160}>
            Always know how many people are inside. Members can even ask the Telegram bot
            <b> /traffic</b> before leaving home.
          </Feature>
          <Feature dot="bg-yellow-400" title="Cash & Telebirr reality" delay={0}>
            Staff mark payments manually; renewals extend from the current expiry so early renewal never
            loses days. Payments are a tamper-proof audit trail.
          </Feature>
          <Feature dot="bg-red-500" title="Telegram does the chasing" delay={80}>
            Expiry reminders, grace warnings, receipts, and friendly &ldquo;we miss you&rdquo; nudges —
            sent automatically in English and Amharic.
          </Feature>
          <Feature dot="bg-slate-400" title="Guests, freezes & audit" delay={160}>
            Day passes with one face capture, membership freezing that never burns paid days, and an
            owner-only log of every sensitive action.
          </Feature>
        </div>
      </section>

      {/* ---------------------------------------------------------- colors */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Reveal>
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
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- how */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <Reveal>
          <SectionTitle kicker="Up and running in an afternoon" title="How it works" />
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Step n="1" title="Register & set your rules" delay={0}>
            Create your gym, define your own plans and prices — monthly, morning-only, premium — and
            tune grace periods and reminders to how you actually run things.
          </Step>
          <Step n="2" title="Enroll members once" delay={120}>
            Name, phone, plan, first payment, and a few face captures. Each member scans a QR once to
            link Telegram.
          </Step>
          <Step n="3" title="The door runs itself" delay={240}>
            Keep the monitor open at the entrance — any webcam or an old Android phone works as the
            camera. Green means in; everything else explains itself.
          </Step>
        </div>
      </section>

      {/* ---------------------------------------------------------- telegram */}
      <section id="telegram" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 scroll-mt-20 px-4 py-16 lg:grid-cols-2">
          <Reveal direction="right">
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
          </Reveal>
          <Reveal direction="left" delay={120}>
            <ChatMock />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- android app */}
      <section id="app" className="scroll-mt-20 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <SectionTitle kicker="Android app" title="Run the gym from your pocket" />
          </Reveal>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal delay={100}>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-slate-600">
                  The same account, the same data — on your phone. Check who is inside, enroll a member,
                  mark a payment and see who is about to expire, without walking back to the front desk.
                </p>

                <ul className="space-y-3">
                  <AppPoint text="Live occupancy and check-in feed" />
                  <AppPoint text="Enroll members and capture photos with the phone camera" />
                  <AppPoint text="Mark payments and renewals on the spot" />
                  <AppPoint text="English, አማርኛ and Afaan Oromoo" />
                </ul>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={APK_URL}
                    download
                    className="btn group relative inline-flex w-full items-center justify-center gap-2.5 !bg-slate-900 !px-6 !py-3.5 !text-base !text-white shadow-lg shadow-slate-900/20 transition-transform hover:!bg-slate-800 hover:-translate-y-0.5 sm:w-auto"
                  >
                    <span className="absolute -inset-px -z-10 rounded-lg bg-gradient-to-r from-sky-400 to-emerald-400 opacity-0 blur transition-opacity group-hover:opacity-70" />
                    <AndroidIcon className="h-5 w-5 shrink-0 text-emerald-400" />
                    Download for Android
                    <DownloadIcon className="h-4 w-4 shrink-0 opacity-70 transition-transform group-hover:translate-y-0.5" />
                  </a>

                  <p className="text-center text-xs leading-relaxed text-slate-500 sm:text-left">
                    Version {APK_VERSION} · {APK_SIZE}
                    <br />
                    Requires Android {APK_MIN_ANDROID} or later
                  </p>
                </div>

                {/* Sideloaded APKs always trip Android's install warning — say so
                    up front rather than letting it read as a broken download. */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <ShieldIcon className="h-4 w-4 shrink-0" />
                    Installing outside the Play Store
                  </p>
                  <ol className="mt-2 space-y-1 text-sm leading-relaxed text-amber-900/80">
                    <li>1. Tap the download above, then open the file.</li>
                    <li>
                      2. Android will ask permission to install unknown apps — choose{' '}
                      <b>Settings</b>, allow your browser, then go back.
                    </li>
                    <li>3. Tap Install, then log in with your existing gym account.</li>
                  </ol>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200} direction="left">
              <PhoneMock />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl bg-slate-900 px-8 py-12 text-center">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl animate-float-slow" />
            <div
              className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl animate-float-slow"
              style={{ animationDelay: '1.2s' }}
            />
            <h2 className="relative text-3xl font-bold text-white">Open the door to easier mornings.</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-slate-300">
              Register your gym, create your plans, and enroll your first member today — all you need is a
              computer and a camera.
            </p>
            <div className="relative mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="btn !bg-white !px-6 !py-3 !text-base !text-slate-900 transition-transform hover:!bg-slate-200 hover:-translate-y-0.5"
              >
                Register your gym
              </Link>
              <Link
                to="/pricing"
                className="btn !border !border-slate-600 !px-6 !py-3 !text-base !text-white transition-transform hover:!bg-slate-800 hover:-translate-y-0.5"
              >
                See pricing
              </Link>
              <Link
                to="/login"
                className="btn !border !border-slate-600 !px-6 !py-3 !text-base !text-white transition-transform hover:!bg-slate-800 hover:-translate-y-0.5"
              >
                Log in
              </Link>
              <a
                href={APK_URL}
                download
                className="btn inline-flex items-center gap-2 !border !border-slate-600 !px-6 !py-3 !text-base !text-white transition-transform hover:!bg-slate-800 hover:-translate-y-0.5"
              >
                <AndroidIcon className="h-5 w-5 text-emerald-400" />
                Get the Android app
              </a>
            </div>
          </div>
        </Reveal>
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

/** Stat with a count-up that runs the first time it scrolls into view. */
function Stat({ value, label }: { value: string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match?.[1] ?? '';
  const target = match ? parseFloat(match[2]) : 0;
  const suffix = match?.[3] ?? '';
  const decimals = match && match[2].includes('.') ? match[2].split('.')[1].length : 0;
  const counted = useCountUp(target, inView);
  const display = match ? `${prefix}${counted.toFixed(decimals)}${suffix}` : value;

  return (
    <div ref={ref}>
      <p className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold tabular-nums text-transparent sm:text-4xl">
        {display}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Feature({
  dot,
  title,
  children,
  delay = 0,
}: {
  dot: string;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="card group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/50">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${dot} transition-transform group-hover:scale-125`}
        />
        <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</p>
      </div>
    </Reveal>
  );
}

function Legend({ dot, text }: { dot: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-white">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      {text}
    </span>
  );
}

function Step({
  n,
  title,
  children,
  delay = 0,
}: {
  n: string;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="card group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/50">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white transition-transform group-hover:scale-110">
          {n}
        </span>
        <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</p>
      </div>
    </Reveal>
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
    <div className="card mx-auto w-full max-w-[20rem] space-y-3 !p-3 shadow-2xl shadow-sky-900/30 sm:max-w-lg sm:!p-4 lg:max-w-none">
      {/* camera area */}
      <div
        className="relative h-72 overflow-hidden rounded-lg bg-slate-900 bg-cover bg-center sm:h-80 lg:h-[28rem]"
        style={{ backgroundImage: `url(${promoImg})` }}
      >
        {/* legibility overlay so pills/chip stay readable over any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        {/* scanning line — reads as an active camera feed */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-sky-400/25 to-transparent animate-scan motion-reduce:hidden" />
        {/* recognition box locking onto a face */}
        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-24 w-20 rounded-md border-2 border-green-400/90 shadow-[0_0_18px_rgba(74,222,128,0.5)]">
            <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Biruk · 98%
            </span>
            <span className="absolute inset-0 rounded-md ring-2 ring-green-400/60 animate-pulse-ring motion-reduce:hidden" />
          </div>
        </div>
        {/* occupancy chip with a live dot */}
        <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-white">
          <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-blink motion-reduce:animate-none" />
            Inside now
          </p>
          <p className="text-xl font-bold leading-tight">23</p>
        </div>
      </div>
      {/* event feed */}
      <div className="space-y-1.5">
        <FeedRow dot="bg-green-500" text="Biruk Taddese — 28 days remaining" time="09:41" live />
        <FeedRow dot="bg-orange-400" text="Afomiya Hayle — 3 days remaining" time="09:40" />
        <FeedRow dot="bg-red-500" text="Kaleb Assefa — expired 4 days ago · renew?" time="09:38" action="Allow entry" />
        <FeedRow dot="bg-blue-500" text="Guest: Marta — guest pass · valid today" time="09:35" />
      </div>
    </div>
  );
}

/* ----------------------------------------------------- android app bits */

function AppPoint({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.79 6.8-6.79a1 1 0 0 1 1.4 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <span className="text-slate-700">{text}</span>
    </li>
  );
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.6 9.48l1.84-3.18a.4.4 0 0 0-.7-.4l-1.86 3.22a11.4 11.4 0 0 0-9.76 0L5.26 5.9a.4.4 0 1 0-.7.4L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 1.5l6.5 2.6v4.7c0 4-2.7 7.7-6.5 8.7-3.8-1-6.5-4.7-6.5-8.7V4.1L10 1.5zm.9 5.1a.9.9 0 1 0-1.8 0v3.6a.9.9 0 1 0 1.8 0V6.6zM10 13.9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * CSS-only mock of the app's home screen — the real one (pages/mobile/HomePage)
 * has this exact shape: brand hero, oversized live occupancy card overlapping
 * it, then the 2×2 stat grid.
 */
function PhoneMock() {
  return (
    <div className="mx-auto w-full max-w-[17rem]">
      <div className="relative rounded-[2.25rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl shadow-slate-900/30">
        {/* status-bar notch */}
        <div className="absolute left-1/2 top-1.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-900" />

        <div className="overflow-hidden rounded-[1.85rem] bg-slate-100">
          {/* hero */}
          <div className="relative bg-gradient-to-br from-sky-500 via-sky-600 to-slate-900 px-4 pb-14 pt-7">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
            <div className="relative flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-[10px] font-black text-white">
                S
              </span>
              <div className="min-w-0">
                <p className="text-[8px] text-white/75">Good morning, Biruk</p>
                <p className="truncate text-[11px] font-extrabold text-white">Snowfall Fitness</p>
              </div>
            </div>
          </div>

          <div className="-mt-9 space-y-2.5 px-3 pb-4">
            {/* occupancy card */}
            <div className="relative z-10 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div>
                <p className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="h-1 w-1 rounded-full bg-green-500 animate-blink motion-reduce:animate-none" />
                  Live
                </p>
                <p className="text-2xl font-extrabold leading-none text-slate-900">23</p>
                <p className="text-[8px] text-slate-500">Inside now · people</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path d="M12 5c-5 0-9 4.5-9 7s4 7 9 7 9-4.5 9-7-4-7-9-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
                </svg>
              </span>
            </div>

            {/* 2×2 stat grid */}
            <div className="grid grid-cols-2 gap-2">
              <MockTile label="Check-ins" value="47" accent="text-sky-600" />
              <MockTile label="Collected" value="4,200" accent="text-green-600" />
              <MockTile label="Expiring" value="6" accent="text-orange-600" />
              <MockTile label="New today" value="3" accent="text-slate-900" />
            </div>

            {/* bottom tab bar */}
            <div className="mt-1 flex items-center justify-around rounded-xl border border-slate-200 bg-white py-1.5">
              {['Home', 'Today', 'Members', 'More'].map((tab, i) => (
                <span
                  key={tab}
                  className={`text-[7px] font-medium ${i === 0 ? 'text-sky-600' : 'text-slate-400'}`}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5">
      <p className="text-[7px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-sm font-bold ${accent}`}>{value}</p>
    </div>
  );
}

/** CSS-only mock of the Telegram bot conversation. */
function ChatMock() {
  return (
    <div className="card space-y-3 !p-4 shadow-xl shadow-slate-300/40">
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
        ⛔ Your trial has ended — your membership <b>expired today</b>. Renew at the front desk to get
        back in.
        <Am>⛔ የሙከራ ጊዜዎ አብቅቷል — አባልነትዎ <b>ዛሬ ጊዜው አልፎበታል</b>። ለመግባት እባክዎ በመግቢያው ያድሱ።</Am>
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

function FeedRow({
  dot,
  text,
  time,
  action,
  live,
}: {
  dot: string;
  text: string;
  time: string;
  action?: string;
  live?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-white px-3 py-2">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {live && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${dot} opacity-75 animate-ping motion-reduce:hidden`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
      </span>
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
