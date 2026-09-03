import { useState } from 'react';
import { t } from '../../i18n/strings';
import { EyeIcon, EyeOffIcon } from './icons';

/**
 * A password field with a reveal toggle.
 *
 * Front-desk staff type these on a phone, one-handed, often with a strong
 * password a browser generated — and a mistyped character in a masked field is
 * invisible until the whole form is rejected. The toggle is a `button` inside
 * the field rather than a checkbox beside it so it cannot be tabbed into on
 * the way to Submit.
 */
export function PasswordInput({
  value,
  onChange,
  invalid = false,
  autoComplete = 'current-password',
  minLength,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  autoComplete?: 'current-password' | 'new-password';
  minLength?: number;
  id?: string;
}) {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        className={`input pr-11 ${invalid ? 'input-error' : ''}`}
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        minLength={minLength}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShown((s) => !s)}
        aria-label={t(shown ? 'auth.hidePassword' : 'auth.showPassword')}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:text-fg"
      >
        {shown ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
