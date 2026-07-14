export type MemberStatus = 'active' | 'expiring' | 'grace' | 'expired' | 'frozen';
export type Severity = 'green' | 'yellow' | 'orange' | 'red' | 'blue';
export type PaymentMethod = 'cash' | 'telebirr' | 'bank' | 'other';
export type DecisionCode =
  | 'allowed'
  | 'denied_expired'
  | 'denied_frozen'
  | 'denied_session_limit'
  | 'denied_hours'
  | 'override';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  gym_id: number;
}

export interface Plan {
  id: number;
  name: string;
  duration_days: number;
  price: string;
  sessions_per_day: number | null;
  includes: Record<string, boolean>;
  allowed_hours: string | null;
  active: boolean;
}

export interface Member {
  id: number;
  full_name: string;
  phone: string | null;
  sex: 'male' | 'female' | null;
  telegram_chat_id: number | null;
  photo_url: string | null;
  status: MemberStatus;
  joined_at: string;
  plan_name?: string | null;
  expires_at?: string | null;
}

export interface Subscription {
  id: number;
  plan_id: number;
  plan_name: string;
  starts_at: string;
  expires_at: string;
  status: 'active' | 'frozen' | 'expired';
  frozen_days_remaining: number | null;
}

export interface Payment {
  id: number;
  member_id: number;
  member_name?: string;
  marked_by_name?: string;
  amount: string;
  method: PaymentMethod;
  note: string | null;
  created_at: string;
}

export interface CheckIn {
  id: number;
  member_id: number | null;
  member_name?: string | null;
  guest_name?: string | null;
  checked_in_at: string;
  checked_out_at: string | null;
  decision: DecisionCode;
}

export interface GymEvent {
  id: number;
  type: string;
  severity: Severity;
  message: string;
  member_id: number | null;
  created_at: string;
}

export interface Decision {
  allowed: boolean;
  code: DecisionCode;
  severity: Severity;
  message: string;
  daysRemaining: number | null;
  derivedStatus: MemberStatus;
}

export interface RecognizeResult {
  matched: boolean;
  debounced?: boolean;
  pending?: boolean;
  member?: { id: number; full_name: string; status: MemberStatus };
  guest?: { id: number; name: string };
  decision?: Decision;
  checkInId?: number;
}

export interface GuestDescriptor {
  guest_id: number;
  name: string;
  valid_until: string;
  descriptor: number[];
}

export interface Guest {
  id: number;
  name: string;
  valid_until: string;
  created_by_name?: string;
  converted_member_id: number | null;
  converted_member_name?: string | null;
  created_at: string;
}

export interface MemberDescriptors {
  member_id: number;
  full_name: string;
  status: MemberStatus;
  descriptors: number[][];
}

export interface GymSettings {
  grace_period_days: number;
  auto_checkout_hours: number;
  expiry_reminder_days: number;
  absence_nudge_days: number;
  match_threshold: number;
  closing_time: string;
  entry_mode: 'auto' | 'manual';
}

export interface Gym {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  telegram_bot_token: string | null;
  settings: GymSettings;
}

export interface DashboardStats {
  check_ins_today: number;
  occupancy: number;
  revenue_this_month: number;
  expiring_in_7_days: number;
  members_by_status: Partial<Record<MemberStatus, number>>;
  peak_hours: { hour: number; count: number }[];
}
