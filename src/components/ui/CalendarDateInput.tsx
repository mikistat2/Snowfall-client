import { useEffect, useState } from 'react';
import { getLocale, t } from '../../i18n/strings';
import { Select } from './Select';
import {
  ETHIOPIAN_MONTHS,
  ethiopianToGregorian,
  formatEthiopian,
  formatGregorian,
  gregorianToEthiopian,
  isValidEthiopianDate,
  type EthiopianDate,
} from '../../lib/ethiopian';

export type CalendarSystem = 'gregorian' | 'ethiopian';

interface Props {
  label: string;
  calendar: CalendarSystem;
  /** Always a Gregorian "YYYY-MM-DD", or '' while the fields are incomplete. */
  value: string;
  onChange: (value: string) => void;
  /** Bounds are Gregorian too, whichever calendar is being typed in. */
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}

interface Parts {
  day: string;
  month: string;
  year: string;
}

const EMPTY: Parts = { day: '', month: '', year: '' };

function toParts(iso: string): Parts {
  if (!iso) return EMPTY;
  const e = gregorianToEthiopian(iso);
  return { day: String(e.day), month: String(e.month), year: String(e.year) };
}

function partsToIso(parts: Parts): string {
  if (!parts.day || !parts.month || !parts.year) return '';
  const date: EthiopianDate = { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
  return isValidEthiopianDate(date) ? ethiopianToGregorian(date) : '';
}

/**
 * A date field that can be filled in either calendar and always reports a
 * Gregorian "YYYY-MM-DD" upward.
 *
 * Ethiopian mode is three separate boxes rather than a picker: the dates come
 * off a paper register where the month is written as a word, so a day/month/
 * year trio is a direct transcription and needs no mental conversion. The line
 * underneath always echoes the date in the *other* calendar, which is how a
 * mistyped year (the two calendars run ~8 apart) gets caught on the spot.
 */
export function CalendarDateInput({
  label,
  calendar,
  value,
  onChange,
  min,
  max,
  required,
  disabled,
  hint,
}: Props) {
  const locale = getLocale() === 'am' ? 'am' : 'en';
  const [parts, setParts] = useState<Parts>(() => toParts(value));

  // Re-seed the boxes when the value is changed from outside (calendar toggle,
  // a default derived from another field) but not while they are being typed.
  useEffect(() => {
    setParts((prev) => (partsToIso(prev) === value ? prev : toParts(value)));
  }, [value]);

  function setPart(patch: Partial<Parts>): void {
    const next = { ...parts, ...patch };
    setParts(next);
    onChange(partsToIso(next));
  }

  const outOfRange = Boolean(value) && ((min && value < min) || (max && value > max));
  // All three boxes filled but nothing came out of them: Pagume 8, Tir 31, …
  const impossible =
    calendar === 'ethiopian' && !value && Boolean(parts.day && parts.month && parts.year);

  return (
    <div>
      <label className="label">{label}</label>

      {calendar === 'ethiopian' ? (
        <div className="grid grid-cols-[minmax(0,4rem)_minmax(0,1fr)_minmax(0,5rem)] gap-2">
          <input
            className="input"
            type="number"
            min="1"
            max="30"
            inputMode="numeric"
            placeholder={t('date.day')}
            aria-label={`${label} — ${t('date.day')}`}
            value={parts.day}
            disabled={disabled}
            required={required}
            onChange={(e) => setPart({ day: e.target.value })}
          />
          <Select
            aria-label={`${label} — ${t('date.month')}`}
            label={t('date.month')}
            placeholder={t('date.month')}
            value={parts.month}
            disabled={disabled}
            onChange={(month) => setPart({ month })}
            options={ETHIOPIAN_MONTHS.map((month, index) => ({
              value: String(index + 1),
              label: locale === 'am' ? month.am : month.en,
            }))}
          />
          <input
            className="input"
            type="number"
            min="1900"
            max="2100"
            inputMode="numeric"
            placeholder={t('date.year')}
            aria-label={`${label} — ${t('date.year')}`}
            value={parts.year}
            disabled={disabled}
            required={required}
            onChange={(e) => setPart({ year: e.target.value })}
          />
        </div>
      ) : (
        <input
          className="input"
          type="date"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {/* the same date in the other calendar — the typo check */}
      <p className="mt-1 text-xs text-fg-subtle">
        {impossible ? (
          <span className="text-red-600 dark:text-red-400">{t('date.invalid')}</span>
        ) : value ? (
          <span className={outOfRange ? 'text-red-600 dark:text-red-400' : 'text-fg-muted'}>
            {calendar === 'ethiopian'
              ? `${t('date.gregorianIs')} ${formatGregorian(value, locale)}`
              : `${t('date.ethiopianIs')} ${formatEthiopian(value, locale)}`}
          </span>
        ) : (
          hint ?? (calendar === 'ethiopian' ? t('date.ethiopianHint') : '')
        )}
      </p>
    </div>
  );
}
