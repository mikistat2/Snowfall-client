import { t } from '../../i18n/strings';

export type Sex = 'male' | 'female' | '';

const OPTIONS: readonly { value: Sex; labelKey: 'select.none' | 'members.male' | 'members.female' }[] = [
  { value: '', labelKey: 'select.none' },
  { value: 'male', labelKey: 'members.male' },
  { value: 'female', labelKey: 'members.female' },
];

/**
 * Three mutually exclusive values, so they are shown rather than hidden behind
 * a dropdown: one tap instead of two, and the current value is readable
 * without opening anything. Full width, because on a phone it sits on its own
 * row like every other field.
 */
export function SexPicker({
  value,
  onChange,
  disabled,
}: {
  value: Sex;
  onChange: (value: Sex) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={t('members.sex')} className="segmented grid-cols-3">
      {OPTIONS.map((option) => (
        <button
          key={option.value || 'none'}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className="segmented-item disabled:opacity-50"
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  );
}
