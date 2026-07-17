import { useEffect, useState, type FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformApi, platformToken } from '../lib/platformApi';
import { apiErrorMessage } from '../lib/api';
import { Logo } from '../components/ui/Logo';
import { Modal } from '../components/ui/Modal';

/**
 * /platform — hidden control panel for the product owner (platform admin).
 * Separate login from gym accounts: credentials come from the server env
 * (PLATFORM_ADMIN_EMAIL / PLATFORM_ADMIN_PASSWORD).
 */

interface Overview {
  total_gyms: number;
  active_gyms: number;
  frozen_gyms: number;
  new_gyms_30d: number;
  total_members: number;
  total_staff: number;
  checkins_7d: number;
  revenue_total: string;
  revenue_30d: string;
}

interface GymRow {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  status: 'active' | 'frozen';
  frozen_at: string | null;
  admin_note: string | null;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  staff_count: number;
  member_count: number;
  active_member_count: number;
  revenue_total: string;
  revenue_30d: string;
  last_checkin_at: string | null;
}

interface StaffRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'owner' | 'staff';
  created_at: string;
}

function money(v: string | number): string {
  return `${Number(v).toLocaleString()} ETB`;
}

function ago(date: string | null): string {
  if (!date) return 'never';
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

export function PlatformAdminPage() {
  const [authed, setAuthed] = useState(() => Boolean(platformToken.get()));
  return authed ? (
    <AdminDashboard
      onLogout={() => {
        platformToken.clear();
        setAuthed(false);
      }}
    />
  ) : (
    <AdminLogin onSuccess={() => setAuthed(true)} />
  );
}

// ---------------------------------------------------------------- login ----

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await platformApi.post<{ token: string }>('/login', { email, password });
      platformToken.set(data.token);
      onSuccess();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-2 pb-2">
          <Logo size="h-14 w-14" tile />
          <h1 className="text-lg font-bold">Platform Control</h1>
          <p className="text-center text-xs text-slate-500">
            Product-owner access only. Gym accounts cannot log in here.
          </p>
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

// ------------------------------------------------------------ dashboard ----

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<GymRow | null>(null);
  const [banner, setBanner] = useState('');

  // action confirmation banner (e.g. "Gym frozen. Owner alerted via Telegram ✓ · Email ✓")
  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(''), 8000);
    return () => clearTimeout(timer);
  }, [banner]);

  const overviewQ = useQuery({
    queryKey: ['platform-overview'],
    queryFn: async () => (await platformApi.get<Overview>('/overview')).data,
    retry: false,
  });

  const gymsQ = useQuery({
    queryKey: ['platform-gyms', search],
    queryFn: async () =>
      (await platformApi.get<GymRow[]>('/gyms', { params: { search: search || undefined } })).data,
    retry: false,
  });

  // expired/invalid platform token → back to login
  useEffect(() => {
    const err = overviewQ.error ?? gymsQ.error;
    if (err instanceof AxiosError && (err.response?.status === 401 || err.response?.status === 403)) {
      onLogout();
    }
  }, [overviewQ.error, gymsQ.error, onLogout]);

  const gyms = gymsQ.data ?? [];
  const ov = overviewQ.data;

  const stats = ov
    ? [
        { label: 'Gyms', value: ov.total_gyms, sub: `${ov.new_gyms_30d} new in 30d` },
        { label: 'Active', value: ov.active_gyms, sub: `${ov.frozen_gyms} frozen` },
        { label: 'Members', value: ov.total_members, sub: `${ov.total_staff} staff accounts` },
        { label: 'Check-ins (7d)', value: ov.checkins_7d, sub: 'across all gyms' },
        { label: 'Payments processed', value: money(ov.revenue_total), sub: `${money(ov.revenue_30d)} in 30d` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Logo size="h-9 w-9" tile />
          <div>
            <div className="text-sm font-bold leading-tight">Platform Control</div>
            <div className="text-xs text-slate-400">Manage the gyms using your platform</div>
          </div>
          <button
            onClick={onLogout}
            className="ml-auto rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        {banner && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {banner}
          </div>
        )}

        {/* overview cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="card p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</div>
              <div className="mt-1 truncate text-xl font-bold">{s.value}</div>
              <div className="text-xs text-slate-400">{s.sub}</div>
            </div>
          ))}
          {!ov && <div className="col-span-full py-2 text-center text-sm text-slate-400">Loading overview…</div>}
        </div>

        {/* gyms table */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Gyms</h2>
          <input
            className="input max-w-xs"
            placeholder="Search by gym or owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Gym</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Revenue (30d)</th>
                <th className="px-4 py-3">Last check-in</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {gymsQ.isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {gyms.map((g) => (
                <tr key={g.id} className={`border-b border-slate-100 last:border-0 ${g.status === 'frozen' ? 'bg-sky-50/60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{g.name}</div>
                    <div className="text-xs text-slate-400">{g.address ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{g.owner_name ?? '—'}</div>
                    <div className="text-xs text-slate-400">{g.owner_email ?? ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{g.active_member_count}</span>
                    <span className="text-slate-400"> / {g.member_count}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{money(g.revenue_30d)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{ago(g.last_checkin_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(g.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {g.status === 'frozen' ? (
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                        Frozen
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-secondary px-3 py-1.5" onClick={() => setSelected(g)}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {!gymsQ.isLoading && gyms.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No gyms found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {selected && (
        <ManageGymModal
          gym={selected}
          onClose={() => setSelected(null)}
          onBanner={setBanner}
          onChanged={() => {
            void qc.invalidateQueries({ queryKey: ['platform-gyms'] });
            void qc.invalidateQueries({ queryKey: ['platform-overview'] });
          }}
        />
      )}
    </div>
  );
}

// --------------------------------------------------------- manage modal ----

function ManageGymModal({
  gym,
  onClose,
  onChanged,
  onBanner,
}: {
  gym: GymRow;
  onClose: () => void;
  onChanged: () => void;
  onBanner: (msg: string) => void;
}) {
  const [note, setNote] = useState(gym.admin_note ?? '');
  const [freezeNote, setFreezeNote] = useState('');
  const [deleteNote, setDeleteNote] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [view, setView] = useState<'detail' | 'freeze' | 'delete'>('detail');
  const [error, setError] = useState('');

  const detailQ = useQuery({
    queryKey: ['platform-gym', gym.id],
    queryFn: async () => (await platformApi.get<GymRow & { staff: StaffRow[] }>(`/gyms/${gym.id}`)).data,
  });

  const doneAndClose = (action: string) => (data: unknown) => {
    onChanged();
    onBanner(`${action} ${notifiedSummary(data)}`.trim());
    onClose();
  };
  const freeze = useMutationHelper(
    () => platformApi.post(`/gyms/${gym.id}/freeze`, { note: freezeNote || undefined }),
    doneAndClose(`"${gym.name}" is now frozen.`),
    setError,
  );
  const unfreeze = useMutationHelper(
    () => platformApi.post(`/gyms/${gym.id}/unfreeze`),
    doneAndClose(`"${gym.name}" has been reactivated.`),
    setError,
  );
  const remove = useMutationHelper(
    () => platformApi.delete(`/gyms/${gym.id}`, { data: { confirm_name: confirmName, note: deleteNote || undefined } }),
    doneAndClose(`"${gym.name}" was permanently deleted.`),
    setError,
  );
  const saveNote = useMutationHelper(
    () => platformApi.put(`/gyms/${gym.id}/note`, { note: note || null }),
    onChanged,
    setError,
  );

  const d = detailQ.data;

  return (
    <Modal title={gym.name} onClose={onClose} wide>
      {view === 'detail' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Info label="Status" value={gym.status === 'frozen' ? `Frozen ${ago(gym.frozen_at)}` : 'Active'} />
            <Info label="Joined" value={new Date(gym.created_at).toLocaleDateString()} />
            <Info label="Members (active / all)" value={`${gym.active_member_count} / ${gym.member_count}`} />
            <Info label="Staff accounts" value={String(gym.staff_count)} />
            <Info label="Revenue total" value={money(gym.revenue_total)} />
            <Info label="Revenue 30d" value={money(gym.revenue_30d)} />
            <Info label="Last check-in" value={ago(gym.last_checkin_at)} />
            <Info label="Phone" value={gym.phone ?? '—'} />
          </div>

          <div>
            <div className="label">Owner</div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="font-medium">{gym.owner_name ?? '—'}</span>
              <span className="text-slate-500"> · {gym.owner_email ?? '—'} · {gym.owner_phone ?? 'no phone'}</span>
            </div>
          </div>

          <div>
            <div className="label">Staff</div>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
              {(d?.staff ?? []).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-slate-400"> · {s.email}</span>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{s.role}</span>
                </div>
              ))}
              {detailQ.isLoading && <div className="px-3 py-2 text-slate-400">Loading…</div>}
            </div>
          </div>

          <div>
            <div className="label">Private note (only you see this)</div>
            <textarea
              className="input min-h-[70px]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. paid until September, contacted about renewal…"
            />
            <button className="btn-secondary mt-2" onClick={() => saveNote.run()} disabled={saveNote.busy}>
              {saveNote.busy ? 'Saving…' : saveNote.done ? 'Saved ✓' : 'Save note'}
            </button>
          </div>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            {gym.status === 'active' ? (
              <button className="btn-secondary" onClick={() => setView('freeze')}>
                ❄️ Freeze account
              </button>
            ) : (
              <button className="btn-primary" onClick={() => unfreeze.run()} disabled={unfreeze.busy}>
                {unfreeze.busy ? 'Unfreezing…' : 'Unfreeze account'}
              </button>
            )}
            <button className="btn-danger" onClick={() => setView('delete')}>
              Delete gym
            </button>
          </div>
        </div>
      )}

      {view === 'freeze' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Freezing <b>{gym.name}</b> immediately locks out all of its staff (active sessions are revoked) and
            blocks logins until you unfreeze it. No data is deleted.
          </p>
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">
            The owner is alerted automatically (Telegram + email) — the reason below is included in that
            message, so they know why and how to fix it.
          </p>
          <div>
            <label className="label">Reason (sent to the owner)</label>
            <textarea
              className="input min-h-[70px]"
              value={freezeNote}
              onChange={(e) => setFreezeNote(e.target.value)}
              placeholder="e.g. subscription unpaid since June — contact me to reactivate"
            />
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setView('detail')}>
              Back
            </button>
            <button className="btn-primary" onClick={() => freeze.run()} disabled={freeze.busy}>
              {freeze.busy ? 'Freezing…' : 'Freeze account'}
            </button>
          </div>
        </div>
      )}

      {view === 'delete' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            <b>This cannot be undone.</b> All of this gym's data — members, face descriptors, subscriptions,
            payments, check-ins and staff accounts — will be permanently deleted. If you just want to lock them
            out, use <b>Freeze</b> instead.
          </div>
          <p className="text-sm text-slate-600">
            The owner will receive a final alert (Telegram + email) before deletion; the reason below is
            included.
          </p>
          <div>
            <label className="label">Reason (optional, sent to the owner)</label>
            <textarea
              className="input min-h-[60px]"
              value={deleteNote}
              onChange={(e) => setDeleteNote(e.target.value)}
              placeholder="e.g. account closed at your request"
            />
          </div>
          <div>
            <label className="label">
              Type the gym name (<span className="normal-case">{gym.name}</span>) to confirm
            </label>
            <input className="input" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setView('detail')}>
              Back
            </button>
            <button
              className="btn-danger"
              onClick={() => remove.run()}
              disabled={remove.busy || confirmName !== gym.name}
            >
              {remove.busy ? 'Deleting…' : 'Permanently delete'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

/** Tiny mutation wrapper: run/busy/done + error → setError. */
function useMutationHelper(
  fn: () => Promise<{ data: unknown }>,
  onSuccess: (data: unknown) => void,
  setError: (m: string) => void,
) {
  const m = useMutation({
    mutationFn: fn,
    onSuccess: (res) => {
      setError('');
      onSuccess(res.data);
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });
  return { run: () => m.mutate(), busy: m.isPending, done: m.isSuccess };
}

/** "Owner alerted via Telegram ✓ · Email —" from the API's `notified` field. */
function notifiedSummary(data: unknown): string {
  const n = (data as { notified?: { telegram: boolean; email: boolean } } | undefined)?.notified;
  if (!n) return '';
  if (!n.telegram && !n.email)
    return 'Owner could NOT be alerted (no Telegram linked, email not configured).';
  return `Owner alerted via ${[n.telegram ? 'Telegram ✓' : 'Telegram —', n.email ? 'Email ✓' : 'Email —'].join(' · ')}`;
}
