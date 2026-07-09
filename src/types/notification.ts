/** Notification types — mirrors docs/openapi.json */

export type NotificationChannel = 'push' | 'email' | 'whatsapp' | 'inapp';

export interface Notification {
  id: string;
  channel?: NotificationChannel | string;
  type?: string;
  title?: string;
  body?: string;
  payload?: Record<string, unknown>;
  readAt?: string | null;
  createdAt?: string;
}

export interface NotificationsResponse {
  notifications?: Notification[];
}
