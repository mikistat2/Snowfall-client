import { useEffect, useState } from 'react';
import { GYM_FROZEN_EVENT } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

/**
 * Full-screen alert shown the moment any API call reports the gym was frozen
 * by the platform admin (403 GYM_FROZEN). Mounted once in the app layout, so
 * it appears on every page — otherwise pages would just sit on "Loading…".
 */
export function FrozenGymAlert() {
  const [message, setMessage] = useState<string | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handler = (e: Event) =>
      setMessage(
        (e as CustomEvent<string | undefined>).detail ||
          'This gym account has been frozen by the platform. Please contact support.',
      );
    window.addEventListener(GYM_FROZEN_EVENT, handler);
    return () => window.removeEventListener(GYM_FROZEN_EVENT, handler);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-4xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-slate-900">Account frozen</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        <p className="mt-2 text-xs text-slate-400">
          Your data is safe — members, payments and history are untouched. Access is restored as soon as the
          issue is resolved.
        </p>
        <button className="btn-primary mt-6 w-full" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
