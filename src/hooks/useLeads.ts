'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/src/lib/api';
import type { LeadsListResponse } from '@/src/types';

export type UseLeadsParams = Record<string, string | number | undefined>;

export function useLeads(params: UseLeadsParams = {}, options = {}) {
  return useQuery<LeadsListResponse>({
    queryKey: ['leads', params],
    queryFn: () => apiGet<LeadsListResponse>('/leads', params),
    ...options,
  });
}
