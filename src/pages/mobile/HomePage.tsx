import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useDashboardStats, useTodayDigest } from '../../hooks/queries/useDashboard';
import { useGymSettings } from '../../hooks/queries/useSettings';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { qk } from '../../hooks/queries/keys';
import { Logo } from '../../components/ui/Logo';
import { DetailSheet, SheetEmpty, SheetLoading } from '../../components/mobile/DetailSheet';
import {
  AlertIcon,
  ArrowDownIcon,
  BellIcon,
  ChevronRightIcon,
  LiveIcon,
  MembersIcon,
  PaymentsIcon,
  SpinnerIcon,
  UserPlusIcon,
} from '../../components/mobile/icons';
import { daysLeftColor } from '../../lib/expiry';
import { SexSplit } from '../../components/ui/SexSplit';
import { SubscriptionBanner } from '../../components/ui/SubscriptionBanner';
import { t, type StringKey } from '../../i18n/strings';
import type { DashboardStats, MemberStatus, TodayDigest } from '../../lib/types';

/** Which stat tile's detail sheet is open. */
type SheetId = 'checkins' | 'collected' | 'expiring' | 'new';

/**
 * The Android home screen.
 *
 * This is a phone-native screen rather than a narrow copy of DashboardPage:
 * a brand hero that draws under the status bar, one oversized live metric,
 * a 2×2 glanceable grid, thumb-height quick actions, and a triage list of the
 * members who need chasing. The desktop dashboard keeps its own layout and
 * its peak-hours chart, which is unreadable at 360px and belongs on the wide
 * screen.
 *
 * It renders without the shell's StackHeader (see MobileShell) — the hero is
 * the header, which is what makes the top of the app feel like an app.
 */
