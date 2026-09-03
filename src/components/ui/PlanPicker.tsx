import type { ReactNode } from 'react';
import { t } from '../../i18n/strings';
import type { SignupPlan } from '../../hooks/queries/useRegistrationMode';
import { CameraIcon, CheckIcon } from './icons';

/**
 * The package a gym signs up for.
 *
 * Radio cards rather than a dropdown: this is the one decision on the form
 * that costs money, and a collapsed control hides the comparison that makes it
 * decidable. It is also the only field a gym cannot answer from memory.
 *
 * The camera line is a promise we have to keep honest — face recognition needs
 * an on-site install and carries a setup fee, so a gym picking a camera
 * package is told plainly that it switches on later, not today. Signing up
 * grants Telegram only, whatever is chosen here (authService's
 * UNPAID_ENTITLEMENTS); this is the record of what they came for.
 */
export function PlanPicker({
  plans,
  value,
  onChange,
}: {
  plans: SignupPlan[];
  value: number | null;
  onChange: (planId: number) => void;
}) {
  if (plans.length === 0) return null;

  const chosen = plans.find((p) => p.id === value);

  return (
    <div className="space-y-2.5">
      {plans.map((plan) => {
        const selected = plan.id === value;
        return (
          <label
            key={plan.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
              selected
                ? 'border-accent bg-accent/5 ring-1 ring-accent'
                : 'border-line bg-surface hover:bg-surface-2'
            }`}
          >
            <input
              type="radio"
              name="plan"
              className="mt-1 h-4 w-4 shrink-0 accent-sky-600"
              checked={selected}
              onChange={() => onChange(plan.id)}
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-semibold text-fg">{plan.name}</span>
                <span className="text-sm font-semibold tabular-nums text-fg">
                  {Number(plan.monthly_price).toLocaleString()} {plan.currency}
                  <span className="font-normal text-fg-muted">{t('auth.perMonth')}</span>
                </span>
              </span>

              {plan.description && (
                <span className="mt-1 block text-xs leading-relaxed text-fg-muted">{plan.description}</span>
              )}

              <span className="mt-2 flex flex-wrap items-center gap-1.5">
                {plan.telegram && <Tag icon={<CheckIcon className="h-3 w-3" />} label={t('auth.includesTelegram')} />}
                {plan.camera && <Tag icon={<CameraIcon className="h-3 w-3" />} label={t('auth.includesCamera')} />}
                {Number(plan.setup_fee) > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                    +{Number(plan.setup_fee).toLocaleString()} {t('auth.setupFee')}
                  </span>
                )}
              </span>
            </span>
          </label>
        );
      })}

      {chosen?.camera && (
        <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
          {t('auth.cameraAfterSetup')}
        </p>
      )}
      <p className="text-xs text-fg-subtle">{t('auth.planHint')}</p>
    </div>
  );
}

function Tag({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-muted">
      {icon}
      {label}
    </span>
  );
}
