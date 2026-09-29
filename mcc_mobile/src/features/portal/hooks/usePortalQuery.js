import { useQuery } from '@tanstack/react-query';

import { getPortalResource } from '../services/portalApi';

export default function usePortalQuery(role, resource, enabled = true) {
  return useQuery({
    queryKey: ['portal', role, resource],
    queryFn: ({ signal }) => getPortalResource(role, resource, signal),
    enabled,
  });
}
