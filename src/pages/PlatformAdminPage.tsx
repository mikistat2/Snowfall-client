import { useEffect, useState, type FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformApi, platformToken, platformProfile, type PlatformPerms, type PlatformProfile } from '../lib/platformApi';
import { apiErrorMessage } from '../lib/api';
import { Logo } from '../components/ui/Logo';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { BillingAdmin } from '../components/billing/BillingAdmin';
import type { BillingCycle } from '../lib/billing';
import { RecordPaymentSection } from '../components/billing/RecordPaymentSection';
import loginLogo from "../assets/images/login-logo.png";

/**
 * /platform — hidden control panel for the product owner (platform admin).
 * Separate login from gym accounts: credentials come from the server env
 * (PLATFORM_ADMIN_EMAIL / PLATFORM_ADMIN_PASSWORD).
 */

interface Overview {
  total_gyms: number;
  active_gyms: number;
  frozen_gyms: number;
  pending_gyms: number;
  trial_gyms: number;
  expiring_30d: number;
  expired_subs: number;
  new_gyms_30d: number;
  total_members: number;
  total_staff: number;
  checkins_7d: number;
  revenue_total: string;
  revenue_30d: string;
}

interface PlatformSettings {
  trial_mode: boolean;
  trial_days: number;
}

interface GymRow {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  status: 'pending' | 'active' | 'frozen';
  frozen_at: string | null;
  /** Private to this panel. */
  admin_note: string | null;
  /** The reason the gym's own staff see on every screen while frozen. */
  freeze_note: string | null;
  approved_at: string | null;
  subscription_ends_at: string | null;
  is_trial: boolean;
  /** Permanently exempt from the subscription paywall. */
  comped?: boolean;
  /** Platform feature entitlements — owner-only switches. */
  camera_allowed?: boolean;
  telegram_allowed?: boolean;
  /** The package last paid for. Null until the gym's first verified payment. */
  plan_name: string | null;
  billing_cycle: 'MONTHLY' | 'YEARLY' | null;
  /**
   * What that package includes. Paying GRANTS these automatically; nothing
   * ever revokes them, so a gym can legitimately hold a feature its current
   * package does not include — the card below says so rather than hiding it.
   */
  plan_camera: boolean | null;
  plan_telegram: boolean | null;
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

function daysLeft(date: string | null): number | null {
  if (!date) return null;
  return Math.floor((new Date(date).getTime() - Date.now()) / 86_400_000);
}

function StatusBadge({ gym }: { gym: GymRow }) {
  if (gym.status === 'pending')
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Pending</span>
    );
  if (gym.status === 'frozen')
    return <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">Frozen</span>;
  if (gym.is_trial)
    return (
      <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
        Free trial
      </span>
    );
  return (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
  );
}

