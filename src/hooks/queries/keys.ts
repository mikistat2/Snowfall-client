import type { MemberFilter } from '../../api/members';
import type { PaymentFilter } from '../../api/payments';

/**
 * Every query key in one place. Keys are prefix-structured so a broad
 * invalidation (`['members']`) catches every filtered variant, which is what
 * mutations rely on.
 */
export const qk = {
  dashboard: ['dashboard'] as const,
  today: ['today-digest'] as const,

  members: (filter: MemberFilter = {}) => ['members', filter] as const,
  membersAll: ['members'] as const,
  member: (id: number) => ['member', id] as const,

  plans: ['plans'] as const,

  payments: (filter: PaymentFilter = {}) => ['payments', filter] as const,
  paymentsAll: ['payments'] as const,

  settings: ['settings'] as const,
  features: ['features'] as const,
  staff: ['staff'] as const,

  events: ['events'] as const,
  occupancy: ['occupancy'] as const,
  openCheckIns: ['check-ins-open'] as const,
};
