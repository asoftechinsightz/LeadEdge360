'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/src/lib/api';
import { USE_MOCK_API } from '@/src/services/api/config';

export type OrgFeaturesData = {
  orgId?: string;
  orgName?: string;
  planCode?: string;
  features?: string[];
  activeProduct?: string;
};

/**
 * Org plan features from GET /api/users/features.
 */
export function useOrgFeatures() {
  return useQuery({
    queryKey: ['org', 'features'],
    queryFn: () => apiGet<{ success?: boolean; data?: OrgFeaturesData }>('/users/features'),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Check if the current org has a plan feature entitlement.
 */
export function useFeatureFlag(feature: string) {
  const query = useOrgFeatures();
  const features = query.data?.data?.features || [];
  return {
    ...query,
    enabled: features.includes(feature),
    features,
    planCode: query.data?.data?.planCode,
  };
}

/** Whether enterprise LeadEdge modules use mock adapters */
export function useMockApiMode() {
  return {
    isMock: USE_MOCK_API,
    label: USE_MOCK_API ? 'Demo' : 'Live',
  };
}
