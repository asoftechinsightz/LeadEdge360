'use client';

import { useSyncExternalStore } from 'react';
import { getAccessToken, getStoredUser } from '@/src/lib/auth-storage';
import type { User } from '@/src/types';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
  return getAccessToken();
}

/** Lightweight auth state for client components — no backend calls */
export function useAuth() {
  const token = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const user = getStoredUser<User>();

  return {
    isAuthenticated: Boolean(token),
    user,
    accessToken: token,
  };
}
