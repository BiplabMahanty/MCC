import { useQuery } from '@tanstack/react-query';

import { getHealth } from '../services/healthApi';

export default function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });
}