/** Subscription cell: end date + a colored days-left chip. */
function SubscriptionCell({ gym }: { gym: GymRow }) {
  if (gym.status === 'pending') return <span className="text-slate-400">—</span>;
  const left = daysLeft(gym.subscription_ends_at);
  if (left === null) return <span className="text-slate-400">—</span>;
  const chip =
    left < 0
      ? { text: 'expired', cls: 'bg-red-100 text-red-700' }
      : left <= 7
        ? { text: `${left}d left`, cls: 'bg-red-100 text-red-700' }
        : left <= 30
          ? { text: `${left}d left`, cls: 'bg-amber-100 text-amber-700' }
          : { text: `${left}d left`, cls: 'bg-slate-100 text-slate-500' };
  return (
    <span className="whitespace-nowrap">
      {String(gym.subscription_ends_at).slice(0, 10)}{' '}
      <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${chip.cls}`}>{chip.text}</span>
    </span>
  );
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
      const { data } = await platformApi.post<{ token: string } & PlatformProfile>('/login', { email, password });
      platformToken.set(data.token);
      platformProfile.set({ role: data.role, name: data.name, permissions: data.permissions });
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
            Platform owner &amp; admin access only. Gym accounts cannot log in here.
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
  const [backingUp, setBackingUp] = useState(false);

  // full member backup of every gym, rendered client-side as one PDF
  async function downloadBackup() {
    setBackingUp(true);
    try {
      const [{ downloadPlatformBackupPdf }, { data }] = await Promise.all([
        import('../lib/membersPdf'),
        platformApi.get<import('../lib/membersPdf').GymBackupEntry[]>('/export'),
      ]);
      await downloadPlatformBackupPdf(data);
      const total = data.reduce((sum, e) => sum + e.members.length, 0);
      setBanner(`Backup PDF downloaded — ${data.length} gyms, ${total} members. Keep it somewhere safe.`);
    } catch (err) {
      setBanner(`Backup failed: ${apiErrorMessage(err)}`);
    } finally {
      setBackingUp(false);
    }
  }

  // action confirmation banner (e.g. "Gym frozen. Owner alerted via Telegram ✓ · Email ✓")
  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(''), 8000);
    return () => clearTimeout(timer);
  }, [banner]);

  // live role + permissions — re-checked from the server so a permission
  // change (or removal) by the owner is picked up without re-login
  const meQ = useQuery({
    queryKey: ['platform-me'],
    queryFn: async () => {
      const { data } = await platformApi.get<PlatformProfile>('/me');
      platformProfile.set(data);
      return data;
    },
    retry: false,
  });
  const profile = meQ.data ?? platformProfile.get();
  const isOwner = profile?.role === 'owner';
  const perms: PlatformPerms = profile?.permissions ?? {
    approve: false,
    freeze: false,
    renew: false,
    export: false,
  };

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

  // expired/invalid/revoked platform token → back to login
  useEffect(() => {
    const err = meQ.error ?? overviewQ.error ?? gymsQ.error;
    if (err instanceof AxiosError && (err.response?.status === 401 || err.response?.status === 403)) {
      onLogout();
    }
  }, [meQ.error, overviewQ.error, gymsQ.error, onLogout]);

  const gyms = gymsQ.data ?? [];
  const ov = overviewQ.data;

  const stats = ov
    ? [
        { label: 'Gyms', value: ov.total_gyms, sub: `${ov.new_gyms_30d} new in 30d` },
        {
          label: 'Pending approval',
          value: ov.pending_gyms,
          sub: ov.pending_gyms > 0 ? 'waiting for you!' : 'nothing to review',
          highlight: ov.pending_gyms > 0,
        },
        { label: 'Active', value: ov.active_gyms, sub: `${ov.frozen_gyms} frozen · ${ov.trial_gyms} on trial` },
        {
          label: 'Subs ending ≤30d',
          value: ov.expiring_30d,
          sub: ov.expired_subs > 0 ? `${ov.expired_subs} already expired!` : 'none expired',
          highlight: ov.expired_subs > 0,
        },
        { label: 'Members', value: ov.total_members, sub: `${ov.total_staff} staff accounts` },
        { label: 'Check-ins (7d)', value: ov.checkins_7d, sub: 'across all gyms' },
        { label: 'Payments processed', value: money(ov.revenue_total), sub: `${money(ov.revenue_30d)} in 30d` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-100" style={{ backgroundImage: `url(${loginLogo})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x' }}>
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Logo size="h-9 w-9" tile />
          <div>
            <div className="text-sm font-bold leading-tight">Platform Control</div>
            <div className="text-xs text-slate-400">
              {isOwner
                ? 'Signed in as the platform owner'
                : `${profile?.name ?? 'Admin'} · limited access granted by the owner`}
            </div>
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {stats.map((s) => (
            <div key={s.label} className={`card p-4 ${'highlight' in s && s.highlight ? 'border-amber-300 bg-amber-50' : ''}`}>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</div>
              <div className="mt-1 truncate text-xl font-bold">{s.value}</div>
              <div className="text-xs text-slate-400">{s.sub}</div>
            </div>
          ))}
          {!ov && <div className="col-span-full py-2 text-center text-sm text-slate-400">Loading overview…</div>}
        </div>

        {isOwner && <RegistrationModeCard onBanner={setBanner} />}
        {isOwner && <BillingAdmin onBanner={setBanner} />}
        {isOwner && <TeamCard onBanner={setBanner} />}

        {/* gyms table */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">Gyms</h2>
          <input
            className="input max-w-xs"
            placeholder="Search by gym or owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {perms.export && (
            <button className="btn-secondary ml-auto" onClick={() => void downloadBackup()} disabled={backingUp}>
              {backingUp ? 'Building backup…' : '⬇ Backup all gyms (PDF)'}
            </button>
          )}
        </div>

        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Gym</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Revenue (30d)</th>
                <th className="px-4 py-3">Subscription ends</th>
                <th className="px-4 py-3">Last check-in</th>
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
                <tr
                  key={g.id}
                  className={`border-b border-slate-100 last:border-0 ${
                    g.status === 'frozen' ? 'bg-sky-50/60' : g.status === 'pending' ? 'bg-amber-50/60' : ''
                  }`}
                >
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
                  <td className="px-4 py-3 text-slate-500">
                    <SubscriptionCell gym={g} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{ago(g.last_checkin_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge gym={g} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button className="btn-secondary px-3 py-1.5" onClick={() => setSelected(g)}>
                      {g.status === 'pending' ? 'Review' : 'Manage'}
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
          isOwner={isOwner}
          perms={perms}
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

// ------------------------------------------------- registration mode card ----

/** Global switch: new gyms wait for approval, or start a free trial instantly. */
function RegistrationModeCard({ onBanner }: { onBanner: (msg: string) => void }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => (await platformApi.get<PlatformSettings>('/settings')).data,
    retry: false,
  });
  const [days, setDays] = useState<number | null>(null);
  const trialDays = days ?? data?.trial_days ?? 30;

  const save = useMutation({
    mutationFn: async (patch: Partial<PlatformSettings>) => (await platformApi.put('/settings', patch)).data,
    onSuccess: (updated: PlatformSettings) => {
      qc.setQueryData(['platform-settings'], updated);
      onBanner(
        updated.trial_mode
          ? `Free-trial mode is ON — new gyms start a ${updated.trial_days}-day trial instantly, without your approval.`
          : 'Approval mode is ON — new gyms must wait until you approve them.',
      );
    },
  });

  if (!data) return null;
  return (
    <div className="card flex flex-wrap items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">New gym registrations</div>
        <div className="text-xs text-slate-500">
          {data.trial_mode
            ? `Free-trial mode: new gyms get ${data.trial_days} days instantly — you are notified by email of every trial signup.`
            : 'Approval mode: new gyms wait on a "pending" screen until you approve them here.'}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        Trial days
        <input
          type="number"
          min={1}
          max={365}
          className="input w-20"
          value={trialDays}
          onChange={(e) => setDays(Number(e.target.value))}
          onBlur={() => {
            if (days !== null && days !== data.trial_days && days >= 1 && days <= 365)
              save.mutate({ trial_days: days });
          }}
        />
      </label>
      <button
        className={data.trial_mode ? 'btn-primary' : 'btn-secondary'}
        disabled={save.isPending}
        onClick={() => save.mutate({ trial_mode: !data.trial_mode })}
      >
        {data.trial_mode ? '🎁 Free trial: ON' : 'Free trial: OFF'}
      </button>
    </div>
  );
}

// ------------------------------------------------------------ team card ----

interface AdminRow {
  id: number;
  name: string;
  email: string;
  permissions: PlatformPerms;
  created_at: string;
}

const PERM_LABELS: { key: keyof PlatformPerms; label: string; hint: string }[] = [
  { key: 'approve', label: 'Approve', hint: 'approve pending gym registrations' },
  { key: 'freeze', label: 'Freeze', hint: 'freeze / unfreeze gym accounts' },
  { key: 'renew', label: 'Renew', hint: 'extend subscriptions, convert trials, record payments' },
  { key: 'export', label: 'Export PDFs', hint: 'download member data as PDF' },
];

/**
 * Owner-only: manage sub-admin accounts. Sub-admins can never delete gyms,
 * change platform settings or see this card — the server enforces it too.
 */
function TeamCard({ onBanner }: { onBanner: (msg: string) => void }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const adminsQ = useQuery({
    queryKey: ['platform-admins'],
    queryFn: async () => (await platformApi.get<AdminRow[]>('/admins')).data,
    retry: false,
  });
  const refresh = () => void qc.invalidateQueries({ queryKey: ['platform-admins'] });

  const togglePerm = useMutation({
    mutationFn: async ({ admin, key }: { admin: AdminRow; key: keyof PlatformPerms }) =>
      (
        await platformApi.put(`/admins/${admin.id}`, {
          permissions: { [key]: !admin.permissions[key] },
        })
      ).data,
    onSuccess: () => {
      setError('');
      refresh();
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const removeAdmin = useMutation({
    mutationFn: async (admin: AdminRow) => (await platformApi.delete(`/admins/${admin.id}`)).data,
    onSuccess: (_data, admin) => {
      setError('');
      refresh();
      onBanner(`"${admin.name}" was removed — their session is locked out immediately.`);
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const admins = adminsQ.data ?? [];

  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Platform admins (your team)</div>
          <div className="text-xs text-slate-500">
            They can only do what you allow below — never delete gyms, change settings or manage admins. You can
            remove them anytime and it takes effect instantly.
          </div>
        </div>
        <button className="btn-secondary" onClick={() => setAdding(true)}>
          + Add admin
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {admins.length > 0 && (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
          {admins.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              <div className="min-w-0 flex-1">
                <span className="font-medium">{a.name}</span>
                <span className="text-slate-400"> · {a.email}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PERM_LABELS.map(({ key, label, hint }) => (
                  <button
                    key={key}
                    title={`Click to ${a.permissions[key] ? 'revoke' : 'grant'}: ${hint}`}
                    disabled={togglePerm.isPending}
                    onClick={() => togglePerm.mutate({ admin: a, key })}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                      a.permissions[key]
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-400 line-through hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                disabled={removeAdmin.isPending}
                onClick={() => {
                  if (window.confirm(`Remove admin "${a.name}"? They are locked out immediately.`))
                    removeAdmin.mutate(a);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {!adminsQ.isLoading && admins.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-400">
          No admins yet — add one to delegate approvals and freezes while keeping full control.
        </div>
      )}

      {adding && (
        <AddAdminModal
          onClose={() => setAdding(false)}
          onCreated={(name) => {
            setAdding(false);
            refresh();
            onBanner(`Admin "${name}" created — they sign in at this same /platform page.`);
          }}
        />
      )}
    </div>
  );
}

function AddAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: (name: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perms, setPerms] = useState<PlatformPerms>({ approve: true, freeze: true, renew: true, export: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await platformApi.post('/admins', { name, email, password, permissions: perms });
      onCreated(name);
    } catch (err) {
      setError(apiErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title="Add platform admin" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">
          They log in at this same <b>/platform</b> page with the credentials below. Deleting gyms and changing
          platform settings stay <b>owner-only</b> no matter what you grant here.
        </p>
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Password (min 8 characters)</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={100}
          />
        </div>
        <div>
          <div className="label">Allowed actions</div>
          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            {PERM_LABELS.map(({ key, label, hint }) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={perms[key]}
                  onChange={(e) => setPerms({ ...perms, [key]: e.target.checked })}
                />
                <span className="font-medium">{label}</span>
                <span className="text-xs text-slate-400">— {hint}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create admin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// --------------------------------------------------------- manage modal ----

function ManageGymModal({
  gym,
  isOwner,
  perms,
  onClose,
  onChanged,
  onBanner,
}: {
  gym: GymRow;
  isOwner: boolean;
  perms: PlatformPerms;
  onClose: () => void;
  onChanged: () => void;
  onBanner: (msg: string) => void;
}) {
  const [note, setNote] = useState(gym.admin_note ?? '');
  /**
   * Prefilled so "Edit reason" on a frozen gym opens on the text the staff are
   * currently reading, rather than a blank box that would wipe it on save.
   */
  const [freezeNote, setFreezeNote] = useState(gym.freeze_note ?? '');
  const [deleteNote, setDeleteNote] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [view, setView] = useState<'detail' | 'freeze' | 'delete'>('detail');
  /** The freeze screen doubles as "edit the reason" once the gym is frozen. */
  const alreadyFrozen = gym.status === 'frozen';
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  // Free extension length (no payment recorded) — a trial usually converts onto a month.
  const [renewCycle, setRenewCycle] = useState<BillingCycle>(gym.is_trial ? 'MONTHLY' : 'YEARLY');
  const [trialDays, setTrialDays] = useState(30);
  /** Two-step, because this one SHORTENS access — see the button below. */
  const [confirmTrial, setConfirmTrial] = useState(false);
  // Bumping this opens the payment panel below, prefilled with the cycle.
  const [payRequest, setPayRequest] = useState<{ seq: number; cycle: BillingCycle } | null>(null);

  // one-click PDF of this gym's members (same layout as the gym's own export)
  async function exportMembers() {
    setExporting(true);
    try {
      const [{ downloadMembersPdf }, { data }] = await Promise.all([
        import('../lib/membersPdf'),
        platformApi.get<{ gym_name: string; members: import('../lib/membersPdf').MemberExportRow[] }>(
          `/gyms/${gym.id}/export`,
        ),
      ]);
      await downloadMembersPdf(data.gym_name, data.members);
      setError('');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const detailQ = useQuery({
    queryKey: ['platform-gym', gym.id],
    queryFn: async () => (await platformApi.get<GymRow & { staff: StaffRow[] }>(`/gyms/${gym.id}`)).data,
  });

  const doneAndClose = (action: string) => (data: unknown) => {
    onChanged();
    onBanner(`${action} ${notifiedSummary(data)}`.trim());
    onClose();
  };
  // The same endpoint serves both, because re-freezing a frozen gym is exactly
  // "keep it frozen, change the reason" — it leaves status and frozen_at alone.
  const freeze = useMutationHelper(
    () => platformApi.post(`/gyms/${gym.id}/freeze`, { note: freezeNote || undefined }),
    doneAndClose(
      alreadyFrozen
        ? `Reason updated — "${gym.name}" staff will see it on their next attempt.`
        : `"${gym.name}" is now frozen.`,
    ),
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
  const approve = useMutationHelper(
    () => platformApi.post(`/gyms/${gym.id}/approve`),
    doneAndClose(`"${gym.name}" approved — subscription runs for 1 year.`),
    setError,
  );
  // Free/goodwill extension: no payment row is written. Converting a trial
  // starts the paid period today (the server drops the unused trial days).
  const renew = useMutationHelper(
    () => platformApi.post(`/gyms/${gym.id}/renew`, { cycle: renewCycle }),
    doneAndClose(
      `"${gym.name}" ${gym.is_trial ? 'converted to paid' : 'renewed'} for 1 more ${
        renewCycle === 'MONTHLY' ? 'month' : 'year'
      } (no payment recorded).`,
    ),
    setError,
  );

  // The undo for "Extend free". Runs the trial FROM TODAY and clears any comp,
  // so the end date it shows is one that will actually arrive.
  const setTrial = useMutationHelper(
    () => platformApi.post(`/gyms/${gym.id}/trial`, { days: trialDays }),
    doneAndClose(`"${gym.name}" is on a ${trialDays}-day free trial starting today.`),
    setError,
  );

  const d = detailQ.data;

  return (
    <Modal title={gym.name} onClose={onClose} wide>
      {view === 'detail' && (
        <div className="space-y-5">
          {gym.status === 'pending' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              ⏳ This gym is <b>waiting for approval</b> — its owner cannot log in yet. Approve to start their
              1-year subscription{isOwner ? ', or delete below to reject the registration' : ''}.
            </div>
          )}
          {gym.status === 'frozen' && (
            /* Mirrors what the gym's staff read on their login screen and in
               the app, so the reason can be checked — and corrected, via "Edit
               reason" below — without guessing at what they were told. */
            <div className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">
              <b>Reason shown to the gym:</b>{' '}
              {gym.freeze_note?.trim() ? (
                <span className="whitespace-pre-line">{gym.freeze_note}</span>
              ) : (
                <span className="italic">
                  none given — they see only “contact support”. Use “Add a reason” below to give them one.
                </span>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Info
              label="Status"
              value={
                gym.status === 'pending'
                  ? 'Pending approval'
                  : gym.status === 'frozen'
                    ? `Frozen ${ago(gym.frozen_at)}`
                    : gym.is_trial
                      ? 'Active — free trial'
                      : 'Active — paid'
              }
            />
            <Info
              label="Subscription ends"
              value={
                gym.subscription_ends_at
                  ? `${String(gym.subscription_ends_at).slice(0, 10)} (${daysLeft(gym.subscription_ends_at)}d)`
                  : '—'
              }
            />
            <Info
              label="Package"
              value={
                gym.plan_name
                  ? `${gym.plan_name}${gym.billing_cycle ? ` · ${gym.billing_cycle.toLowerCase()}` : ''}`
                  : gym.is_trial
                    ? 'Free trial'
                    : 'Never paid'
              }
            />
            <Info label="Joined" value={new Date(gym.created_at).toLocaleDateString()} />
            <Info label="Members (active / all)" value={`${gym.active_member_count} / ${gym.member_count}`} />
            <Info label="Staff accounts" value={String(gym.staff_count)} />
            <Info label="Revenue total" value={money(gym.revenue_total)} />
            <Info label="Revenue 30d" value={money(gym.revenue_30d)} />
            <Info label="Last check-in" value={ago(gym.last_checkin_at)} />
            <Info label="Phone" value={gym.phone ?? '—'} />
            <Info label="Address" value={gym.address ?? '—'} />
          </div>

          <div>
            <div className="label">Owner</div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="font-medium">{gym.owner_name ?? '—'}</span>
              <span className="text-slate-500">
                {' '}
                · {gym.owner_email ?? '—'} · {gym.owner_phone ?? gym.phone ?? 'no phone'}
              </span>
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

          <FeatureAccessCard
            gymId={gym.id}
            cameraAllowed={d?.camera_allowed ?? gym.camera_allowed ?? true}
            telegramAllowed={d?.telegram_allowed ?? gym.telegram_allowed ?? true}
            planName={d?.plan_name ?? gym.plan_name}
            planCamera={d?.plan_camera ?? gym.plan_camera}
            planTelegram={d?.plan_telegram ?? gym.plan_telegram}
            isOwner={isOwner}
            onChanged={() => {
              onChanged();
              void detailQ.refetch();
            }}
            onBanner={onBanner}
            gymName={gym.name}
          />

          <RecordPaymentSection
            gymId={gym.id}
            gymName={gym.name}
            comped={d?.comped ?? false}
            canRecord={perms.renew}
            isOwner={isOwner}
            isTrial={gym.is_trial && gym.status !== 'pending'}
            subscriptionEndsAt={gym.subscription_ends_at}
            openRequest={payRequest}
            onDone={(msg) => {
              onChanged();
              void detailQ.refetch();
              onBanner(msg);
            }}
          />

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
            {perms.export && (
              <button className="btn-secondary mr-auto" onClick={() => void exportMembers()} disabled={exporting}>
                {exporting ? 'Exporting…' : '⬇ Members PDF'}
              </button>
            )}
            {gym.status === 'pending' && perms.approve && (
              <button className="btn-primary" onClick={() => approve.run()} disabled={approve.busy}>
                {approve.busy ? 'Approving…' : '✓ Approve — start 1-year subscription'}
              </button>
            )}
            {gym.status !== 'pending' && perms.renew && gym.is_trial && (
              <button
                className="btn-primary"
                onClick={() => setPayRequest({ seq: Date.now(), cycle: 'MONTHLY' })}
              >
                ⭐ Convert trial → paid month
              </button>
            )}
            {gym.status !== 'pending' && perms.renew && (
              <div className="flex items-center gap-1">
                <Select
                  className="w-28"
                  value={renewCycle}
                  onChange={setRenewCycle}
                  label="Extend by"
                  aria-label="How long to extend for"
                  options={[
                    { value: 'MONTHLY', label: '1 month' },
                    { value: 'YEARLY', label: '1 year' },
                  ]}
                />
                <button
                  className="btn-secondary"
                  onClick={() => renew.run()}
                  disabled={renew.busy}
                  title="Extends the subscription without recording any payment"
                >
                  {renew.busy ? 'Extending…' : '↻ Extend free'}
                </button>
              </div>
            )}
            {gym.status !== 'pending' && perms.renew && (
              <div className="flex items-center gap-1">
                <label className="sr-only" htmlFor="trial-days">
                  Trial length in days
                </label>
                <input
                  id="trial-days"
                  type="number"
                  min={1}
                  max={365}
                  value={trialDays}
                  onChange={(e) => {
                    setTrialDays(Math.min(365, Math.max(1, Number(e.target.value) || 1)));
                    setConfirmTrial(false);
                  }}
                  className="input w-20"
                />
                <button
                  className={confirmTrial ? 'btn-danger' : 'btn-secondary'}
                  onClick={() => (confirmTrial ? setTrial.run() : setConfirmTrial(true))}
                  disabled={setTrial.busy}
                  title={
                    'Ends any paid time and starts a free trial from today. ' +
                    'Also removes this gym from the comped list.'
                  }
                >
                  {setTrial.busy
                    ? 'Setting…'
                    : confirmTrial
                      ? `Confirm — replace with ${trialDays}-day trial`
                      : '⟲ Put back on trial'}
                </button>
              </div>
            )}
            {gym.status === 'active' && perms.freeze && (
              <button className="btn-secondary" onClick={() => setView('freeze')}>
                ❄️ Freeze account
              </button>
            )}
            {gym.status === 'frozen' && perms.freeze && (
              /* Editing the reason must not go via unfreeze-then-freeze: that
                 would let staff back in for a moment and fire a spurious
                 "reactivated" alert at the owner. */
              <button className="btn-secondary" onClick={() => setView('freeze')}>
                {gym.freeze_note?.trim() ? '✏️ Edit reason' : '✏️ Add a reason'}
              </button>
            )}
            {gym.status === 'frozen' && perms.freeze && (
              <button className="btn-primary" onClick={() => unfreeze.run()} disabled={unfreeze.busy}>
                {unfreeze.busy ? 'Unfreezing…' : 'Unfreeze account'}
              </button>
            )}
            {isOwner && (
              <button className="btn-danger" onClick={() => setView('delete')}>
                {gym.status === 'pending' ? 'Reject & delete' : 'Delete gym'}
              </button>
            )}
          </div>
        </div>
      )}

      {view === 'freeze' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {alreadyFrozen ? (
              <>
                <b>{gym.name}</b> is already frozen — this only rewrites the reason its staff are shown. The
                account stays locked and the freeze date is unchanged.
              </>
            ) : (
              <>
                Freezing <b>{gym.name}</b> immediately locks out all of its staff (active sessions are revoked)
                and blocks logins until you unfreeze it. No data is deleted.
              </>
            )}
          </p>
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">
            The reason below is what the owner and their staff read on the login screen and inside the app, on
            every attempt, for as long as the account is frozen. It also goes out by Telegram and email — but
            those are best effort, so the in-app text is the one they are certain to see. Leave it blank and
            they get only “contact support”.
          </p>
          <div>
            <label className="label">Reason (shown to the gym)</label>
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
              {freeze.busy
                ? alreadyFrozen
                  ? 'Saving…'
                  : 'Freezing…'
                : alreadyFrozen
                  ? 'Save reason'
                  : 'Freeze account'}
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
/**
 * Per-gym feature entitlements (platform owner only).
 *
 * Revoking is a lock, not a wipe: enrolled face data and the stored bot token
 * survive, so a gym switched off by mistake is restored by switching it back
 * on. The copy says so, because "disable camera" reads like "delete the faces"
 * and the difference matters when you are about to click it.
 */
function FeatureAccessCard({
  gymId,
  gymName,
  cameraAllowed,
  telegramAllowed,
  planName,
  planCamera,
  planTelegram,
  isOwner,
  onChanged,
  onBanner,
}: {
  gymId: number;
  gymName: string;
  cameraAllowed: boolean;
  telegramAllowed: boolean;
  planName: string | null;
  planCamera: boolean | null;
  planTelegram: boolean | null;
  isOwner: boolean;
  onChanged: () => void;
  onBanner: (msg: string) => void;
}) {
  const [error, setError] = useState('');
  const [pending, setPending] = useState<'camera' | 'telegram' | null>(null);
  const [note, setNote] = useState('');

  const save = useMutation({
    mutationFn: (body: { camera_allowed?: boolean; telegram_allowed?: boolean; note?: string }) =>
      platformApi.put(`/gyms/${gymId}/features`, body),
    onSuccess: (res, body) => {
      setError('');
      setNote('');
      const on = body.camera_allowed ?? body.telegram_allowed;
      const what = 'camera_allowed' in body ? 'Face recognition' : 'Telegram';
      // The gym sees this in-app whatever happens to Telegram and email, so
      // the banner says so rather than leaving a failed alert looking silent.
      onBanner(
        `${what} ${on ? 'enabled' : 'disabled'} for "${gymName}". ` +
          `The owner sees it in the app on their next screen. ${notifiedSummary(res.data)}`,
      );
      onChanged();
    },
    onError: (err) => setError(apiErrorMessage(err)),
    onSettled: () => setPending(null),
  });

  function toggle(feature: 'camera' | 'telegram', next: boolean) {
    setPending(feature);
    const reason = note.trim() || undefined;
    save.mutate(
      feature === 'camera'
        ? { camera_allowed: next, note: reason }
        : { telegram_allowed: next, note: reason },
    );
  }

  const rows = [
    {
      key: 'camera' as const,
      label: 'Face recognition',
      on: cameraAllowed,
      inPlan: planCamera,
      hint: cameraAllowed
        ? 'The gym can use the door camera, enrol faces and auto check-in.'
        : 'Locked — the gym runs in name-board mode. Enrolled faces are kept and come back if you re-enable.',
    },
    {
      key: 'telegram' as const,
      label: 'Telegram notifications',
      on: telegramAllowed,
      inPlan: planTelegram,
      hint: telegramAllowed
        ? 'The gym can connect a bot and send reminders, nudges and summaries.'
        : 'Locked — the bot is stopped and no messages are sent. The saved token is kept.',
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="label">Feature access</div>
      <p className="mb-3 text-xs text-slate-500">
        What this gym is allowed to use. Paying for a package switches its features ON automatically; nothing
        is ever switched off automatically, so a gym can hold a feature its current package does not include —
        that is flagged below. Turning something off here stops it immediately, everywhere, and the gym owner
        cannot switch it back on. Nothing is deleted.
      </p>

      {/* Typed before the toggle, not after: this text is delivered with the
          change — shown full-screen in their app and sent by Telegram and
          email — so it is the difference between an explanation and a feature
          silently vanishing. */}
      {isOwner && (
        <div className="mb-3">
          <label className="label" htmlFor="feature-note">
            Reason shown to the gym owner (optional)
          </label>
          <textarea
            id="feature-note"
            className="input"
            rows={2}
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Camera add-on not included in your current plan — contact us to enable it."
          />
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.key} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{r.label}</span>
                {/* Only worth a chip where the plan and the switch disagree —
                    a match is the expected case and needs no decoration. */}
                {planName && r.inPlan && !r.on && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    paid for, still off
                  </span>
                )}
                {planName && r.inPlan === false && r.on && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    not in {planName}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">{r.hint}</div>
            </div>
            <button
              type="button"
              className={r.on ? 'btn-secondary shrink-0' : 'btn-primary shrink-0'}
              disabled={!isOwner || pending !== null}
              title={isOwner ? undefined : 'Only the platform owner can change feature access'}
              onClick={() => toggle(r.key, !r.on)}
            >
              {pending === r.key ? '…' : r.on ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
      {!isOwner && (
        <p className="mt-2 text-xs text-slate-400">Only the platform owner can change these.</p>
      )}
      {error && <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
    </div>
  );
}

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
