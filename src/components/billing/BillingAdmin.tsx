import { useEffect, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformApi } from '../../lib/platformApi';
import { apiErrorMessage } from '../../lib/api';
import { ProviderMark } from './ProviderMark';
import { Pager } from './Pager';
import { Select } from '../ui/Select';
import { useDebounced } from '../../hooks/useDebounced';
import { money, type BillingPayment, type BillingPlan, type BillingStatus } from '../../lib/billing';

/**
 * Platform-owner billing controls, mounted on /platform.
 *
 * Order matters here — it is the argument. The verification-key warning comes
 * first because nothing below it works without one; the master switch comes
 * next because it decides whether any of the rest applies; and the attempts
 * table comes last because it is the record of what actually happened.
 */

interface AdminSettings {
  payments_required: boolean;
  cbe_enabled: boolean;
  cbe_account_number: string | null;
  cbe_account_name: string | null;
  telebirr_enabled: boolean;
  telebirr_phone: string | null;
  telebirr_account_name: string | null;
  currency: string;
  receipt_max_age_days: number;
  grace_days: number;
  instructions: string | null;
  verificationConfigured: boolean;
  verificationEnvVar: string;
  cbeAccountSuffix: string | null;
}

type AttemptRow = BillingPayment & {
  gym_name: string;
  owner_email: string | null;
  plan_name: string | null;
  expected_amount: string | null;
};

