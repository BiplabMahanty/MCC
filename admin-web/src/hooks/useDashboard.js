import { useQuery } from '@tanstack/react-query';
import { getDashboardHome, getAnalytics } from '../api/dashboard';

export function useDashboardHome() {
  return useQuery({
    queryKey: ['dashboard-home'],
    queryFn: getDashboardHome,
    staleTime: 60_000,
  });
}

export function useAnalytics(params) {
  return useQuery({
    queryKey: ['analytics', params],
    queryFn: () => getAnalytics(params),
    staleTime: 60_000,
  });
}
