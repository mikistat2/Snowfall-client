import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, apiErrorMessage } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { t, getLocale, setLocale, type Locale, type StringKey } from '../i18n/strings';
import { useTheme } from '../hooks/useTheme';
import { useMobileShell } from '../hooks/useIsMobile';
import type { ThemeMode } from '../lib/theme';
import type { Plan } from '../lib/types';
import { Modal } from '../components/ui/Modal';
import { TelegramLinkModal } from '../components/ui/TelegramLinkModal';
import { PhoneInput } from '../components/ui/PhoneInput';
import { Select } from '../components/ui/Select';
import { PageTitle } from '../components/ui/PageTitle';
import {
  useCreateStaff,
  useDeleteStaff,
  useGymSettings,
  useStaff,
  useUpdateGym,
} from '../hooks/queries/useSettings';
import { useDeletePlan, usePlans, useSavePlan } from '../hooks/queries/usePlans';

export function SettingsPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  // The mobile shell already owns Appearance under More, so showing it here too
  // would put two identical controls two taps apart. Web has no other home for
  // it, which is the gap this section fills.
  const mobile = useMobileShell();

  return (
    <div className="max-w-4xl space-y-5">
      <PageTitle>{t('settings.title')}</PageTitle>
      {!mobile && <AppearanceSection />}
      <LanguageSection />
      <GymSection readOnly={!isOwner} />
      <PlansSection />
      {isOwner && <StaffSection />}
    </div>
  );
}

// ---------------------------------------------------------------- appearance
/**
 * Light/dark theme — the web counterpart of the phone's More → Appearance
 * control, which until now was the only place a theme could be pinned. Same
 * store (lib/theme), so the two stay consistent per device.
 *
 * No reload here, unlike the language switch: `useTheme` subscribes to the
 * store, so the class on <html> and every component update together.
 */
const THEME_OPTIONS: readonly { mode: ThemeMode; labelKey: StringKey }[] = [
  { mode: 'system', labelKey: 'more.theme.system' },
  { mode: 'light', labelKey: 'more.theme.light' },
  { mode: 'dark', labelKey: 'more.theme.dark' },
];

