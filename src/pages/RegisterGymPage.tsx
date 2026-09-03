import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiErrorMessage } from '../lib/api';
import { t } from '../i18n/strings';
import loginLogo from '../assets/images/login-logo.png';
import { AuthShell } from '../components/ui/AuthShell';
import { PasswordInput } from '../components/ui/PasswordInput';
import { PlanPicker, type BillingCycle } from '../components/ui/PlanPicker';
import { TrialBanner } from '../components/ui/TrialBanner';
import { TermsModal } from '../components/ui/TermsModal';
import { PhoneInput } from '../components/ui/PhoneInput';
import { useRegistrationMode } from '../hooks/queries/useRegistrationMode';

export function RegisterGymPage() {
  const { registerGym } = useAuth();
  const { data: mode } = useRegistrationMode();
  const [form, setForm] = useState({
    gymName: '',
    address: '',
    gymPhone: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [planId, setPlanId] = useState<number | null>(null);
  // Monthly by default: it is the smaller commitment, and the yearly tab
  // carries its own discount badge to argue for itself.
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // Preselected once the list arrives, but only if the gym has not already
  // picked — a late refetch must not move the choice out from under them.
  useEffect(() => {
    setPlanId((current) => current ?? mode?.plans[0]?.id ?? null);
  }, [mode]);

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
        // Omitted rather than sent as null when the plan list could not be
        // loaded: the field is optional server-side, and a gym should not be
        // blocked from signing up because the pricing endpoint was down.
        ...(planId ? { planId, cycle } : {}),
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
    <AuthShell
      wide
      title={t('auth.registerGym')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <Link to="/login" className="font-medium text-accent hover:underline">
          {t('auth.haveAccount')}
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <TrialBanner variant="register" />
        {error && <p className="alert-error">{error}</p>}

        <Section title={t('auth.sectionGym')}>
          <div>
            <label className="label" htmlFor="reg-gym">
              {t('auth.gymName')}
            </label>
            <input
              id="reg-gym"
              className="input"
              value={form.gymName}
              onChange={set('gymName')}
              required
              minLength={2}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="reg-address">
                {t('auth.address')}
              </label>
              <input id="reg-address" className="input" value={form.address} onChange={set('address')} />
            </div>
            <div className="sm:col-span-3">
              <label className="label">{t('auth.phone')}</label>
              <PhoneInput value={form.gymPhone} onChange={(v) => setForm((f) => ({ ...f, gymPhone: v }))} />
            </div>
          </div>
        </Section>

        <Section title={t('auth.sectionOwner')}>
          <div>
            <label className="label" htmlFor="reg-name">
              {t('auth.ownerName')}
            </label>
            <input
              id="reg-name"
              className="input"
              value={form.ownerName}
              onChange={set('ownerName')}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="label" htmlFor="reg-email">
              {t('auth.email')}
            </label>
            <input
              id="reg-email"
              className="input"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="reg-pw">
                {t('auth.password')}
              </label>
              <PasswordInput
                id="reg-pw"
                value={form.password}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <div>
              <label className="label" htmlFor="reg-pw2">
                {t('auth.confirmPassword')}
              </label>
              <PasswordInput
                id="reg-pw2"
                value={form.confirmPassword}
                onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
                autoComplete="new-password"
                minLength={8}
                invalid={passwordsMismatch}
              />
              {passwordsMismatch && (
                <p className="mt-1 text-xs text-danger">{t('auth.passwordMismatch')}</p>
              )}
            </div>
          </div>
        </Section>

        {/* Hidden entirely when the list is empty or unreachable, rather than
            shown as an empty box: registration works without a plan. */}
        {mode?.plans.length ? (
          <Section title={t('auth.sectionPlan')}>
            <PlanPicker
              plans={mode.plans}
              value={planId}
              onChange={setPlanId}
              cycle={cycle}
              onCycle={setCycle}
            />
          </Section>
        ) : null}

        <label className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-fg-muted">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-sky-600"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            required
          />
          <span>
            {t('auth.agreeTerms')}{' '}
            <button
              type="button"
              className="font-semibold text-accent underline underline-offset-2"
              onClick={() => setTermsOpen(true)}
            >
              {t('auth.termsLink')}
            </button>
          </span>
        </label>

        <button className="btn-primary w-full" disabled={busy || passwordsMismatch || !agreedToTerms}>
          {busy ? `${t('auth.createAccount')}…` : t('auth.createAccount')}
        </button>
        {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
      </form>
    </AuthShell>
  );
}

/**
 * A labelled group of fields, with a rule that names what it is asking for.
 *
 * The visible heading is a div, not the `legend` — a legend is laid out into
 * the fieldset's border gap and does not reliably take flex sizing, which is
 * what the divider rule needs. The legend stays, screen-reader only, so the
 * grouping is still announced.
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">{title}</legend>
      <div
        aria-hidden
        className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-fg-muted"
      >
        {title}
        <span className="h-px flex-1 bg-line" />
      </div>
      {children}
    </fieldset>
  );
}

/** Shown after a successful registration while it awaits platform-admin approval. */
function PendingApprovalScreen({ gymName, email }: { gymName: string; email: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-sky-950 to-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <img src={loginLogo} alt="" className="mx-auto mb-5 h-16 w-16 rounded-2xl object-cover" />
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
