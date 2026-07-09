import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthTokens } from '@/src/types';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './auth-storage';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

/** Bare client for refresh — avoids interceptor recursion */
const refreshClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await refreshClient.post<AuthTokens>('/auth/refresh-token', {
      refreshToken,
    });
    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

function queueTokenRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const status = error.response?.status;
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const message =
      (error.response?.data as { error?: string; message?: string })?.error
      || error.response?.data?.message
      || error.message
      || 'Request failed';

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      const newToken = await queueTokenRefresh();
      if (newToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      clearAuthStorage();
    }

    if (typeof window !== 'undefined') {
      if (status === 401 && !original?._retry) {
        clearAuthStorage();
      }
      console.error(`[API ${status || 'ERR'}] ${message}`);
    }

    return Promise.reject({
      status: status || 500,
      message,
      code: error.response?.data?.code,
      original: error,
    });
  }
);

export type ApiError = {
  status: number;
  message: string;
  code?: string;
};

export const apiGet = async <T>(url: string, params?: Record<string, unknown>) => {
  const res = await api.get<T>(url, { params });
  return res.data;
};

export const apiPost = async <T>(url: string, body?: unknown) => {
  const res = await api.post<T>(url, body);
  return res.data;
};

export const apiPut = async <T>(url: string, body?: unknown) => {
  const res = await api.put<T>(url, body);
  return res.data;
};

export const apiPatch = async <T>(url: string, body?: unknown) => {
  const res = await api.patch<T>(url, body);
  return res.data;
};

export const apiDelete = async <T>(url: string) => {
  const res = await api.delete<T>(url);
  return res.data;
};
