import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import loginLogo from '../assets/images/login-logo.png';
import { TrialBanner } from '../components/ui/TrialBanner';
import { TermsModal } from '../components/ui/TermsModal';

export function RegisterGymPage() {
  const { registerGym } = useAuth();
  const [form, setForm] = useState({
    gymName: '',
    address: '',
    gymPhone: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await registerGym({
        gym: { name: form.gymName, address: form.address || undefined, phone: form.gymPhone || undefined },
        owner: { name: form.ownerName, email: form.email, password: form.password },
      });
      if (result.pending) setPendingApproval(true);
      // not pending (free-trial mode): useAuth stored the session and the
      // router redirects into the app automatically
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (pendingApproval) return <PendingApprovalScreen gymName={form.gymName} email={form.email} />;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <div className="flex flex-col items-center gap-2 pb-1 text-center">
          <img
            src={loginLogo}
            alt="Snowfall Gym Management System"
            className="w-40 rounded-xl"
          />
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
    [text-shadow:0_0_8px_rgba(255,255,255,0.35)]
  "
>
  {t('auth.registerGym')}
</h1>
        </div>
        <TrialBanner variant="register" />
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
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className="label">{t('auth.confirmPassword')}</label>
            <input
              className={`input ${passwordsMismatch ? '!border-red-400 !ring-red-300' : ''}`}
              type="password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              required
              minLength={8}
            />
            {passwordsMismatch && <p className="mt-1 text-xs text-red-600">{t('auth.passwordMismatch')}</p>}
          </div>
        </div>
        <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-slate-900"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            required
          />
          <span>
            {t('auth.agreeTerms')}{' '}
            <button
              type="button"
              className="font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-900"
              onClick={() => setTermsOpen(true)}
            >
              {t('auth.termsLink')}
            </button>
          </span>
        </label>
        <button className="btn-primary w-full" disabled={busy || passwordsMismatch || !agreedToTerms}>
          {t('auth.createAccount')}
        </button>
        {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
        <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-slate-800">
          {t('auth.haveAccount')}
        </Link>
      </form>
    </div>
  );
}

/** Shown after a successful registration while it awaits platform-admin approval. */
function PendingApprovalScreen({ gymName, email }: { gymName: string; email: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-sky-950 to-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-5xl shadow-inner">
          ⏳
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{t('auth.pendingTitle')}</h1>
        <p className="mt-1 text-lg font-semibold text-sky-700">{gymName}</p>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{t('auth.pendingBody')}</p>
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="mr-1">📧</span>
          {t('auth.pendingEmail')} <span className="font-semibold text-slate-900">{email}</span>
        </div>
        <ol className="mx-auto mt-5 max-w-xs space-y-2 text-left text-sm text-slate-500">
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
              ✓
            </span>
            {t('auth.pendingStep1')}
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 animate-pulse items-center justify-center rounded-full bg-sky-100 text-xs text-sky-700">
              2
            </span>
            {t('auth.pendingStep2')}
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
              3
            </span>
            {t('auth.pendingStep3')}
          </li>
        </ol>
        <Link to="/login" className="btn-secondary mt-6 w-full">
          {t('auth.backToLogin')}
        </Link>
      </div>
    </div>
  );
}
