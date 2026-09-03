import { t } from '../i18n/strings';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useDashboardStats } from '../hooks/queries/useDashboard';
import { useGymSettings } from '../hooks/queries/useSettings';
import { SexSplit } from '../components/ui/SexSplit';
import {
  CashIcon,
  ClockIcon,
  DoorInIcon,
  UserIcon,
  UsersIcon,
} from '../components/ui/icons';
import { statTone, type StatTone } from '../lib/colors';
import { useState, type ComponentType, type ReactNode } from 'react';

/** One headline number. `tone` selects a palette defined in index.css. */
interface Tile {
  label: string;
  value: ReactNode;
  tone: StatTone;
  Icon: ComponentType<{ className?: string }>;
  /** Deepens the wash. For the one number the page is really about. */
  strong?: boolean;
}

export function DashboardPage() {
  const { gym } = useAuth();
  const [liveOccupancy, setLiveOccupancy] = useState<number | null>(null);
  const { data, isLoading } = useDashboardStats();
  // A gym running without a camera records no check-ins and has no live
  // occupancy, so those two tiles would sit at zero forever. They are given
  // over to the roster instead: how many members there are, and their split.
  const { data: gymSettings } = useGymSettings();
  const cameraEnabled = gymSettings?.settings.camera_enabled ?? true;

  useSocket({
    'occupancy:update': (payload: { count: number }) => setLiveOccupancy(payload.count),
  });

  if (isLoading || !data) return <p className="text-fg-subtle">{t('common.loading')}</p>;

  const revenueTile: Tile = {
    label: t('dashboard.revenue'),
    value: `${data.revenue_this_month.toLocaleString()} ${t('common.birr')}`,
    tone: 'emerald',
    Icon: CashIcon,
  };
  const expiringTile: Tile = {
    label: t('dashboard.expiringSoon'),
    value: data.expiring_in_7_days,
    tone: 'amber',
    Icon: ClockIcon,
  };

  // Tone is per slot, not per metric: whichever pair the gym's camera setting
  // puts in the first two positions, the grid reads sky → violet → emerald →
  // amber left to right, so the two layouts feel like the same dashboard.
  const tiles: Tile[] = cameraEnabled
    ? [
        {
          label: t('dashboard.checkInsToday'),
          value: data.check_ins_today,
          tone: 'sky',
          Icon: DoorInIcon,
        },
        {
          label: t('dashboard.occupancy'),
          value: liveOccupancy ?? data.occupancy,
          tone: 'violet',
          Icon: UsersIcon,
        },
        revenueTile,
        expiringTile,
      ]
    : [
        {
          label: t('dashboard.membersTotal'),
          value: data.members_total,
          tone: 'sky',
          Icon: UsersIcon,
          // The roster size is the headline for a gym running without a camera
          // — every other tile on this row is a detail off the back of it.
          strong: true,
        },
        {
          label: t('dashboard.bySex'),
          value: <SexSplit male={data.members_by_sex.male} female={data.members_by_sex.female} />,
          tone: 'violet',
          Icon: UserIcon,
        },
        revenueTile,
        expiringTile,
      ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="gym-name text-3xl leading-tight sm:text-5xl">{gym?.name ?? t('app.name')}</h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {t('dashboard.title')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={`stat-card ${statTone[tile.tone]} ${tile.strong ? 'stat-strong' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="stat-label">{tile.label}</p>
                <p className="stat-value sm:text-3xl">{tile.value}</p>
              </div>
              <span className="stat-icon" aria-hidden>
                <tile.Icon className="h-[18px] w-[18px]" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Peak hours is a histogram of check-ins; with no camera there are none
          to plot, so an empty chart would just be furniture. */}
      {cameraEnabled ? (
        <PeakHoursChart data={data.peak_hours} />
      ) : (
        <p className="text-center text-xs text-fg-muted">{t('dashboard.noCameraHint')}</p>
      )}
    </div>
  );
}

/**
 * Single-series bar chart: check-ins per hour of day, last 14 days.
 * One neutral hue (identity is carried by the title, no legend needed),
 * hover tooltip per bar, only the peak hour is direct-labeled.
 */
function PeakHoursChart({ data }: { data: { hour: number; count: number }[] }) {
  const byHour = new Map(data.map((d) => [d.hour, d.count]));
  const hours = Array.from({ length: 17 }, (_, i) => i + 5); // 05:00–21:00
  const max = Math.max(1, ...data.map((d) => d.count));
  const peakHour = data.reduce((best, d) => (d.count > (byHour.get(best) ?? 0) ? d.hour : best), hours[0]!);

  return (
    <section className="card overflow-x-auto">
      <h2 className="mb-4 text-sm font-semibold text-fg">{t('dashboard.peakHours')}</h2>
      <div className="flex h-44 min-w-[420px] items-end gap-1.5" role="img" aria-label={t('dashboard.peakHours')}>
        {hours.map((hour) => {
          const count = byHour.get(hour) ?? 0;
          const isPeak = hour === peakHour && count > 0;
          return (
            <div key={hour} className="group relative flex h-full flex-1 flex-col justify-end">
              {isPeak && (
                <span className="mb-1 text-center text-xs font-semibold text-fg">{count}</span>
              )}
              <div
                className="min-h-[2px] rounded-t bg-slate-700 transition-colors group-hover:bg-slate-500"
                style={{ height: `${(count / max) * 100}%` }}
              />
              <span className="mt-1 text-center text-[10px] text-fg-subtle">{hour}</span>
              <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                {String(hour).padStart(2, '0')}:00 · {count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
