/** Billing types — aligned with billing APIs + openapi Subscription */

import type { Subscription } from './auth';

export interface BillingPlan {
  id: string;
  name: string;
  price: number | null;
  currency?: string;
  interval?: string;
  custom?: boolean;
}

export interface BillingPlansResponse {
  plans: BillingPlan[];
  configured?: boolean;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  clientName?: string;
  totalAmount?: number;
  status?: string;
  orgId?: string;
  createdAt?: string;
}

export interface InvoicesResponse {
  success?: boolean;
  count?: number;
  invoices: Invoice[];
}

export interface Payment {
  id?: string;
  _id?: string;
  razorpay_order_id?: string;
  reference?: string;
  amount?: number;
  plan?: string;
  status?: string;
  createdAt?: string;
  paidAt?: string;
  date?: string;
}

export interface PaymentsResponse {
  success?: boolean;
  count?: number;
  payments: Payment[];
}

export interface RevenueDashboard {
  success?: boolean;
  totalRevenue?: number;
  paidRevenue?: number;
  pendingRevenue?: number;
  proposalCount?: number;
  invoiceCount?: number;
  paymentCount?: number;
  averageDealSize?: number;
}

export type { Subscription };
