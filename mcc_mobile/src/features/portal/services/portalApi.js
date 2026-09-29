import { apiRequest } from '../../../services/apiClient';

export function getPortalResource(role, resource, signal) {
  return apiRequest(`/${role}/${resource}`, { auth: true, signal });
}
