import { useQuery } from '@tanstack/react-query';

import { getAdminAnalytics, getAdminDashboard } from '../services/adminApi';

export default function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    staleTime: 30_000,
  });
}

export function useAdminAnalytics(params = {}) {
  return useQuery({
    queryKey: ['admin', 'analytics', params],
    queryFn: ({ signal }) => getAdminAnalytics(params, { signal }),
    staleTime: 30_000,
  });
}