export function BillingAdmin({ onBanner }: { onBanner: (msg: string) => void }) {
  const qc = useQueryClient();
  const settingsQ = useQuery({
    queryKey: ['billing-settings'],
    queryFn: async () => (await platformApi.get<AdminSettings>('/billing/settings')).data,
    retry: false,
  });

  const save = useMutation({
    mutationFn: async (patch: Partial<AdminSettings>) =>
      (await platformApi.put<AdminSettings>('/billing/settings', patch)).data,
    onSuccess: (updated) => qc.setQueryData(['billing-settings'], updated),
    onError: (err) => onBanner(`Could not save: ${apiErrorMessage(err)}`),
  });

  const settings = settingsQ.data;
  if (!settings) return null;
  const on = settings.payments_required;

  return (
    <div className="space-y-4">
      {!settings.verificationConfigured && (
        <div className="card border-amber-300 bg-amber-50">
          <div className="text-sm font-semibold text-amber-900">Verification key missing</div>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            Set <code className="rounded bg-amber-100 px-1 font-mono">{settings.verificationEnvVar}</code> in
            the server environment. Until it is set, gyms are told that payment is unavailable rather than
            being allowed to send money we cannot check.
          </p>
        </div>
      )}

      {/* ------------------------------------------------ master switch */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Require payment for a subscription</div>
            <div className="text-xs text-slate-500">
              When off, any gym can register and use the system for free.
            </div>
          </div>
          <button
            role="switch"
            aria-checked={on}
            disabled={save.isPending}
            onClick={() => {
              // A switch that controls who gets in must never sit there
              // looking flipped but unsaved — it saves on click.
              save.mutate(
                { payments_required: !on },
                {
                  onSuccess: (updated) =>
                    onBanner(
                      updated.payments_required
                        ? 'Payments are ON — gyms must pay to keep access after their current period ends.'
                        : 'Payments are OFF — everything is free and nothing is charged.',
                    ),
                },
              );
            }}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              on ? 'bg-emerald-500' : 'bg-slate-300'
            } disabled:opacity-50`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                on ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
        {!on && (
          <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            Payments are <b>off</b>. New gyms are activated the moment they register — switching this back on
            will only affect gyms that sign up afterwards, never the ones already here.
          </div>
        )}
      </div>

      {/* everything below is inert while the switch is off */}
      <div className={on ? '' : 'pointer-events-none opacity-60'}>
        <div className="space-y-4">
          <PlansCard onBanner={onBanner} />

          <SettingsForm settings={settings} onSave={(patch, msg) => save.mutate(patch, { onSuccess: () => onBanner(msg) })} saving={save.isPending} />

          <AttemptsTable />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* plans                                                               */
/* ------------------------------------------------------------------ */

function PlansCard({ onBanner }: { onBanner: (msg: string) => void }) {
  const qc = useQueryClient();
  const plansQ = useQuery({
    queryKey: ['billing-plans'],
    queryFn: async () => (await platformApi.get<BillingPlan[]>('/billing/plans')).data,
    retry: false,
  });
  const refresh = () => void qc.invalidateQueries({ queryKey: ['billing-plans'] });
  const [adding, setAdding] = useState(false);

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<BillingPlan> }) =>
      (await platformApi.put(`/billing/plans/${id}`, patch)).data,
    onSuccess: refresh,
    onError: (err) => onBanner(apiErrorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => (await platformApi.delete(`/billing/plans/${id}`)).data,
    onSuccess: () => {
      refresh();
      onBanner('Plan deleted.');
    },
    onError: (err) => onBanner(apiErrorMessage(err)),
  });

  const plans = plansQ.data ?? [];

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">Subscription plans</div>
          <div className="text-xs text-slate-500">
            Prices take effect immediately — no redeploy. Gyms see only the active ones.
          </div>
          <div className="mt-1 text-xs text-amber-700">
            “Includes” describes the package. It does not switch anything on yet — a gym’s camera
            and Telegram access still comes from its own row under Gyms.
          </div>
        </div>
        <button className="btn-secondary" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Cancel' : '+ Add plan'}
        </button>
      </div>

      {adding && <PlanForm onDone={() => { setAdding(false); refresh(); }} onBanner={onBanner} />}

      <div className="space-y-2">
        {plans.map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            onPatch={(patch) => update.mutate({ id: plan.id, patch })}
            onDelete={() => remove.mutate(plan.id)}
          />
        ))}
        {plans.length === 0 && !plansQ.isLoading && (
          <p className="py-3 text-center text-sm text-slate-400">No plans yet — add one.</p>
        )}
      </div>
    </div>
  );
}

function PlanRow({
  plan,
  onPatch,
  onDelete,
}: {
  plan: BillingPlan;
  onPatch: (patch: Partial<BillingPlan>) => void;
  onDelete: () => void;
}) {
  const [monthly, setMonthly] = useState(plan.monthly_price);
  const [yearly, setYearly] = useState(plan.yearly_price);
  const [memberLimit, setMemberLimit] = useState(plan.member_limit?.toString() ?? '');
  const [setupFee, setSetupFee] = useState(plan.setup_fee);
  useEffect(() => {
    setMonthly(plan.monthly_price);
    setYearly(plan.yearly_price);
    setMemberLimit(plan.member_limit?.toString() ?? '');
    setSetupFee(plan.setup_fee);
  }, [plan.monthly_price, plan.yearly_price, plan.member_limit, plan.setup_fee]);

  const m = Number(monthly);
  const y = Number(yearly);
  const savingPct = m > 0 && y > 0 ? Math.round((1 - y / (m * 12)) * 100) : 0;

  return (
    <div className={`rounded-lg border border-slate-200 p-3 ${plan.is_active ? '' : 'bg-slate-50 opacity-70'}`}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[8rem] flex-1">
          <div className="font-semibold">{plan.name}</div>
          {plan.description && <div className="text-xs text-slate-500">{plan.description}</div>}
        </div>
        <label className="text-xs text-slate-500">
          Monthly
          <input
            className="input w-28"
            type="number"
            min={0}
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            onBlur={() => Number(monthly) !== Number(plan.monthly_price) && onPatch({ monthly_price: Number(monthly) } as never)}
          />
        </label>
        <label className="text-xs text-slate-500">
          Yearly
          <input
            className="input w-28"
            type="number"
            min={0}
            value={yearly}
            onChange={(e) => setYearly(e.target.value)}
            onBlur={() => Number(yearly) !== Number(plan.yearly_price) && onPatch({ yearly_price: Number(yearly) } as never)}
          />
        </label>
        <label className="flex items-center gap-1.5 pb-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={plan.is_active}
            onChange={(e) => onPatch({ is_active: e.target.checked })}
          />
          Active
        </label>
        <button
          className="pb-2 text-xs text-red-600 hover:underline"
          onClick={onDelete}
          title="Deletion is refused once the plan has payments against it"
        >
          Delete
        </button>
      </div>

      {/*
        What the package includes. These are the plan's own description of
        itself — they do NOT currently grant anything. A gym's real access
        still comes from the camera/Telegram switches on its own row.
      */}
      <div className="mt-2.5 flex flex-wrap items-end gap-x-4 gap-y-2 border-t border-slate-100 pt-2.5">
        <span className="pb-1.5 text-xs font-medium text-slate-400">Includes</span>
        <label className="flex items-center gap-1.5 pb-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={plan.camera}
            onChange={(e) => onPatch({ camera: e.target.checked })}
          />
          Camera
        </label>
        <label className="flex items-center gap-1.5 pb-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={plan.telegram}
            onChange={(e) => onPatch({ telegram: e.target.checked })}
          />
          Telegram
        </label>
        <label className="text-xs text-slate-500">
          Member limit
          <input
            className="input w-24"
            type="number"
            min={1}
            placeholder="Unlimited"
            value={memberLimit}
            onChange={(e) => setMemberLimit(e.target.value)}
            onBlur={() => {
              // Blank means unlimited, which is null rather than 0 — the column
              // has a CHECK that refuses anything below 1.
              const next = memberLimit.trim() === '' ? null : Number(memberLimit);
              if (next !== plan.member_limit) onPatch({ member_limit: next });
            }}
          />
        </label>
        <label className="text-xs text-slate-500">
          Setup fee
          <input
            className="input w-24"
            type="number"
            min={0}
            value={setupFee}
            onChange={(e) => setSetupFee(e.target.value)}
            onBlur={() =>
              Number(setupFee) !== Number(plan.setup_fee) &&
              onPatch({ setup_fee: Number(setupFee) } as never)
            }
          />
        </label>
      </div>

      {savingPct > 0 && (
        <div className="mt-1 text-xs text-emerald-700">Yearly saves {savingPct}% versus paying monthly.</div>
      )}
    </div>
  );
}

function PlanForm({ onDone, onBanner }: { onDone: () => void; onBanner: (msg: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthly, setMonthly] = useState('0');
  const [yearly, setYearly] = useState('0');
  const [camera, setCamera] = useState(false);
  const [telegram, setTelegram] = useState(false);
  const [memberLimit, setMemberLimit] = useState('');
  const [setupFee, setSetupFee] = useState('0');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await platformApi.post('/billing/plans', {
        name,
        description: description || null,
        monthly_price: Number(monthly),
        yearly_price: Number(yearly),
        camera,
        telegram,
        member_limit: memberLimit.trim() === '' ? null : Number(memberLimit),
        setup_fee: Number(setupFee),
      });
      onBanner(`Plan "${name}" added.`);
      onDone();
    } catch (err) {
      onBanner(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap gap-2">
        <input className="input flex-1" placeholder="Plan name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input w-28" type="number" min={0} placeholder="Monthly" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        <input className="input w-28" type="number" min={0} placeholder="Yearly" value={yearly} onChange={(e) => setYearly(e.target.value)} />
      </div>
      <input className="input" placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <span className="pb-1.5 text-xs font-medium text-slate-400">Includes</span>
        <label className="flex items-center gap-1.5 pb-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={camera} onChange={(e) => setCamera(e.target.checked)} />
          Camera
        </label>
        <label className="flex items-center gap-1.5 pb-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={telegram} onChange={(e) => setTelegram(e.target.checked)} />
          Telegram
        </label>
        <label className="text-xs text-slate-500">
          Member limit
          <input
            className="input w-24"
            type="number"
            min={1}
            placeholder="Unlimited"
            value={memberLimit}
            onChange={(e) => setMemberLimit(e.target.value)}
          />
        </label>
        <label className="text-xs text-slate-500">
          Setup fee
          <input
            className="input w-24"
            type="number"
            min={0}
            value={setupFee}
            onChange={(e) => setSetupFee(e.target.value)}
          />
        </label>
      </div>
      <button className="btn-primary" disabled={busy || name.trim().length === 0} onClick={() => void submit()}>
        {busy ? 'Adding…' : 'Add plan'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* accounts, pricing rules, instructions                               */
/* ------------------------------------------------------------------ */

function SettingsForm({
  settings,
  onSave,
  saving,
}: {
  settings: AdminSettings;
  onSave: (patch: Partial<AdminSettings>, message: string) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);
  const set = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Mirrors the server-side matcher so you can see what the bank will be asked
  // to match, without having to save first.
  const liveSuffix = (form.cbe_account_number ?? '').replace(/\D/g, '').slice(-8);

  return (
    <>
      <div className="card">
        <div className="mb-3 text-sm font-semibold">Global rules</div>
        <div className="flex flex-wrap gap-4">
          <label className="text-xs text-slate-500">
            Currency
            <input className="input w-24" value={form.currency} onChange={(e) => set('currency', e.target.value)} />
          </label>
          <label className="text-xs text-slate-500">
            Receipt max age (days)
            <input
              className="input w-24"
              type="number"
              min={1}
              max={365}
              value={form.receipt_max_age_days}
              onChange={(e) => set('receipt_max_age_days', Number(e.target.value))}
            />
          </label>
          <label className="text-xs text-slate-500">
            Grace days after expiry
            <input
              className="input w-24"
              type="number"
              min={0}
              max={90}
              value={form.grace_days}
              onChange={(e) => set('grace_days', Number(e.target.value))}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          A receipt older than the maximum age is rejected, so an old transfer cannot be reused to buy a
          fresh subscription.
        </p>
      </div>

      <ProviderCard
        provider="CBE"
        heading="Commercial Bank of Ethiopia"
        enabled={form.cbe_enabled}
        onToggle={(v) => set('cbe_enabled', v)}
        accountLabel="Account number"
        account={form.cbe_account_number ?? ''}
        onAccount={(v) => set('cbe_account_number', v || null)}
        name={form.cbe_account_name ?? ''}
        onName={(v) => set('cbe_account_name', v || null)}
        note={
          <>
            Receipts are matched on the account number, and verification matches on the last 8 digits —
            currently <code className="font-mono">{liveSuffix || '········'}</code>. When a receipt does not
            identify the receiver at all, the payment is accepted on its code, amount and date, and a warning
            is recorded on the row below — review those.
          </>
        }
      />

      <ProviderCard
        provider="TELEBIRR"
        heading="Telebirr"
        enabled={form.telebirr_enabled}
        onToggle={(v) => set('telebirr_enabled', v)}
        accountLabel="Telebirr phone number"
        account={form.telebirr_phone ?? ''}
        onAccount={(v) => set('telebirr_phone', v || null)}
        name={form.telebirr_account_name ?? ''}
        onName={(v) => set('telebirr_account_name', v || null)}
        note={
          <>
            Wallet receipts print the receiver partly masked (e.g. <code className="font-mono">2519****9660</code>),
            so matching compares the digits that are visible. A receipt naming a different number is rejected;
            one too masked to judge is accepted with a warning.
          </>
        }
      />

      <div className="card">
        <div className="mb-2 text-sm font-semibold">Instructions shown to gyms</div>
        <textarea
          className="input min-h-[5rem]"
          placeholder="Free text shown under the account details on the billing page — e.g. how long verification takes, who to call."
          value={form.instructions ?? ''}
          onChange={(e) => set('instructions', e.target.value || null)}
        />
      </div>

      <div className="flex justify-end">
        <button
          className="btn-primary"
          disabled={saving}
          onClick={() =>
            onSave(
              {
                cbe_enabled: form.cbe_enabled,
                cbe_account_number: form.cbe_account_number,
                cbe_account_name: form.cbe_account_name,
                telebirr_enabled: form.telebirr_enabled,
                telebirr_phone: form.telebirr_phone,
                telebirr_account_name: form.telebirr_account_name,
                currency: form.currency,
                receipt_max_age_days: form.receipt_max_age_days,
                grace_days: form.grace_days,
                instructions: form.instructions,
              },
              'Billing settings saved.',
            )
          }
        >
          {saving ? 'Saving…' : 'Save billing settings'}
        </button>
      </div>
    </>
  );
}

function ProviderCard({
  provider,
  heading,
  enabled,
  onToggle,
  accountLabel,
  account,
  onAccount,
  name,
  onName,
  note,
}: {
  provider: 'CBE' | 'TELEBIRR';
  heading: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  accountLabel: string;
  account: string;
  onAccount: (v: string) => void;
  name: string;
  onName: (v: string) => void;
  note: ReactNode;
}) {
  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-2.5">
        <ProviderMark provider={provider} size="h-7" />
        <div className="text-sm font-semibold">{heading}</div>
        <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
          Enabled
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="min-w-[12rem] flex-1 text-xs text-slate-500">
          {accountLabel}
          <input className="input font-mono" value={account} onChange={(e) => onAccount(e.target.value)} />
        </label>
        <label className="min-w-[12rem] flex-1 text-xs text-slate-500">
          Account name
          <input className="input" value={name} onChange={(e) => onName(e.target.value)} />
        </label>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{note}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* attempts table                                                      */
/* ------------------------------------------------------------------ */

function AttemptsTable() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BillingStatus | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  // The query key is the debounced value, not the raw one: typing "telebirr"
  // otherwise fires eight searches against a table that only gets longer.
  const debouncedSearch = useDebounced(search);

  const q = useQuery({
    queryKey: ['billing-attempts', debouncedSearch, status, page, pageSize],
    queryFn: async () =>
      (
        await platformApi.get<{
          data: AttemptRow[];
          meta: { page: number; pageSize: number; total: number; totalPages: number };
        }>('/billing/payments', {
          params: { search: debouncedSearch || undefined, status: status || undefined, page, pageSize },
        })
      ).data,
    // Keeps the current page on screen while the next one loads, instead of
    // collapsing the table to "Loading…" and bouncing the page height.
    placeholderData: (previous) => previous,
    retry: false,
  });

  const rows = q.data?.data ?? [];
  const meta = q.data?.meta;

  return (
    <div className="card">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="text-sm font-semibold">Verification attempts</div>
        <input
          className="input max-w-xs"
          placeholder="Search reference, code, payer, gym…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          className="w-40"
          value={status}
          label="Status"
          onChange={(next) => {
            setStatus(next as BillingStatus | '');
            setPage(1);
          }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'VERIFIED', label: 'Verified' },
            { value: 'REJECTED', label: 'Rejected' },
          ]}
        />
      </div>

      {/* Keeping the previous page on screen means nothing visibly happens on a
          slow request, so the table dims while the next one is in flight. */}
      <div
        className={`-mx-5 overflow-x-auto px-5 transition-opacity ${
          q.isFetching && !q.isLoading ? 'opacity-50' : ''
        }`}
      >
        <table className="w-full min-w-[52rem] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Gym</th>
              <th className="py-2 pr-3">Method</th>
              <th className="py-2 pr-3">Reference</th>
              <th className="py-2 pr-3">Code</th>
              <th className="py-2 pr-3">Amount</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">When</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="py-2 pr-3">
                  <div className="font-medium">{row.gym_name}</div>
                  <div className="text-xs text-slate-400">{row.owner_email ?? ''}</div>
                </td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-1.5">
                    <ProviderMark provider={row.provider} size="h-5" />
                    <span className="text-xs">{row.provider}</span>
                  </div>
                  {row.source === 'ADMIN' && (
                    <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      recorded by hand
                    </span>
                  )}
                </td>
                <td className="max-w-[12rem] truncate py-2 pr-3 font-mono text-xs">{row.reference ?? '—'}</td>
                <td className="py-2 pr-3 font-mono text-xs">{row.reason_code ?? '—'}</td>
                <td className="whitespace-nowrap py-2 pr-3">
                  {row.amount ? money(row.amount, row.currency ?? 'ETB') : '—'}
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      row.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {row.status === 'VERIFIED' ? 'Verified' : 'Rejected'}
                  </span>
                  {row.failure_reason && (
                    <div className="mt-1 max-w-[16rem] text-xs text-slate-500">{row.failure_reason}</div>
                  )}
                  {row.warnings?.map((w) => (
                    <div key={w} className="mt-1 max-w-[16rem] text-xs text-amber-600">
                      ⚠ {w}
                    </div>
                  ))}
                </td>
                <td className="whitespace-nowrap py-2 text-xs text-slate-500">
                  {new Date(row.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {!q.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  No attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && (
        <Pager
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          totalPages={meta.totalPages}
          onPage={setPage}
          onPageSize={(size) => {
            setPageSize(size);
            // Row 400 is on page 16 at 25/page and page 4 at 100 — keeping the
            // page number would land somewhere unrelated, or past the end.
            setPage(1);
          }}
          noun="attempts"
        />
      )}
    </div>
  );
}
