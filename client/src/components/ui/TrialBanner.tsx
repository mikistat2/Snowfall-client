import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

/**
 * Free-trial promo banner. Renders nothing unless the platform admin has
 * turned trial mode on (public /auth/registration-mode endpoint), so the
 * landing + registration pages advertise the offer automatically.
 */
export function TrialBanner({ variant }: { variant: 'landing' | 'register' }) {
  const { data } = useQuery({
    queryKey: ['registration-mode'],
    queryFn: async () =>
      (await api.get<{ trial_mode: boolean; trial_days: number }>('/auth/registration-mode')).data,
    staleTime: 60_000,
    retry: false,
  });

  if (!data?.trial_mode) return null;
  const days = data.trial_days;

  if (variant === 'landing') {
    // glowing pill over the dark hero image
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/40 bg-gradient-to-r from-violet-600/90 to-sky-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 backdrop-blur">
        <span className="animate-bounce text-lg" aria-hidden>
          🎁
        </span>
        <span>
          Limited offer — <span className="font-black">{days}-day FREE trial</span> · start instantly, no
          approval needed
        </span>
      </div>
    );
  }

  // gradient card at the top of the registration form
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-sky-600 to-sky-500 px-4 py-3 text-white shadow-lg shadow-sky-500/30">
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative flex items-center gap-3">
        <span className="animate-bounce text-3xl" aria-hidden>
          🎁
        </span>
        <div>
          <div className="font-bold leading-tight">Free trial is ON — {days} days on us!</div>
          <div className="mt-0.5 text-xs leading-relaxed text-sky-100">
            Register now and your gym starts <b>instantly</b> — full access, no waiting for admin approval.
          </div>
        </div>
      </div>
    </div>
  );
}
