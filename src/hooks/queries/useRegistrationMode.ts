import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

/**
 * What signing up looks like right now: whether a free trial is running, and
 * which packages a gym can pick from.
 *
 * Public and unauthenticated — it is read by the landing, pricing-adjacent and
 * registration screens, none of which have a session yet.
 *
 * One hook rather than a `useQuery` per consumer so the trial banner and the
 * plan picker on the same screen share a single request; they were two calls
 * to the same endpoint before the plans were added to it.
 */

export interface SignupPlan {
  id: number;
  name: string;
  description: string | null;
  /** NUMERIC columns arrive as strings — format, never arithmetic. */
  monthly_price: string;
  yearly_price: string;
  currency: string;
  /** What the package includes. See the billing_plan_packages migration. */
  camera: boolean;
  telegram: boolean;
  setup_fee: string;
}

export interface RegistrationMode {
  trial_mode: boolean;
  trial_days: number;
  plans: SignupPlan[];
}

export function useRegistrationMode() {
  return useQuery({
    queryKey: ['registration-mode'],
    queryFn: async () => (await api.get<RegistrationMode>('/auth/registration-mode')).data,
    staleTime: 60_000,
    // A signup screen that cannot reach the API should show its form, not spin:
    // the plan picker degrades to "no packages listed" and the trial banner to
    // nothing, and the registration itself still works without a plan.
    retry: false,
  });
}