export function HomePage() {
  const { user, gym } = useAuth();
  const queryClient = useQueryClient();
  const stats = useDashboardStats();
  const digest = useTodayDigest();
  const { data: gymSettings } = useGymSettings();

  const [liveOccupancy, setLiveOccupancy] = useState<number | null>(null);
  useSocket({
    'occupancy:update': (payload: { count: number }) => setLiveOccupancy(payload.count),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.dashboard }),
      queryClient.invalidateQueries({ queryKey: qk.today }),
    ]);
  }, [queryClient]);
  const pull = usePullToRefresh(scrollRef, refresh);

  const loading = stats.isLoading || digest.isLoading;
  const failed = stats.isError && !stats.data;

  // Without a camera there are no check-ins and no live occupancy: the two
  // entry-driven cards show the roster instead (see OccupancyCard/StatGrid).
  const cameraEnabled = gymSettings?.settings.camera_enabled ?? true;
  const occupancy = liveOccupancy ?? stats.data?.occupancy ?? 0;
  const attention = (digest.data?.expiring ?? []).slice(0, 4);

  const [sheet, setSheet] = useState<SheetId | null>(null);

  return (
    <div ref={scrollRef} className="relative min-h-full">
      <PullIndicator state={pull} />

      {/* The whole page rides the pull, so the gesture moves content rather
          than a detached spinner. No transition while the finger is down —
          that would lag behind the drag. */}
      <div
        style={{ transform: `translateY(${pull.distance}px)` }}
        className={pull.distance === 0 ? 'transition-transform duration-300 ease-out' : undefined}
      >
        <Hero gymName={gym?.name ?? t('app.name')} userName={user?.name} />

        <div className="space-y-6 px-4 pb-6">
          {/* Below the hero, not above it — the brand header owns the top edge.
              Renders nothing outside the last two weeks of the subscription. */}
          <SubscriptionBanner />

          <OccupancyCard
            count={cameraEnabled ? occupancy : (stats.data?.members_total ?? 0)}
            loading={loading}
            live={cameraEnabled && liveOccupancy !== null}
            cameraEnabled={cameraEnabled}
          />

          {failed ? (
            <ErrorCard onRetry={() => void refresh()} />
          ) : (
            <>
              <StatGrid
                loading={loading}
                cameraEnabled={cameraEnabled}
                bySex={stats.data?.members_by_sex}
                checkIns={stats.data?.check_ins_today ?? 0}
                collected={digest.data?.payments_today.total ?? 0}
                expiring={stats.data?.expiring_in_7_days ?? 0}
                newToday={digest.data?.new_members.length ?? 0}
                onOpen={setSheet}
              />

              <QuickActions />

              <Attention items={attention} loading={loading} />
            </>
          )}
        </div>
      </div>

      {/* Outside the pull-to-refresh wrapper on purpose: that div always carries
          a `transform`, and a transformed ancestor becomes the containing block
          for position:fixed — the sheet would be clipped to the page instead of
          the viewport. */}
      {sheet && (
        <StatSheet
          id={sheet}
          stats={stats.data}
          digest={digest.data}
          loading={loading}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ hero */

function greetingKey(hour: number): StringKey {
  if (hour < 12) return 'home.morning';
  if (hour < 18) return 'home.afternoon';
  return 'home.evening';
}

function Hero({ gymName, userName }: { gymName: string; userName?: string }) {
  // Ticks so the greeting and clock stay honest across a long-lived session —
  // the app is often left open on a counter all day.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const date = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-slate-900 px-4 pb-16 pt-safe-t">
      {/* soft light bloom, purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl"
      />

      <div className="relative flex items-center gap-3 pt-4">
        <Logo size="h-11 w-11" tile />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white/75">
            {t(greetingKey(now.getHours()))}
            {userName ? `, ${userName.split(' ')[0]}` : ''}
          </p>
          <h1 className="truncate text-xl font-extrabold leading-tight text-white">{gymName}</h1>
        </div>
        <Link
          to="/notifications"
          aria-label={t('nav.notifications')}
          className="touch-target shrink-0 rounded-full bg-white/15 text-white active:bg-white/25"
        >
          <BellIcon className="h-5 w-5" />
        </Link>
      </div>

      <p className="relative mt-3 text-[11px] font-medium uppercase tracking-wide text-white/60">
        {date} · {time}
      </p>
    </header>
  );
}

/* ------------------------------------------------------- pull indicator */

function PullIndicator({ state }: { state: { distance: number; armed: boolean; refreshing: boolean } }) {
  if (state.distance === 0) return null;
  const label = state.refreshing
    ? t('home.refreshing')
    : state.armed
      ? t('home.releaseToRefresh')
      : t('home.pullToRefresh');

  return (
    // Sits in the strip of canvas revealed above the hero, so it takes the
    // page foreground colour rather than the hero's white.
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center justify-end gap-1 pt-safe-t text-sky-600 dark:text-sky-400"
      style={{ height: state.distance }}
      aria-live="polite"
    >
      {state.refreshing ? (
        <SpinnerIcon className="h-5 w-5 animate-spin" />
      ) : (
        <ArrowDownIcon
          className={`h-5 w-5 transition-transform duration-200 ${state.armed ? 'rotate-180' : ''}`}
        />
      )}
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------- occupancy card */

function OccupancyCard({
  count,
  loading,
  live,
  cameraEnabled,
}: {
  count: number;
  loading: boolean;
  live: boolean;
  cameraEnabled: boolean;
}) {
  return (
    // `-mt-12` lifts the card into the hero's pb-16, which is the intended
    // floating-card look. `relative z-10` is what makes it survive: the hero is
    // position:relative, so without a position of its own this static card is
    // painted underneath it and its top 48px vanish behind the gradient.
    <section className="card relative z-10 -mt-12 flex items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {/* the dot only pulses once a socket update has actually arrived */}
          <span className="relative flex h-2 w-2">
            {live && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${live ? 'bg-green-500' : 'bg-fg-subtle'}`}
            />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-fg-muted">
            {cameraEnabled ? t('home.liveLabel') : t('home.membersTotal')}
          </span>
        </div>

        {loading ? (
          <div className="mt-2 h-12 w-20 animate-pulse rounded-lg bg-surface-2" />
        ) : (
          <p className="mt-1 text-5xl font-extrabold leading-none tabular-nums text-fg">{count}</p>
        )}

        <p className="mt-1.5 text-sm text-fg-muted">
          {cameraEnabled
            ? `${t('home.insideNow')} · ${count === 1 ? t('home.person') : t('home.people')}`
            : `${count === 1 ? t('home.person') : t('home.people')} ${t('home.onTheRoster')}`}
        </p>
      </div>

      {/* The card's action follows its subject: the live feed when there is a
          camera, the roster when there is not. */}
      <Link
        to={cameraEnabled ? '/live' : '/members'}
        aria-label={cameraEnabled ? t('live.title') : t('nav.members')}
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 active:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:active:bg-sky-500/20"
      >
        {cameraEnabled ? <LiveIcon className="h-7 w-7" /> : <MembersIcon className="h-7 w-7" />}
      </Link>
    </section>
  );
}

/* ------------------------------------------------------------ stat grid */

function StatGrid({
  loading,
  cameraEnabled,
  bySex,
  checkIns,
  collected,
  expiring,
  newToday,
  onOpen,
}: {
  loading: boolean;
  cameraEnabled: boolean;
  bySex?: { male: number; female: number };
  checkIns: number;
  collected: number;
  expiring: number;
  newToday: number;
  onOpen: (id: SheetId) => void;
}) {
  // Each tile opens a sheet with the rows behind the number instead of jumping
  // to a full page — the question a glance raises is "who?", and answering it
  // in place keeps the user on the home screen.
  const tiles: { key: StringKey; value: ReactNode; id: SheetId; accent: string; to?: string }[] = [
    cameraEnabled
      ? {
          key: 'home.checkInsToday',
          value: String(checkIns),
          id: 'checkins',
          accent: 'text-sky-600 dark:text-sky-400',
        }
      : {
          // No camera, no check-ins — the roster's split takes the slot, and
          // tapping it goes to the roster rather than opening an empty sheet.
          // Stacked: two badge-and-figure pairs do not fit across a half-width
          // tile on a 360px screen.
          key: 'home.bySex',
          value: <SexSplit male={bySex?.male ?? 0} female={bySex?.female ?? 0} stack />,
          id: 'checkins',
          accent: 'text-fg',
          to: '/members',
        },
    {
      key: 'home.collectedToday',
      value: `${collected.toLocaleString()} ${t('common.birr')}`,
      id: 'collected',
      accent: 'text-green-600 dark:text-green-400',
    },
    {
      key: 'home.expiringSoon',
      value: String(expiring),
      id: 'expiring',
      accent: expiring > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-fg',
    },
    {
      key: 'home.newToday',
      value: String(newToday),
      id: 'new',
      accent: 'text-fg',
    },
  ];

  const body = (tile: (typeof tiles)[number]) => (
    <>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-fg-muted">
          {t(tile.key)}
        </span>
        {loading ? (
          <span className="mt-2 block h-7 w-16 animate-pulse rounded bg-surface-2" />
        ) : (
          <span className={`mt-1 block text-2xl font-bold tabular-nums ${tile.accent}`}>
            {tile.value}
          </span>
        )}
      </span>
      <ChevronRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" />
    </>
  );
  const tileClass =
    'card flex items-start justify-between gap-2 p-4 text-left transition-transform active:scale-[0.98] active:bg-surface-2';

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((tile) =>
        tile.to ? (
          <Link key={tile.key} to={tile.to} className={tileClass}>
            {body(tile)}
          </Link>
        ) : (
          <button key={tile.key} type="button" onClick={() => onOpen(tile.id)} className={tileClass}>
            {body(tile)}
          </button>
        ),
      )}
    </div>
  );
}

/* --------------------------------------------------- stat detail sheets */

function timeOf(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function daysLeftText(days: number): string {
  if (days < 0) return `${t('home.expiredAgo')} ${Math.abs(days)} ${t('today.daysAgo')}`;
  if (days === 0) return t('today.expiresToday');
  if (days === 1) return t('today.tomorrow');
  return `${days} ${t('today.daysLeft')}`;
}

/** Monogram stand-in — member photos are not part of the digest payload. */
function Avatar({ name, tone }: { name: string; tone?: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        tone ?? 'bg-surface-2 text-fg-muted'
      }`}
    >
      {initials || '?'}
    </span>
  );
}

function SheetRow({
  to,
  name,
  sub,
  trailing,
  tone,
  onNavigate,
}: {
  to?: string;
  name: string;
  sub?: string;
  trailing?: ReactNode;
  tone?: string;
  onNavigate?: () => void;
}) {
  const body = (
    <>
      <Avatar name={name} tone={tone} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{name}</span>
        {sub && <span className="block truncate text-xs text-fg-muted">{sub}</span>}
      </span>
      {trailing && <span className="shrink-0 text-right">{trailing}</span>}
      {to && <ChevronRightIcon className="h-4 w-4 shrink-0 text-fg-subtle" />}
    </>
  );

  const shared = 'flex min-h-touch items-center gap-3 border-b border-line py-3 last:border-b-0';
  return to ? (
    <Link to={to} onClick={onNavigate} className={`${shared} -mx-2 px-2 active:bg-surface-2`}>
      {body}
    </Link>
  ) : (
    <div className={shared}>{body}</div>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3 text-center">
      <p className={`text-xl font-bold tabular-nums ${accent}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-fg-muted">{label}</p>
    </div>
  );
}

function StatSheet({
  id,
  stats,
  digest,
  loading,
  onClose,
}: {
  id: SheetId;
  stats: DashboardStats | undefined;
  digest: TodayDigest | undefined;
  loading: boolean;
  onClose: () => void;
}) {
  // Everything below is already in the cached digest, so opening a sheet costs
  // no extra request and renders instantly.
  if (id === 'checkins') {
    const counts = digest?.check_ins_today;
    const total = (counts?.allowed ?? 0) + (counts?.denied ?? 0);
    return (
      <DetailSheet title={t('home.sheetCheckIns')} viewAllTo="/today" onClose={onClose}>
        {loading || !counts ? (
          <SheetLoading />
        ) : total === 0 ? (
          <SheetEmpty messageKey="home.emptyCheckIns" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 py-1">
              <Metric
                label={t('home.allowed')}
                value={counts.allowed}
                accent="text-green-600 dark:text-green-400"
              />
              <Metric
                label={t('home.denied')}
                value={counts.denied}
                accent={counts.denied > 0 ? 'text-red-600 dark:text-red-400' : 'text-fg'}
              />
              <Metric
                label={t('home.uniqueMembers')}
                value={counts.unique_members}
                accent="text-fg"
              />
            </div>
            {(digest?.guests_today ?? 0) > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                <span className="text-sm text-fg-muted">{t('home.guestPasses')}</span>
                <span className="text-sm font-semibold tabular-nums text-fg">
                  {digest?.guests_today}
                </span>
              </div>
            )}
            {/* The digest exposes counts, not per-entry rows — say where the
                individual entries live rather than inventing a list here. */}
            <p className="py-3 text-xs text-fg-muted">{t('home.checkInsNote')}</p>
          </>
        )}
      </DetailSheet>
    );
  }

  if (id === 'collected') {
    const payments = digest?.payments_today;
    const rows = payments?.rows ?? [];
    return (
      <DetailSheet
        title={t('home.sheetCollected')}
        subtitle={
          payments
            ? `${payments.count} ${t('home.paymentsSummary')} · ${payments.total.toLocaleString()} ${t('common.birr')}`
            : undefined
        }
        viewAllTo="/payments"
        onClose={onClose}
      >
        {loading ? (
          <SheetLoading />
        ) : rows.length === 0 ? (
          <SheetEmpty messageKey="home.emptyPayments" />
        ) : (
          <div>
            {rows.map((row) => (
              <SheetRow
                key={row.id}
                name={row.member_name}
                sub={`${row.method} · ${timeOf(row.created_at)}`}
                tone="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                trailing={
                  <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">
                    {Number(row.amount).toLocaleString()} {t('common.birr')}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </DetailSheet>
    );
  }

  if (id === 'expiring') {
    const rows = digest?.expiring ?? [];
    return (
      <DetailSheet
        title={t('home.sheetExpiring')}
        subtitle={`${stats?.expiring_in_7_days ?? rows.length} ${t('home.membersSummary')}`}
        viewAllTo="/today"
        onClose={onClose}
      >
        {loading ? (
          <SheetLoading />
        ) : rows.length === 0 ? (
          <SheetEmpty messageKey="home.emptyExpiring" />
        ) : (
          <div>
            {rows.map((member) => (
              <SheetRow
                key={member.id}
                to={`/members/${member.id}`}
                onNavigate={onClose}
                name={member.full_name}
                sub={member.phone ?? t('home.noPhone')}
                tone="bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                trailing={
                  <span className={`text-xs font-semibold ${daysLeftColor[member.status]}`}>
                    {daysLeftText(member.days_left)}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </DetailSheet>
    );
  }

  const rows = digest?.new_members ?? [];
  return (
    <DetailSheet
      title={t('home.sheetNew')}
      subtitle={`${rows.length} ${t('home.membersSummary')}`}
      viewAllTo="/members"
      onClose={onClose}
    >
      {loading ? (
        <SheetLoading />
      ) : rows.length === 0 ? (
        <SheetEmpty messageKey="home.emptyNew" />
      ) : (
        <div>
          {rows.map((member) => (
            <SheetRow
              key={member.id}
              to={`/members/${member.id}`}
              onNavigate={onClose}
              name={member.full_name}
              sub={member.phone ?? t('home.noPhone')}
              tone="bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"
              trailing={
                <span className="text-right">
                  {member.plan_name && (
                    <span className="block max-w-[7rem] truncate text-xs font-medium text-fg">
                      {member.plan_name}
                    </span>
                  )}
                  <span className="block text-[11px] tabular-nums text-fg-muted">
                    {timeOf(member.created_at)}
                  </span>
                </span>
              }
            />
          ))}
        </div>
      )}
    </DetailSheet>
  );
}

/* --------------------------------------------------------- quick actions */

const ACTIONS: readonly { to: string; key: StringKey; Icon: ComponentType<{ className?: string }> }[] = [
  { to: '/members/enroll', key: 'home.actionEnroll', Icon: UserPlusIcon },
  { to: '/members', key: 'home.actionMembers', Icon: MembersIcon },
  { to: '/payments', key: 'home.actionPayments', Icon: PaymentsIcon },
  { to: '/live', key: 'home.actionLive', Icon: LiveIcon },
];

function QuickActions() {
  return (
    <section>
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-fg-muted">
        {t('home.quickActions')}
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map(({ to, key, Icon }) => (
          <Link
            key={key}
            to={to}
            className="flex flex-col items-center gap-1.5 rounded-xl py-2 active:bg-surface-2"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-fg">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[11px] font-medium text-fg-muted">{t(key)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------- needs attention */

interface ExpiringRow {
  id: number;
  full_name: string;
  status: MemberStatus;
  days_left: number;
}

function Attention({ items, loading }: { items: ExpiringRow[]; loading: boolean }) {
  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          {t('home.needsAttention')}
        </h2>
        <Link to="/today" className="text-xs font-medium text-sky-600 dark:text-sky-400">
          {t('home.viewAll')}
        </Link>
      </div>

      {loading ? (
        <div className="card space-y-3 p-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-surface-2" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-lg dark:bg-green-500/10">
            ✓
          </span>
          <p className="text-sm text-fg-muted">{t('home.allGood')}</p>
        </div>
      ) : (
        <div className="card p-0">
          <ul>
            {items.map((member, index) => (
              <li key={member.id}>
                <Link
                  to={`/members/${member.id}`}
                  className={`flex min-h-touch items-center gap-3 px-4 py-3 active:bg-surface-2 ${
                    index > 0 ? 'border-t border-line' : ''
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 ${
                      daysLeftColor[member.status]
                    }`}
                  >
                    <AlertIcon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">{member.full_name}</span>
                    <span className={`block text-xs font-medium ${daysLeftColor[member.status]}`}>
                      {daysLeftText(member.days_left)}
                    </span>
                  </span>

                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-fg-subtle" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------- error */

function ErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertIcon className="h-6 w-6" />
      </span>
      <p className="text-sm text-fg-muted">{t('home.offline')}</p>
      <button type="button" onClick={onRetry} className="btn-secondary min-h-touch w-full">
        {t('home.retry')}
      </button>
    </div>
  );
}
