import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';

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
        <h1 className="text-xl font-bold">{t('app.name')}</h1>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
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
