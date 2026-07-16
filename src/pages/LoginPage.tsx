import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import loginLogo from '../assets/images/login-logo.png';

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4">
        <img
          src={loginLogo}
          alt="Snowfall Gym Management System"
          className="mx-auto mb-2 w-40 rounded-xl"
        />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <h1
  className="
    mt-4
    text-[22px]
    font-display
    font-black
    uppercase
    leading-none
    tracking-wider
    bg-gradient-to-br
    from-sky-900
    via-sky-400
    to-sky-700
    bg-clip-text
    text-transparent
    drop-shadow-[0_0_8px_rgba(96,165,250,0.45)]
    [text-shadow:0_0_8px_rgba(255,255,255,0.35)] align-center justify-center flex
  "
>
  Welcome Back
</h1>
        <div>
          <label className="label">{t('auth.email')}</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">{t('auth.password')}</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {t('auth.login')}
        </button>
        <Link to="/register" className="block text-center text-sm text-slate-500 hover:text-slate-800">
          {t('auth.noAccount')}
        </Link>
      </form>
    </div>
  );
}
