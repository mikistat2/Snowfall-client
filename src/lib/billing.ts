import { api } from './api';

/**
 * Subscription billing for the gym: what we owe the platform, and proof that
 * it was paid. Mirrors server/src/types.ts — keep the two in step.
 */

export type BillingProvider = 'CBE' | 'TELEBIRR' | 'CASH';
export type BillingStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type CheckState = 'pass' | 'fail' | 'warn' | 'skip';

export interface PaymentCheck {
  key: string;
  label: string;
  state: CheckState;
  expected: string | null;
  actual: string | null;
  message: string;
}

export interface BillingPlan {
  id: number;
  name: string;
  description: string | null;
  monthly_price: string;
  yearly_price: string;
  currency: string;
  is_active: boolean;
  sort_order: number;
}

export interface BillingPayment {
  id: number;
  provider: BillingProvider;
  source: 'MANUAL' | 'IMAGE' | 'ADMIN';
  status: BillingStatus;
  reference: string | null;
  reason_code: string | null;
  selected_cycle: BillingCycle | null;
  granted_cycle: BillingCycle | null;
  amount: string | null;
  currency: string | null;
  payer_name: string | null;
  payer_account: string | null;
  receiver_name: string | null;
  receiver_account: string | null;
  transaction_at: string | null;
  period_end: string | null;
  failure_reason: string | null;
  warnings: string[] | null;
  checks: PaymentCheck[] | null;
  note: string | null;
  created_at: string;
}

export interface BillingProviderOption {
  provider: Exclude<BillingProvider, 'CASH'>;
  label: string;
  accountNumber: string;
  accountName: string | null;
}

export interface BillingCheckout {
  paymentsRequired: boolean;
  active: boolean;
  comped: boolean;
  isTrial: boolean;
  expiresAt: string | null;
  reasonCode: string;
  plans: BillingPlan[];
  currentPlanId: number | null;
  currentCycle: BillingCycle | null;
  currency: string;
  instructions: string | null;
  providers: BillingProviderOption[];
  /** false → no provider is set up, or the verification key is missing. */
  configured: boolean;
  graceDays: number;
}

export interface VerificationResult {
  verified: boolean;
  payment: BillingPayment;
  checks: PaymentCheck[];
  error: string | null;
  paid: boolean;
  expiresAt: string | null;
}

/**
 * Per-call timeouts. The global default is far too short here: a bank lookup
 * runs to 60s and a screenshot upload plus lookup to 120s. A client that gives
 * up early produces the worst failure mode there is — the server finishes the
 * work and commits, and the browser has already stopped listening.
 */
const LOOKUP_TIMEOUT = 60_000;
const UPLOAD_TIMEOUT = 120_000;

export async function fetchCheckout(): Promise<BillingCheckout> {
  return (await api.get<BillingCheckout>('/billing')).data;
}

export async function fetchHistory(limit = 5): Promise<BillingPayment[]> {
  return (await api.get<BillingPayment[]>('/billing/payments', { params: { limit } })).data;
}

export async function verifyReference(input: {
  provider: Exclude<BillingProvider, 'CASH'>;
  reference: string;
  planId: number;
  cycle: BillingCycle;
}): Promise<VerificationResult> {
  return (await api.post<VerificationResult>('/billing/verify', input, { timeout: LOOKUP_TIMEOUT })).data;
}

export async function verifyScreenshot(input: {
  provider: Exclude<BillingProvider, 'CASH'>;
  file: File;
  planId: number;
  cycle: BillingCycle;
}): Promise<VerificationResult> {
  const form = new FormData();
  form.append('provider', input.provider);
  form.append('planId', String(input.planId));
  form.append('cycle', input.cycle);
  form.append('file', input.file);
  return (
    await api.post<VerificationResult>('/billing/verify-screenshot', form, { timeout: UPLOAD_TIMEOUT })
  ).data;
}

// ------------------------------------------------------------- helpers -----

export function money(amount: string | number, currency: string): string {
  return `${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysUntil(value: string | null): number | null {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
}

/** Months free per year on the yearly price — the saving worth advertising. */
export function yearlySavingMonths(plan: BillingPlan): number {
  const monthly = Number(plan.monthly_price);
  const yearly = Number(plan.yearly_price);
  if (monthly <= 0 || yearly <= 0) return 0;
  return Math.max(0, Math.round(12 - yearly / monthly));
}

export function priceFor(plan: BillingPlan, cycle: BillingCycle): number {
  return Number(cycle === 'YEARLY' ? plan.yearly_price : plan.monthly_price);
}
