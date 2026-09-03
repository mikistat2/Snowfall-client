import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiErrorMessage } from '../lib/api';
import { NATIVE } from '../lib/platform';
import { t } from '../i18n/strings';
import { AuthShell } from '../components/ui/AuthShell';
import { PasswordInput } from '../components/ui/PasswordInput';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={t('auth.welcomeBack')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        /* Sign-up is web-only — App.tsx registers /register behind !NATIVE
           because the app is installed by staff of an already-registered gym.
           Rendering the link on the phone gave a dead tap that fell through
           the catch-all route straight back to this screen. */
        !NATIVE && (
          <Link to="/register" className="font-medium text-accent hover:underline">
            {t('auth.noAccount')}
          </Link>
        )
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* whitespace-pre-line: a frozen account's message carries the platform
            admin's reason on its own line. Every other error here is one line. */}
        {error && <p className="alert-error whitespace-pre-line leading-relaxed">{error}</p>}

        <div>
          <label className="label" htmlFor="login-email">
            {t('auth.email')}
          </label>
          <input
            id="login-email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="login-password">
            {t('auth.password')}
          </label>
          <PasswordInput id="login-password" value={password} onChange={setPassword} />
        </div>

        <button className="btn-primary mt-2 w-full" disabled={busy}>
          {busy ? `${t('auth.login')}…` : t('auth.login')}
        </button>
      </form>
    </AuthShell>
  );
}