function AppearanceSection() {
  const { mode, setMode } = useTheme();

  return (
    <div className="card flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1 sm:basis-auto">
        {/* reuses the phone's label rather than duplicating "Appearance" in
            three languages — same control, same word */}
        <h2 className="font-semibold">{t('more.appearance')}</h2>
        <p className="text-xs text-fg-muted">{t('settings.appearanceHint')}</p>
      </div>

      <div
        role="radiogroup"
        aria-label={t('more.appearance')}
        className="grid w-full grid-cols-3 divide-x divide-line overflow-hidden rounded-lg border border-line sm:flex sm:w-auto"
      >
        {THEME_OPTIONS.map((option) => {
          const selected = mode === option.mode;
          return (
            <button
              key={option.mode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setMode(option.mode)}
              className={`flex min-h-touch items-center justify-center gap-1.5 px-2 py-2 text-center text-[13px] font-medium leading-tight transition-colors sm:px-4 sm:text-sm ${
                selected ? 'bg-slate-900 text-white dark:bg-sky-600' : 'bg-surface text-fg-muted hover:bg-surface-2'
              }`}
            >
              <ThemeIcon mode={option.mode} className="h-4 w-4 shrink-0" />
              {t(option.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeIcon({ mode, className }: { mode: ThemeMode; className?: string }) {
  if (mode === 'light') {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
        <path d="M10 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 1a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM3 10a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm12 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1zM5.05 5.05a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zm7.78 7.78a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zm2.12-7.78a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM7.17 12.83a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0z" />
      </svg>
    );
  }
  if (mode === 'dark') {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
        <path d="M17.29 12.79A8 8 0 0 1 7.21 2.71a8.001 8.001 0 1 0 10.08 10.08z" />
      </svg>
    );
  }
  // system — a monitor, matching "follow the machine"
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3.5l.4 2H13a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2h1.1l.4-2H5a2 2 0 0 1-2-2V5zm2 0v7h10V5H5z"
        clipRule="evenodd"
      />
    </svg>
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
  // Endonyms — each language is written the way its own speakers write it.
  const options: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'am', label: 'አማርኛ' },
    { value: 'om', label: 'Afaan Oromoo' },
  ];
  return (
    <div className="card flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1 sm:basis-auto">
        <h2 className="font-semibold">{t('settings.language')}</h2>
        <p className="text-xs text-fg-muted">{t('settings.languageHint')}</p>
      </div>

      {/* Phone: a full-width 3-up grid on its own line — equal columns keep the
          control from overflowing a 360px card however long a label is, and
          grid stretches every cell to match the tallest, so a label that wraps
          to two lines does not leave the row ragged. Tablet and up: the
          original inline segmented control. */}
      <div className="grid w-full grid-cols-3 divide-x divide-line overflow-hidden rounded-lg border border-line sm:flex sm:w-auto">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={current === o.value}
            onClick={() => choose(o.value)}
            className={`flex min-h-touch items-center justify-center px-2 py-2 text-center text-[13px] font-medium leading-tight sm:px-4 sm:text-sm ${
              current === o.value
                ? // slate-900 IS the dark-mode card surface, so the selected
                  // pill vanished in dark mode — accent it instead.
                  'bg-slate-900 text-white dark:bg-sky-600'
                : 'bg-surface text-fg-muted hover:bg-surface-2'
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
  const { data: gym } = useGymSettings();

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

  const mutation = useUpdateGym();

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    mutation.mutate(
      {
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
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="card space-y-4">
        <h2 className="font-semibold">{t('settings.gym')}</h2>
        {mutation.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {apiErrorMessage(mutation.error)}
          </p>
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
            <PhoneInput
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              disabled={readOnly}
            />
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
      </section>

      {/*
       * The rules are settings, not a form to fill in: each is a single value
       * with a consequence worth explaining. Laid out as a grid of bare inputs
       * they read as eight unlabelled numbers floating in a card — so they are
       * rows instead, each carrying its name, its effect and its control on
       * the right, which is the shape every phone's own settings use.
       */}
      <section className="card">
        <h2 className="font-semibold">{t('settings.rules')}</h2>
        <p className="mt-1 text-xs text-fg-muted">{t('settings.rulesHint')}</p>

        <div className="mt-4">
          <RuleRow label={t('settings.gracePeriod')} hint={t('settings.gracePeriodHint')}>
            <NumberField
              value={form.grace_period_days}
              onChange={set('grace_period_days')}
              min="0"
              unit={t('common.days')}
              disabled={readOnly}
            />
          </RuleRow>

          <RuleRow label={t('settings.reminderDays')} hint={t('settings.reminderDaysHint')}>
            <NumberField
              value={form.expiry_reminder_days}
              onChange={set('expiry_reminder_days')}
              min="0"
              unit={t('common.days')}
              disabled={readOnly}
            />
          </RuleRow>

          <RuleRow label={t('settings.nudgeDays')} hint={t('settings.nudgeDaysHint')}>
            <NumberField
              value={form.absence_nudge_days}
              onChange={set('absence_nudge_days')}
              min="1"
              unit={t('common.days')}
              disabled={readOnly}
            />
          </RuleRow>

          <RuleRow label={t('settings.autoCheckout')} hint={t('settings.autoCheckoutHint')}>
            <NumberField
              value={form.auto_checkout_hours}
              onChange={set('auto_checkout_hours')}
              min="0.5"
              step="0.5"
              unit={t('common.hours')}
              disabled={readOnly}
            />
          </RuleRow>

          <RuleRow label={t('settings.closing')} hint={t('settings.closingHint')}>
            <input
              type="time"
              className="input w-32 tabular-nums"
              value={form.closing_time}
              onChange={set('closing_time')}
              disabled={readOnly}
            />
          </RuleRow>

          <RuleRow label={t('settings.threshold')} hint={t('settings.thresholdHint')}>
            <NumberField
              value={form.match_threshold}
              onChange={set('match_threshold')}
              min="0.2"
              max="0.9"
              step="0.05"
              disabled={readOnly}
            />
          </RuleRow>

          <RuleRow label={t('settings.entryMode')} hint={t('settings.entryModeHint')}>
            <Select
              className="w-40"
              value={form.entry_mode}
              onChange={(entry_mode) => setForm((f) => ({ ...f, entry_mode }))}
              disabled={readOnly}
              label={t('settings.entryMode')}
              options={[
                { value: 'auto', label: t('settings.entryAuto') },
                { value: 'manual', label: t('settings.entryManual') },
              ]}
            />
          </RuleRow>

          <RuleRow label={t('settings.camera')} hint={t('settings.cameraHint')}>
            <Select
              className="w-40"
              value={form.camera_enabled ? 'on' : 'off'}
              onChange={(v) => setForm((f) => ({ ...f, camera_enabled: v === 'on' }))}
              disabled={readOnly}
              label={t('settings.camera')}
              options={[
                { value: 'on', label: t('settings.cameraOn') },
                { value: 'off', label: t('settings.cameraOff') },
              ]}
            />
          </RuleRow>
        </div>
      </section>

      {!readOnly && (
        <div className="flex items-center gap-3">
          <button className="btn-primary w-full sm:w-auto" disabled={mutation.isPending}>
            {t('settings.save')}
          </button>
          {saved && <span className="text-sm font-medium text-green-600">✓</span>}
        </div>
      )}
    </form>
  );
}

/** One setting: what it is, what it does, and its control — never a bare box. */
function RuleRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm font-medium text-fg">{label}</p>
        <div className="shrink-0">{children}</div>
      </div>
      {hint && <p className="mt-1 text-xs leading-relaxed text-fg-muted">{hint}</p>}
    </div>
  );
}

/** A number with its unit beside it, so "3" is never left to mean anything. */
function NumberField({
  value,
  onChange,
  unit,
  disabled,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (e: { target: { value: string } }) => void;
  unit?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="input w-20 text-right tabular-nums"
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
      {unit && <span className="w-10 text-xs text-fg-muted">{unit}</span>}
    </div>
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
          <span className="text-fg-muted">✓ {t('telegram.myChatLinked')}</span>
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
  // the API accepts only 1 (one session per day) or null (unlimited)
  sessions_per_day: null as 1 | null,
  allowed_hours: '',
  includes: '' as string, // comma-separated feature names
  active: true,
};

/** A saved plan → the shape the edit form works in. */
function editValues(plan: Plan): typeof emptyPlan & { id: number } {
  return {
    id: plan.id,
    name: plan.name,
    duration_days: plan.duration_days,
    price: Number(plan.price),
    sessions_per_day: plan.sessions_per_day,
    allowed_hours: plan.allowed_hours ?? '',
    includes: Object.keys(plan.includes ?? {}).join(', '),
    active: plan.active,
  };
}

function PlansSection() {
  // the plan builder edits inactive plans too, so this is the unfiltered list
  const { data: plans = [] } = usePlans();
  const mobile = useMobileShell();
  const [editing, setEditing] = useState<(typeof emptyPlan & { id?: number }) | null>(null);

  const save = useSavePlan();
  const remove = useDeletePlan();

  /** Form shape → API shape: `includes` is a comma-separated field in the UI. */
  function submitPlan(plan: typeof emptyPlan & { id?: number }) {
    save.mutate(
      {
        id: plan.id,
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
      },
      { onSuccess: () => setEditing(null) },
    );
  }

  return (
    <section className="card space-y-3">
      {/* Wrapping, not justify-between: "Karoorota miseensummaa" next to
          "Karoora dabali" is wider than a 360px card, and a non-wrapping row
          pushed the whole screen sideways. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 font-semibold">{t('settings.plans')}</h2>
        <button className="btn-secondary" onClick={() => setEditing({ ...emptyPlan })}>
          + {t('settings.addPlan')}
        </button>
      </div>

      {mobile ? (
        <ul className="list-stack">
          {plans.map((p) => (
            <li key={p.id} className={`list-card ${p.active ? '' : 'opacity-60'}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 break-words text-[15px] font-bold leading-snug text-fg">{p.name}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-fg">
                  {Number(p.price)} {t('common.birr')}
                </span>
              </div>
              <p className="mt-0.5 break-words text-xs text-fg-muted">
                {p.duration_days} {t('common.days')} ·{' '}
                {p.sessions_per_day === 1 ? '1 session/day' : 'unlimited'}
                {p.allowed_hours ? ` · ${p.allowed_hours}` : ''}
                {Object.keys(p.includes ?? {}).length > 0
                  ? ` · ${Object.keys(p.includes).join(', ')}`
                  : ''}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn-secondary flex-1 !py-1.5 text-xs"
                  onClick={() => setEditing(editValues(p))}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1 !py-1.5 text-xs text-red-600 dark:text-red-400"
                  onClick={() => remove.mutate(p.id)}
                >
                  {t('common.delete')}
                </button>
              </div>
            </li>
          ))}
          {plans.length === 0 && <li className="py-6 text-center text-sm text-fg-muted">—</li>}
        </ul>
      ) : (
      <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <tbody>
          {plans.map((p) => (
            <tr key={p.id} className={`border-b border-line last:border-0 ${p.active ? '' : 'opacity-50'}`}>
              <td className="py-2 font-medium">{p.name}</td>
              <td className="py-2 text-fg-muted">
                {p.duration_days} {t('common.days')}
              </td>
              <td className="py-2">
                {Number(p.price)} {t('common.birr')}
              </td>
              <td className="py-2 text-xs text-fg-muted">
                {p.sessions_per_day === 1 ? '1 session/day' : 'unlimited'}
                {p.allowed_hours ? ` · ${p.allowed_hours}` : ''}
                {Object.keys(p.includes ?? {}).length > 0 ? ` · ${Object.keys(p.includes).join(', ')}` : ''}
              </td>
              <td className="py-2 text-right">
                <button className="text-xs text-fg-muted hover:text-fg" onClick={() => setEditing(editValues(p))}>
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
      )}

      {editing && (
        <Modal title={editing.id ? editing.name : t('settings.addPlan')} onClose={() => setEditing(null)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitPlan(editing);
            }}
          >
            {save.isError && (
              <p className="rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-700 dark:text-red-300">{apiErrorMessage(save.error)}</p>
            )}
            <div>
              <label className="label">{t('members.name')}</label>
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="field-row">
              <div>
                <label className="label">Duration ({t('common.days')})</label>
                <input type="number" min="1" className="input" value={editing.duration_days} onChange={(e) => setEditing({ ...editing, duration_days: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="label">Price ({t('common.birr')})</label>
                <input type="number" min="0" className="input" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="field-row">
              <div>
                <label className="label">Sessions per day</label>
                <Select
                  value={editing.sessions_per_day === 1 ? '1' : 'unlimited'}
                  onChange={(v) => setEditing({ ...editing, sessions_per_day: v === '1' ? 1 : null })}
                  label="Sessions per day"
                  options={[
                    { value: 'unlimited', label: 'Unlimited' },
                    { value: '1', label: '1 per day' },
                  ]}
                />
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

function StaffSection() {
  const mobile = useMobileShell();
  const { data: staff = [] } = useStaff();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const create = useCreateStaff();
  const remove = useDeleteStaff();

  function submitStaff() {
    create.mutate(form, {
      onSuccess: () => {
        setAdding(false);
        setForm({ name: '', email: '', password: '' });
      },
    });
  }

  return (
    <section className="card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 font-semibold">{t('settings.staff')}</h2>
        <button className="btn-secondary" onClick={() => setAdding(true)}>
          + {t('settings.addStaff')}
        </button>
      </div>

      {mobile ? (
        <ul className="list-stack">
          {staff.map((s) => (
            <li key={s.id} className="list-card flex items-center gap-3">
              <span className="min-w-0 flex-1">
                <span className="block break-words text-[15px] font-bold leading-snug text-fg">{s.name}</span>
                <span className="block truncate text-xs text-fg-muted">{s.email}</span>
              </span>
              <span className="chip shrink-0 uppercase">{s.role}</span>
              {s.role !== 'owner' && (
                <button
                  type="button"
                  aria-label={t('common.delete')}
                  className="shrink-0 text-xs font-medium text-red-500"
                  onClick={() => remove.mutate(s.id)}
                >
                  {t('common.delete')}
                </button>
              )}
            </li>
          ))}
          {staff.length === 0 && <li className="py-6 text-center text-sm text-fg-muted">—</li>}
        </ul>
      ) : (
      <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-b border-line last:border-0">
              <td className="py-2 font-medium">{s.name}</td>
              <td className="py-2 text-fg-muted">{s.email}</td>
              <td className="py-2 text-xs uppercase text-fg-subtle">{s.role}</td>
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
      )}

      {adding && (
        <Modal title={t('settings.addStaff')} onClose={() => setAdding(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitStaff();
            }}
          >
            {create.isError && (
              <p className="rounded-lg bg-red-50 dark:bg-red-950/50 px-3 py-2 text-sm text-red-700 dark:text-red-300">{apiErrorMessage(create.error)}</p>
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
