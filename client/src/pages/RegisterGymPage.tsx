import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';

export function RegisterGymPage() {
  const { registerGym } = useAuth();
  const [form, setForm] = useState({
    gymName: '',
    address: '',
    gymPhone: '',
    ownerName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await registerGym({
        gym: { name: form.gymName, address: form.address || undefined, phone: form.gymPhone || undefined },
        owner: { name: form.ownerName, email: form.email, password: form.password },
      });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold">{t('auth.registerGym')}</h1>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="label">{t('auth.gymName')}</label>
          <input className="input" value={form.gymName} onChange={set('gymName')} required minLength={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('auth.address')}</label>
            <input className="input" value={form.address} onChange={set('address')} />
          </div>
          <div>
            <label className="label">{t('auth.phone')}</label>
            <input className="input" value={form.gymPhone} onChange={set('gymPhone')} />
          </div>
        </div>
        <hr className="border-slate-200" />
        <div>
          <label className="label">{t('auth.ownerName')}</label>
          <input className="input" value={form.ownerName} onChange={set('ownerName')} required minLength={2} />
        </div>
        <div>
          <label className="label">{t('auth.email')}</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="label">{t('auth.password')}</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={8}
          />
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {t('auth.createAccount')}
        </button>
        <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-slate-800">
          {t('auth.haveAccount')}
        </Link>
      </form>
    </div>
  );
}
