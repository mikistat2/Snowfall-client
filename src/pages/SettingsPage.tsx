import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { t, getLocale, setLocale, type Locale } from '../i18n/strings';
import { Modal } from '../components/ui/Modal';
import { TelegramLinkModal } from '../components/ui/TelegramLinkModal';
import type { Gym, Plan } from '../lib/types';

export function SettingsPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  return (
    <div className="max-w-4xl space-y-5">
      <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      <LanguageSection />
      <GymSection readOnly={!isOwner} />
      <PlansSection />
      {isOwner && <StaffSection />}
    </div>
  );
}

// ------------------------------------------------------------------ language
/**
 * Per-device UI language (localStorage, not a server setting) — every staff
 * member picks their own. Reloads so every rendered t() string updates.
 */
function LanguageSection() {
  const current = getLocale();
  function choose(l: Locale) {
    if (l === current) return;
    setLocale(l);
    window.location.reload();
  }
  const options: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'am', label: 'አማርኛ' },
  ];
  return (
    <div className="card flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">{t('settings.language')}</h2>
        <p className="text-xs text-slate-500">{t('settings.languageHint')}</p>
      </div>
      <div className="flex overflow-hidden rounded-lg border border-slate-200">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => choose(o.value)}
            className={`px-4 py-2 text-sm font-medium ${
              current === o.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- gym + rules
function GymSection({ readOnly }: { readOnly: boolean }) {
  const queryClient = useQueryClient();
  const { data: gym } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<Gym>('/settings')).data,
  });

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    telegram_bot_token: '',
    grace_period_days: 3,
    auto_checkout_hours: 3,
    expiry_reminder_days: 7,
    absence_nudge_days: 5,
    match_threshold: 0.5,
    closing_time: '22:00',
    entry_mode: 'auto' as 'auto' | 'manual',
    camera_enabled: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!gym) return;
    setForm({
      name: gym.name,
      address: gym.address ?? '',
      phone: gym.phone ?? '',
      telegram_bot_token: gym.telegram_bot_token ?? '',
      ...gym.settings,
    });
  }, [gym]);

  const mutation = useMutation({
    mutationFn: async () =>
      api.put('/settings', {
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
        telegram_bot_token: form.telegram_bot_token || null,
        settings: {
          grace_period_days: Number(form.grace_period_days),
          auto_checkout_hours: Number(form.auto_checkout_hours),
          expiry_reminder_days: Number(form.expiry_reminder_days),
          absence_nudge_days: Number(form.absence_nudge_days),
          match_threshold: Number(form.match_threshold),
          closing_time: form.closing_time,
          entry_mode: form.entry_mode,
          camera_enabled: form.camera_enabled,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!readOnly) mutation.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="font-semibold">{t('settings.gym')}</h2>
      {mutation.isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorMessage(mutation.error)}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">{t('auth.gymName')}</label>
          <input className="input" value={form.name} onChange={set('name')} disabled={readOnly} />
        </div>
        <div>
          <label className="label">{t('auth.address')}</label>
          <input className="input" value={form.address} onChange={set('address')} disabled={readOnly} />
        </div>
        <div>
          <label className="label">{t('auth.phone')}</label>
          <input className="input" value={form.phone} onChange={set('phone')} disabled={readOnly} />
        </div>
      </div>
      <div>
        <label className="label">{t('settings.botToken')}</label>
        <input
          className="input"
          value={form.telegram_bot_token}
          onChange={set('telegram_bot_token')}
          disabled={readOnly}
          placeholder="123456:ABC-DEF… (from @BotFather)"
        />
        <BotStatus />
      </div>

      <h2 className="pt-2 font-semibold">{t('settings.rules')}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">{t('settings.gracePeriod')}</label>
          <input type="number" min="0" className="input" value={form.grace_period_days} onChange={set('grace_period_days')} disabled={readOnly} />
        </div>
        <div>
          <label className="label">{t('settings.reminderDays')}</label>
          <input type="number" min="0" className="input" value={form.expiry_reminder_days} onChange={set('expiry_reminder_days')} disabled={readOnly} />
        </div>
        <div>
          <label className="label">{t('settings.autoCheckout')}</label>
          <input type="number" min="0.5" step="0.5" className="input" value={form.auto_checkout_hours} onChange={set('auto_checkout_hours')} disabled={readOnly} />
        </div>
        <div>
          <label className="label">{t('settings.nudgeDays')}</label>
          <input type="number" min="1" className="input" value={form.absence_nudge_days} onChange={set('absence_nudge_days')} disabled={readOnly} />
        </div>
        <div>
          <label className="label">{t('settings.threshold')}</label>
          <input type="number" min="0.2" max="0.9" step="0.05" className="input" value={form.match_threshold} onChange={set('match_threshold')} disabled={readOnly} />
        </div>
        <div>
          <label className="label">{t('settings.closing')}</label>
          <input type="time" className="input" value={form.closing_time} onChange={set('closing_time')} disabled={readOnly} />
        </div>
        <div>
          <label className="label">{t('settings.entryMode')}</label>
          <select className="input" value={form.entry_mode} onChange={set('entry_mode')} disabled={readOnly}>
            <option value="auto">{t('settings.entryAuto')}</option>
            <option value="manual">{t('settings.entryManual')}</option>
          </select>
          <p className="mt-1 text-xs text-slate-400">{t('settings.entryModeHint')}</p>
        </div>
        <div>
          <label className="label">{t('settings.camera')}</label>
          <select
            className="input"
            value={form.camera_enabled ? 'on' : 'off'}
            onChange={(e) => setForm((f) => ({ ...f, camera_enabled: e.target.value === 'on' }))}
            disabled={readOnly}
          >
            <option value="on">{t('settings.cameraOn')}</option>
            <option value="off">{t('settings.cameraOff')}</option>
          </select>
          <p className="mt-1 text-xs text-slate-400">{t('settings.cameraHint')}</p>
        </div>
      </div>
      {!readOnly && (
        <div className="flex items-center gap-3">
          <button className="btn-primary" disabled={mutation.isPending}>
            {t('settings.save')}
          </button>
          {saved && <span className="text-sm text-green-600">✓</span>}
        </div>
      )}
    </form>
  );
}

function BotStatus() {
  const { data } = useQuery({
    queryKey: ['telegram-status'],
    queryFn: async () =>
      (
        await api.get<{
          configured: boolean;
          running: boolean;
          username: string | null;
          error: string | null;
          my_chat_linked: boolean;
        }>('/telegram/status')
      ).data,
    refetchInterval: 30_000,
  });
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const ownerLink = useMutation({
    mutationFn: async () => (await api.post<{ url: string }>('/telegram/owner-link')).data,
    onSuccess: (d) => setLinkUrl(d.url),
  });

  if (!data?.configured) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
      {data.running ? (
        <span className="text-green-600">
          ● {t('telegram.botRunning')} — @{data.username}
        </span>
      ) : (
        <span className="text-red-600" title={data.error ?? ''}>
          ● {t('telegram.botStopped')}
          {data.error ? ` (${data.error})` : ''}
        </span>
      )}
      {data.running &&
        (data.my_chat_linked ? (
          <span className="text-slate-500">✓ {t('telegram.myChatLinked')}</span>
        ) : (
          <button type="button" className="btn-secondary !py-1 text-xs" onClick={() => ownerLink.mutate()}>
            {t('telegram.linkMyChat')}
          </button>
        ))}
      {linkUrl && <TelegramLinkModal url={linkUrl} onClose={() => setLinkUrl(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------- plans
const emptyPlan = {
  name: '',
  duration_days: 30,
  price: 0,
  sessions_per_day: null as number | null,
  allowed_hours: '',
  includes: '' as string, // comma-separated feature names
  active: true,
};

function PlansSection() {
  const queryClient = useQueryClient();
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => (await api.get<Plan[]>('/plans')).data,
  });
  const [editing, setEditing] = useState<(typeof emptyPlan & { id?: number }) | null>(null);

  const save = useMutation({
    mutationFn: async (plan: typeof emptyPlan & { id?: number }) => {
      const payload = {
        name: plan.name,
        duration_days: Number(plan.duration_days),
        price: Number(plan.price),
        sessions_per_day: plan.sessions_per_day,
        allowed_hours: plan.allowed_hours || null,
        includes: Object.fromEntries(
          plan.includes
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((k) => [k, true]),
        ),
        active: plan.active,
      };
      return plan.id ? api.put(`/plans/${plan.id}`, payload) : api.post('/plans', payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditing(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/plans/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  return (
    <section className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t('settings.plans')}</h2>
        <button className="btn-secondary" onClick={() => setEditing({ ...emptyPlan })}>
          + {t('settings.addPlan')}
        </button>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <tbody>
          {plans.map((p) => (
            <tr key={p.id} className={`border-b border-slate-100 last:border-0 ${p.active ? '' : 'opacity-50'}`}>
              <td className="py-2 font-medium">{p.name}</td>
              <td className="py-2 text-slate-500">
                {p.duration_days} {t('common.days')}
              </td>
              <td className="py-2">
                {Number(p.price)} {t('common.birr')}
              </td>
              <td className="py-2 text-xs text-slate-500">
                {p.sessions_per_day === 1 ? '1 session/day' : 'unlimited'}
                {p.allowed_hours ? ` · ${p.allowed_hours}` : ''}
                {Object.keys(p.includes ?? {}).length > 0 ? ` · ${Object.keys(p.includes).join(', ')}` : ''}
              </td>
              <td className="py-2 text-right">
                <button
                  className="text-xs text-slate-500 hover:text-slate-900"
                  onClick={() =>
                    setEditing({
                      id: p.id,
                      name: p.name,
                      duration_days: p.duration_days,
                      price: Number(p.price),
                      sessions_per_day: p.sessions_per_day,
                      allowed_hours: p.allowed_hours ?? '',
                      includes: Object.keys(p.includes ?? {}).join(', '),
                      active: p.active,
                    })
                  }
                >
                  Edit
                </button>
                <button className="ml-3 text-xs text-red-500 hover:text-red-700" onClick={() => remove.mutate(p.id)}>
                  {t('common.delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {editing && (
        <Modal title={editing.id ? editing.name : t('settings.addPlan')} onClose={() => setEditing(null)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(editing);
            }}
          >
            {save.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorMessage(save.error)}</p>
            )}
            <div>
              <label className="label">{t('members.name')}</label>
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Duration ({t('common.days')})</label>
                <input type="number" min="1" className="input" value={editing.duration_days} onChange={(e) => setEditing({ ...editing, duration_days: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="label">Price ({t('common.birr')})</label>
                <input type="number" min="0" className="input" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Sessions per day</label>
                <select
                  className="input"
                  value={editing.sessions_per_day === 1 ? '1' : ''}
                  onChange={(e) => setEditing({ ...editing, sessions_per_day: e.target.value === '1' ? 1 : null })}
                >
                  <option value="">Unlimited</option>
                  <option value="1">1 per day</option>
                </select>
              </div>
              <div>
                <label className="label">Allowed hours (HH:MM-HH:MM)</label>
                <input
                  className="input"
                  placeholder="06:00-12:00"
                  pattern="\d{2}:\d{2}-\d{2}:\d{2}"
                  value={editing.allowed_hours}
                  onChange={(e) => setEditing({ ...editing, allowed_hours: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Includes (comma-separated, e.g. aerobics, sauna)</label>
              <input className="input" value={editing.includes} onChange={(e) => setEditing({ ...editing, includes: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
              Active
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </button>
              <button className="btn-primary" disabled={save.isPending}>
                {t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- staff
interface Staff {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'staff';
}

function StaffSection() {
  const queryClient = useQueryClient();
  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => (await api.get<Staff[]>('/staff')).data,
  });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const create = useMutation({
    mutationFn: async () => api.post('/staff', form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff'] });
      setAdding(false);
      setForm({ name: '', email: '', password: '' });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/staff/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['staff'] }),
  });

  return (
    <section className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t('settings.staff')}</h2>
        <button className="btn-secondary" onClick={() => setAdding(true)}>
          + {t('settings.addStaff')}
        </button>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-b border-slate-100 last:border-0">
              <td className="py-2 font-medium">{s.name}</td>
              <td className="py-2 text-slate-500">{s.email}</td>
              <td className="py-2 text-xs uppercase text-slate-400">{s.role}</td>
              <td className="py-2 text-right">
                {s.role !== 'owner' && (
                  <button className="text-xs text-red-500 hover:text-red-700" onClick={() => remove.mutate(s.id)}>
                    {t('common.delete')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {adding && (
        <Modal title={t('settings.addStaff')} onClose={() => setAdding(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            {create.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{apiErrorMessage(create.error)}</p>
            )}
            <div>
              <label className="label">{t('members.name')}</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
            </div>
            <div>
              <label className="label">{t('auth.email')}</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t('auth.password')}</label>
              <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn-primary" disabled={create.isPending}>
                {t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
