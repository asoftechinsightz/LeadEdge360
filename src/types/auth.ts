/** Auth & user types — mirrors docs/openapi.json User + AuthTokens */

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'agent';
export type UserStatus = 'active' | 'invited' | 'suspended' | 'deleted';

export interface User {
  id: string;
  tenantId?: string;
  orgId?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  name?: string;
  picture?: string;
  role?: UserRole | string;
  status?: UserStatus | string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  preferences?: Record<string, unknown>;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
  user: User;
}

export interface SubscriptionInfo {
  plan: string;
  subscription: Subscription | null;
}

export interface Subscription {
  id?: string;
  productCode?: string;
  planCode?: string;
  plan?: string;
  status?: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | string;
  currentEnd?: string;
  renewalDate?: string;
  limits?: Record<string, unknown>;
}
