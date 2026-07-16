import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { t } from '../i18n/strings';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useState } from 'react';
import type { DashboardStats } from '../lib/types';

export function DashboardPage() {
  const { gym } = useAuth();
  const [liveOccupancy, setLiveOccupancy] = useState<number | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardStats>('/dashboard/stats')).data,
    refetchInterval: 60_000,
  });

  useSocket({
    'occupancy:update': (payload: { count: number }) => setLiveOccupancy(payload.count),
  });

  if (isLoading || !data) return <p className="text-slate-400">{t('common.loading')}</p>;

  const tiles = [
    { label: t('dashboard.checkInsToday'), value: data.check_ins_today },
    { label: t('dashboard.occupancy'), value: liveOccupancy ?? data.occupancy },
    { label: t('dashboard.revenue'), value: `${data.revenue_this_month.toLocaleString()} ${t('common.birr')}` },
    { label: t('dashboard.expiringSoon'), value: data.expiring_in_7_days },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="gym-name text-5xl leading-tight">{gym?.name ?? t('app.name')}</h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('dashboard.title')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tile.label}</p>
            <p className="mt-1 text-3xl font-bold">{tile.value}</p>
          </div>
        ))}
      </div>

      <PeakHoursChart data={data.peak_hours} />
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
    <section className="card">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">{t('dashboard.peakHours')}</h2>
      <div className="flex h-44 items-end gap-1.5" role="img" aria-label={t('dashboard.peakHours')}>
        {hours.map((hour) => {
          const count = byHour.get(hour) ?? 0;
          const isPeak = hour === peakHour && count > 0;
          return (
            <div key={hour} className="group relative flex h-full flex-1 flex-col justify-end">
              {isPeak && (
                <span className="mb-1 text-center text-xs font-semibold text-slate-700">{count}</span>
              )}
              <div
                className="min-h-[2px] rounded-t bg-slate-700 transition-colors group-hover:bg-slate-500"
                style={{ height: `${(count / max) * 100}%` }}
              />
              <span className="mt-1 text-center text-[10px] text-slate-400">{hour}</span>
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
